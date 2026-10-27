import os
import io
import json
import torch
import torch.nn.functional as F
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from torchvision import transforms
from dotenv import load_dotenv
import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Load environment variables from .env and frontend/.env if present
load_dotenv()
frontend_env_path = os.path.join(os.path.dirname(__file__), "..", "frontend", ".env")
if os.path.exists(frontend_env_path):
    load_dotenv(frontend_env_path)

from model.vmamba import build_vssm_tiny
from backend.ood_validator import validator
from backend.disease_data import TOMATO_DISEASE_KNOWLEDGE
from backend.crop_registry import (
    CROP_CATALOGUE,
    get_crop_config,
    normalize_crop_id,
    is_crop_model_active,
)
from backend.crop_knowledge import get_crop_advisory

app = FastAPI(title="Smart Crop Advisory System API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and configuration
MODEL = None
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CONFIDENCE_THRESHOLD = 0.70 # Configurable threshold for low confidence

INDEX_TO_CLASS = {
    0: "Bacterial Spot",
    1: "Early Blight",
    2: "Late Blight",
    3: "Leaf Mold",
    4: "Septoria Leaf Spot",
    5: "Spider Mites – Two-Spotted Spider Mite",
    6: "Target Spot",
    7: "Tomato Mosaic Virus",
    8: "Tomato Yellow Leaf Curl Virus",
    9: "Healthy"
}

EVAL_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

MAX_IMAGE_SIZE = 15 * 1024 * 1024  # 15 MB limit

def load_vmamba_model():
    global MODEL
    model_path = os.path.join("model", "best_model.pth")
    try:
        model = build_vssm_tiny(num_classes=10)
        if os.path.exists(model_path):
            checkpoint = torch.load(model_path, map_location=DEVICE, weights_only=False)
            model.load_state_dict(checkpoint["model_state_dict"])
            print(f"Loaded trained fine-tuned VMamba model from {model_path}")
        else:
            ckpt_path = "vssm_tiny_0230_ckpt_epoch_262.pth"
            if os.path.exists(ckpt_path):
                checkpoint = torch.load(ckpt_path, map_location=DEVICE, weights_only=False)
                state_dict = checkpoint.get("model", checkpoint)
                adapted = {}
                for k, v in state_dict.items():
                    if not k.startswith("classifier.head."):
                        new_k = k.replace("downsample.1.", "downsample.conv.").replace("downsample.3.", "downsample.norm.")
                        adapted[new_k] = v
                model.load_state_dict(adapted, strict=False)
                print(f"Loaded pretrained backbone from {ckpt_path}")
            else:
                print("Warning: Neither best_model.pth nor pretrained backbone checkpoint found.")
                MODEL = None
                return None
        model = model.to(DEVICE)
        model.eval()
        MODEL = model
        return MODEL
    except Exception as e:
        print(f"Error loading VMamba model: {e}")
        MODEL = None
        return None

@app.on_event("startup")
def startup_event():
    load_vmamba_model()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "device": str(DEVICE),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "model_loaded": MODEL is not None
    }

@app.get("/api/crops")
def get_supported_crops():
    """Returns catalogue of all 14 major Indian crops and their AI model readiness."""
    return {
        "status": "success",
        "total_crops": len(CROP_CATALOGUE),
        "active_models": [c["name"] for c in CROP_CATALOGUE.values() if c["model_status"] == "active"],
        "crops": list(CROP_CATALOGUE.values())
    }

@app.get("/api/crops/{crop_id}")
def get_crop_details(crop_id: str):
    """Returns crop configuration and grounded ICAR advisory guide."""
    cfg = get_crop_config(crop_id)
    advisory = get_crop_advisory(crop_id)
    return {
        "status": "success",
        "crop": cfg,
        "advisory": advisory
    }

@app.post("/api/predict")
async def predict_disease(file: UploadFile = File(...), crop: str = Form("Tomato")):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file was uploaded in the request.")

    # Validate image extension and content type
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext and ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Only image files (JPEG, PNG, WebP) are accepted."
        )

    if file.content_type and not (file.content_type.startswith("image/") or file.content_type == "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only image files (JPEG/PNG) are accepted.")

    try:
        image_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {str(e)}")

    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")

    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Image size ({len(image_bytes)/(1024*1024):.1f} MB) exceeds maximum allowed size of 15 MB."
        )

    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse image: {str(e)}")

    # 1. Resolve crop and crop configuration
    crop_id = normalize_crop_id(crop)
    crop_config = get_crop_config(crop_id)
    crop_name = crop_config.get("name", crop.strip().title() if crop else "Crop")

    # 2. Leaf Quality / Out-of-Scope Validation for all crops
    is_valid, validation_msg = validator.validate(pil_img)
    if not is_valid:
        return {
            "status": "unable_to_detect",
            "uncertain": True,
            "message": validation_msg
        }

    # 3. Model Inference: Dedicated VMamba Tiny for Tomato, MultiCrop Pathology Vision Engine for other crops
    if crop_id == "tomato":
        if MODEL is None:
            load_vmamba_model()
        if MODEL is None:
            raise HTTPException(status_code=503, detail="AI Disease Detection model is currently unavailable on the server.")

        try:
            input_tensor = EVAL_TRANSFORM(pil_img).unsqueeze(0).to(DEVICE)
            with torch.no_grad():
                outputs = MODEL(input_tensor)
                probs = F.softmax(outputs, dim=1)
                top_prob, top_idx = torch.max(probs, dim=1)

            predicted_idx = top_idx.item()
            confidence = float(top_prob.item())
            predicted_disease = INDEX_TO_CLASS.get(predicted_idx, "Unknown Disease")

            top3_probs, top3_indices = torch.topk(probs, k=min(3, probs.size(1)), dim=1)
            top_probabilities = [
                {"disease": INDEX_TO_CLASS.get(idx.item(), f"Class {idx.item()}"), "probability": round(float(p.item()), 4)}
                for p, idx in zip(top3_probs[0], top3_indices[0])
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Model inference failed: {str(e)}")

        # Low Confidence Handling
        if confidence < CONFIDENCE_THRESHOLD:
            return {
                "status": "uncertain",
                "uncertain": True,
                "disease": predicted_disease,
                "confidence": round(confidence, 4),
                "top_probabilities": top_probabilities,
                "message": "Result is uncertain. Please upload a clearer image or consult an agricultural expert."
            }

        # Healthy Prediction Handling
        if predicted_disease == "Healthy":
            return {
                "status": "success",
                "uncertain": False,
                "is_model_active": True,
                "disease": "Healthy",
                "is_healthy": True,
                "crop": crop_name,
                "confidence": round(confidence, 4),
                "top_probabilities": top_probabilities,
                "message": f"The {crop_name.lower()} leaf appears healthy. No disease detected."
            }

        # Fetch Matching Disease Knowledge for Tomato
        base_info = TOMATO_DISEASE_KNOWLEDGE.get(predicted_disease, {
            "crop_name": crop_name,
            "disease_name": predicted_disease,
            "symptoms": "Please consult your local agricultural extension office.",
            "source": "ICAR Agricultural Advisory"
        })
        disease_info = dict(base_info)
        disease_info["crop_name"] = crop_name

        return {
            "status": "success",
            "uncertain": False,
            "is_model_active": True,
            "disease": predicted_disease,
            "crop": crop_name,
            "confidence": round(confidence, 4),
            "top_probabilities": top_probabilities,
            "disease_info": disease_info
        }
    else:
        # Non-tomato crop: Run Multi-Crop Vision Pathology Classifier
        from backend.multi_crop_classifier import multi_crop_classifier
        result = multi_crop_classifier.classify(pil_img, crop_id, crop_config)
        result["is_model_active"] = True
        return result


# ----------------------------------------------------
# COMMUNITY GROQ WARNING GENERATION ENDPOINT
# ----------------------------------------------------

from typing import Optional, Dict
from pydantic import BaseModel
from backend.groq_service import generate_community_warning

class GenerateWarningRequest(BaseModel):
    crop_name: str = "Tomato"
    disease_name: str
    district: str = "Kolar"
    disease_info: Optional[Dict] = None

@app.post("/api/community/generate-warning")
def generate_warning_endpoint(req: GenerateWarningRequest):
    disease_info = req.disease_info or TOMATO_DISEASE_KNOWLEDGE.get(req.disease_name, {
        "crop_name": req.crop_name,
        "disease_name": req.disease_name,
        "what_is_it": f"A common crop infection affecting {req.crop_name}.",
        "symptoms": "Visual leaf spots or abnormal growth.",
        "what_to_do_now": "Prune infected leaves and isolate affected plants."
    })

    warning = generate_community_warning(
        crop_name=req.crop_name,
        disease_name=req.disease_name,
        district=req.district,
        disease_info=disease_info
    )

    return {
        "status": "success",
        "warning_title": warning.get("warning_title", req.disease_name),
        "warning_message": warning.get("warning_message", "")
    }

import backend.community_service as comm_svc

class CreateCommunityReportRequest(BaseModel):
    farmer_id: Optional[str] = "anonymous"
    author_name: Optional[str] = "Local Farmer"
    district: str = "Kolar"
    taluk: Optional[str] = ""
    village: Optional[str] = ""
    crop_name: str
    disease_name: str
    warning_title: Optional[str] = None
    warning_message: str
    severity: Optional[str] = "Moderate"

@app.get("/api/community/reports")
def get_community_reports_endpoint(district: Optional[str] = None):
    reports = comm_svc.get_community_reports(district=district)
    return {"status": "success", "reports": reports, "count": len(reports)}

@app.post("/api/community/reports")
def create_community_report_endpoint(req: CreateCommunityReportRequest):
    new_report = comm_svc.add_community_report(req.model_dump())
    return {"status": "success", "data": new_report}

@app.post("/api/community/reports/{report_id}/upvote")
def upvote_report_endpoint(report_id: int):
    new_count = comm_svc.upvote_community_report(report_id)
    return {"status": "success", "upvotes": new_count}

class SaveDiagnosisRequest(BaseModel):
    user_id: str
    crop: str
    disease: str
    confidence: float
    image_name: Optional[str] = ""

@app.post("/api/reports/save-diagnosis")
def save_diagnosis_endpoint(req: SaveDiagnosisRequest):
    res = comm_svc.save_diagnosis_history(
        user_id=req.user_id,
        crop=req.crop,
        disease=req.disease,
        confidence=req.confidence,
        image_name=req.image_name or ""
    )
    return {"status": "success", "data": res}

@app.get("/api/reports/history")
def get_diagnosis_history_endpoint(user_id: Optional[str] = ""):
    history = comm_svc.get_diagnosis_history(user_id=user_id or "")
    return {"status": "success", "history": history}

@app.get("/api/reports")
def get_evaluation_reports():
    reports_path = os.path.join(BASE_DIR, "reports", "metrics.json")
    if not os.path.exists(reports_path):
        reports_path = os.path.join("reports", "metrics.json")
    if os.path.exists(reports_path):
        with open(reports_path, "r") as f:
            data = json.load(f)
        return data
    else:
        return {
            "status": "pending",
            "message": "Model evaluation metrics pending completed training."
        }

# ----------------------------------------------------
# PRICE PREDICTION ENDPOINTS
# ----------------------------------------------------

from backend.price_service import (
    get_available_markets,
    get_available_commodities,
    fetch_current_mandi_price,
    run_price_prediction,
)

class PricePredictRequest(BaseModel):
    market: str = "Bengaluru APMC"
    commodity: str = "Onion"

@app.get("/api/price/markets")
def get_price_markets():
    return {"status": "success", "markets": get_available_markets()}

@app.get("/api/price/commodities")
def get_price_commodities(market: Optional[str] = None):
    return {"status": "success", "commodities": get_available_commodities(market)}

@app.get("/api/price/current")
def get_price_current(market: str = "Bengaluru APMC", commodity: str = "Onion"):
    price_info = fetch_current_mandi_price(market, commodity)
    if not price_info:
        return {
            "status": "unavailable",
            "message": f"Live Mandi price currently unavailable for {market} ({commodity})."
        }
    return {"status": "success", "data": price_info}

@app.post("/api/price/predict")
def predict_price_post(req: PricePredictRequest):
    try:
        res = run_price_prediction(req.market, req.commodity)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Price forecasting model is currently unavailable on the server.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Price forecasting error: {str(e)}")

@app.get("/api/price/predict")
def predict_price_get(market: str = "Bengaluru APMC", commodity: str = "Onion"):
    try:
        res = run_price_prediction(market, commodity)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Price forecasting model is currently unavailable on the server.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Price forecasting error: {str(e)}")

# ----------------------------------------------------
# REGIONAL AGRO-CLIMATIC CROP INTELLIGENCE ENDPOINTS
# ----------------------------------------------------
from backend.regional_advisory import get_regional_advisory, list_available_regions

@app.get("/api/regional-advisory")
def get_regional_advisory_endpoint(area: str = "Kolar", district: Optional[str] = None, taluk: Optional[str] = None):
    data = get_regional_advisory(area, district=district, taluk=taluk)
    return {"status": "success", "data": data}

@app.get("/api/regional-advisory/regions")
def get_available_regions_endpoint():
    regions = list_available_regions()
    return {"status": "success", "regions": regions}

# ----------------------------------------------------
# CROP YIELD PREDICTION ENDPOINTS
# ----------------------------------------------------

from backend.yield_service import predict_crop_yield, get_yield_model

class YieldPredictRequest(BaseModel):
    crop: str = "Tomato"
    state: str = "Karnataka"
    season: str = "Kharif"
    area_hectares: float = 1.0
    soil_type: str = "Loamy"
    temperature: Optional[float] = 26.5
    humidity: Optional[float] = 65.0
    rainfall: Optional[float] = 750.0
    soil_ph: Optional[float] = 6.5
    soil_moisture: Optional[float] = 60.0
    irrigation: Optional[bool] = True

@app.get("/api/yield/metadata")
def get_yield_metadata_endpoint():
    _, metadata = get_yield_model()
    return {"status": "success", "metadata": metadata}

@app.post("/api/yield/predict")
@app.post("/api/v1/yield/predict")
def predict_yield_endpoint(req: YieldPredictRequest):
    try:
        res = predict_crop_yield(
            crop=req.crop,
            state=req.state,
            season=req.season,
            area_hectares=req.area_hectares,
            soil_type=req.soil_type,
            temperature=req.temperature if req.temperature is not None else 26.5,
            humidity=req.humidity if req.humidity is not None else 65.0,
            rainfall=req.rainfall if req.rainfall is not None else 750.0,
            soil_ph=req.soil_ph if req.soil_ph is not None else 6.5,
            soil_moisture=req.soil_moisture if req.soil_moisture is not None else 60.0,
            irrigation=req.irrigation if req.irrigation is not None else True,
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crop yield prediction failed: {str(e)}")

# ----------------------------------------------------
# FARMER AUTHENTICATION & PROFILE ENDPOINTS
# ----------------------------------------------------

from backend.auth_service import (
    register_user, login_user, reset_password, get_user_from_token, logout_user,
    get_profile_by_user_id, update_profile
)

class AuthSignupRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = "Farmer"
    district: Optional[str] = "Kolar"
    taluk: Optional[str] = None
    village: Optional[str] = None
    state: Optional[str] = "Karnataka"
    main_crop: Optional[str] = "Tomato"
    phone: Optional[str] = ""

class AuthLoginRequest(BaseModel):
    email: str
    password: str

class AuthResetPasswordRequest(BaseModel):
    email: str
    new_password: str

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    mobile_number: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    state: Optional[str] = None
    primary_crops: Optional[str] = None
    main_crop: Optional[str] = None
    preferred_language: Optional[str] = None
    land_size: Optional[str] = None
    farming_type: Optional[str] = None
    experience_years: Optional[int] = None

def _extract_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return authorization

@app.post("/api/auth/register")
@app.post("/api/auth/signup")
def auth_register_endpoint(req: AuthSignupRequest):
    try:
        res = register_user(
            email=req.email,
            password=req.password,
            extra_data={
                "full_name": req.full_name,
                "district": req.district,
                "state": req.state,
                "main_crop": req.main_crop,
                "phone": req.phone
            }
        )
        return {"status": "success", **res}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

@app.post("/api/auth/login")
def auth_login_endpoint(req: AuthLoginRequest):
    try:
        res = login_user(email=req.email, password=req.password)
        return {"status": "success", **res}
    except ValueError as ve:
        raise HTTPException(status_code=401, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}")

@app.post("/api/auth/reset-password")
def auth_reset_password_endpoint(req: AuthResetPasswordRequest):
    try:
        res = reset_password(email=req.email, new_password=req.new_password)
        return {"status": "success", **res}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password update error: {str(e)}")

@app.get("/api/auth/me")
def auth_me_endpoint(authorization: Optional[str] = Header(None)):
    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required.")
    user = get_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid.")
    profile = get_profile_by_user_id(user["id"])
    return {"status": "success", "user": user, "profile": profile}

@app.post("/api/auth/logout")
def auth_logout_endpoint(authorization: Optional[str] = Header(None)):
    token = _extract_token(authorization)
    if token:
        logout_user(token)
    return {"status": "success", "message": "Logged out successfully"}

@app.get("/api/auth/profile/{user_id}")
def auth_get_profile_endpoint(user_id: str):
    profile = get_profile_by_user_id(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found.")
    return {"status": "success", "profile": profile}

@app.put("/api/auth/profile")
def auth_update_profile_endpoint(req: ProfileUpdateRequest, authorization: Optional[str] = Header(None)):
    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required.")
    user = get_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid.")
    updated = update_profile(user["id"], req.dict(exclude_unset=True))
    return {"status": "success", "profile": updated}






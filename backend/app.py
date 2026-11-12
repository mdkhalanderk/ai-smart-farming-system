import os
import io
import gc
import json
import time
import numpy as np
from PIL import Image
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Header, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
import sys
from typing import Optional, Dict, Any, List, Tuple
from pydantic import BaseModel

LOW_MEMORY_MODE = os.getenv("LOW_MEMORY_MODE", "false").lower() == "true"

try:
    import onnxruntime as ort
except ImportError:
    ort = None

if not LOW_MEMORY_MODE:
    try:
        import torch
        import torch.nn.functional as F
        from torchvision import transforms
    except ImportError:
        torch = None
        F = None
        transforms = None
else:
    torch = None
    F = None
    transforms = None
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

from backend.ood_validator import validator
from backend.disease_data import TOMATO_DISEASE_KNOWLEDGE, CROP_DISEASE_DATABASE
from backend.crop_registry import (
    CROP_CATALOGUE,
    get_crop_config,
    normalize_crop_id,
    is_crop_model_active,
)
from backend.crop_knowledge import get_crop_advisory

app = FastAPI(title="Smart Crop Advisory System API", version="1.0.0")

# Enable CORS for frontend (supports explicit ALLOWED_ORIGINS or wildcard regex with credentials)
raw_origins = os.getenv("ALLOWED_ORIGINS", "").strip()
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()] if raw_origins else []
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=None if allowed_origins else r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enable response compression for payloads > 1KB
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Production security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Production unhandled exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "An internal server error occurred. Please contact system administrator or try again.",
            "path": request.url.path
        }
    )

# Static uploads mount for media, alert photographs and chat attachments
DATA_DIR = os.getenv("APP_DATA_DIR") or BACKEND_DIR
uploads_dir = os.path.join(DATA_DIR, "uploads")
os.makedirs(os.path.join(uploads_dir, "alert-photos"), exist_ok=True)
os.makedirs(os.path.join(uploads_dir, "chat-photos"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

import backend.auth_service
import backend.community_service
import backend.supabase_service as supa_svc

def _extract_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return authorization

def _resolve_user(authorization: Optional[str]) -> Optional[Dict[str, Any]]:
    token = _extract_token(authorization)
    if not token:
        return None
    try:
        user = supa_svc.verify_supabase_token(token)
        if user:
            return user
    except Exception as e:
        logging.warning(f"Supabase token verification note: {e}")
    try:
        from backend.auth_service import get_user_from_token
        return get_user_from_token(token)
    except Exception:
        return None

# Global variables for model and configuration
MODEL = None
MODEL_BACKEND = None
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu") if torch is not None else "cpu"
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

# Multi-Crop Class Registry for VMamba VSSM Architecture
MULTICROP_CLASSES_FILE = os.path.join(BASE_DIR, "model", "multicrop_classes.json")
MULTICROP_CLASSES = []
CROP_TO_INDICES = {}
INDEX_TO_MULTICROP = {}

if os.path.exists(MULTICROP_CLASSES_FILE):
    try:
        with open(MULTICROP_CLASSES_FILE, "r", encoding="utf-8") as f:
            mc_data = json.load(f)
            MULTICROP_CLASSES = mc_data.get("classes", [])
            CROP_TO_INDICES = mc_data.get("crop_to_indices", {})
            for item in MULTICROP_CLASSES:
                INDEX_TO_MULTICROP[item["index"]] = item
    except Exception as e:
        print(f"Notice: Failed to load multicrop classes: {e}")

def _normalize_crop_to_nchw(cropped_img: Image.Image) -> np.ndarray:
    arr = np.asarray(cropped_img, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    arr = (arr - mean) / std
    arr = np.transpose(arr, (2, 0, 1))
    return np.expand_dims(arr, axis=0).astype(np.float32)


def preprocess_image_numpy(pil_img: Image.Image) -> np.ndarray:
    """Aspect-ratio-preserving Resize(256) + CenterCrop(224) + ImageNet Normalize."""
    w, h = pil_img.size
    if w == 0 or h == 0:
        return _normalize_crop_to_nchw(pil_img.resize((224, 224), Image.BILINEAR))
    scale = 256.0 / min(w, h)
    new_w, new_h = max(224, int(round(w * scale))), max(224, int(round(h * scale)))
    resized = pil_img.resize((new_w, new_h), Image.BILINEAR)
    left = (new_w - 224) // 2
    top = (new_h - 224) // 2
    cropped = resized.crop((left, top, left + 224, top + 224))
    return _normalize_crop_to_nchw(cropped)


def preprocess_tta_views(pil_img: Image.Image) -> List[np.ndarray]:
    """Generates 2 aspect-preserved views (standard center + tight leaf zoom) for TTA."""
    view1 = preprocess_image_numpy(pil_img)
    w, h = pil_img.size
    if w > 0 and h > 0:
        crop_side = int(round(min(w, h) * 0.78))
        left = max(0, (w - crop_side) // 2)
        top = max(0, (h - crop_side) // 2)
        tight = pil_img.crop((left, top, left + crop_side, top + crop_side)).resize((224, 224), Image.BILINEAR)
        view2 = _normalize_crop_to_nchw(tight)
        return [view1, view2]
    return [view1]

MAX_IMAGE_SIZE = 15 * 1024 * 1024  # 15 MB limit

def load_vmamba_model():
    global MODEL, MODEL_BACKEND, INDEX_TO_CLASS

    if LOW_MEMORY_MODE:
        try:
            import backend.price_service as price_svc
            price_svc.unload_price_model()
        except Exception:
            pass

    onnx_path = os.path.join(BASE_DIR, "model", "vmamba_int8.onnx")
    if ort is not None and os.path.exists(onnx_path) and (LOW_MEMORY_MODE or torch is None):
        try:
            sess_opts = ort.SessionOptions()
            sess_opts.intra_op_num_threads = 1
            sess_opts.inter_op_num_threads = 1
            MODEL = ort.InferenceSession(onnx_path, sess_options=sess_opts, providers=["CPUExecutionProvider"])
            MODEL_BACKEND = "onnx"
            gc.collect()
            print(f"Loaded quantized ONNX INT8 VMamba model from {onnx_path}")
            return MODEL
        except Exception as e:
            print(f"Warning: ONNX Runtime load failed ({e}), trying PyTorch...")

    if torch is None:
        print("Warning: Neither ONNX Runtime model nor PyTorch is available.")
        MODEL = None
        return None

    from model.vmamba import build_vssm_tiny
    model_path = os.path.join(BASE_DIR, "model", "best_multicrop_model.pth")
    if not os.path.exists(model_path):
        model_path = os.path.join(BASE_DIR, "model", "best_model.pth")

    try:
        if LOW_MEMORY_MODE:
            torch.set_num_threads(1)

        if os.path.exists(model_path):
            checkpoint = torch.load(model_path, map_location=DEVICE, weights_only=False)
            num_classes = checkpoint.get("num_classes", len(MULTICROP_CLASSES) if MULTICROP_CLASSES else 10)
            model = build_vssm_tiny(num_classes=num_classes)
            model.load_state_dict(checkpoint["model_state_dict"])
            del checkpoint
            gc.collect()
            print(f"Loaded trained fine-tuned VMamba model ({num_classes} classes) from {model_path}")
        else:
            ckpt_path = os.path.join(BASE_DIR, "vssm_tiny_0230_ckpt_epoch_262.pth")
            if os.path.exists(ckpt_path):
                model = build_vssm_tiny(num_classes=10)
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
        MODEL_BACKEND = "torch"
        return MODEL
    except Exception as e:
        print(f"Error loading VMamba model: {e}")
        MODEL = None
        return None

def resolve_disease_advisory(crop_id: str, crop_name: str, disease_name: str) -> Dict[str, Any]:
    """Retrieves authoritative ICAR grounded advisory information across any crop and pathology."""
    # 1. Direct tomato database
    if crop_id == "tomato" and disease_name in TOMATO_DISEASE_KNOWLEDGE:
        info = dict(TOMATO_DISEASE_KNOWLEDGE[disease_name])
        info["crop_name"] = crop_name
        return info

    # 2. Multi-crop database lookup
    crop_db = CROP_DISEASE_DATABASE.get(crop_id, {})
    for db_key, db_val in crop_db.items():
        if disease_name.lower() in db_key.lower() or db_key.lower() in disease_name.lower():
            info = dict(db_val)
            info["crop_name"] = crop_name
            return info

    # 3. Multi-crop knowledge module lookup
    multi_adv = get_crop_advisory(crop_id)
    if multi_adv and "common_diseases" in multi_adv:
        for d in multi_adv["common_diseases"]:
            if disease_name.lower() in d.get("name", "").lower():
                return {
                    "crop_name": crop_name,
                    "disease_name": disease_name,
                    "what_is_it": d.get("symptoms", f"{disease_name} affecting {crop_name}."),
                    "symptoms": d.get("symptoms", "Visual foliar lesions or abnormal plant growth."),
                    "why_it_happens": "Pathogen infection accelerated by humid conditions and canopy wetness.",
                    "how_it_spreads": "Dispersed via air currents, splashing rainfall, and mechanical contact.",
                    "favorable_conditions": "High relative humidity (>80%) and temperatures between 22°C - 30°C.",
                    "what_to_do_now": d.get("treatment", "Prune diseased foliage and apply certified protective fungicidal spray."),
                    "how_to_prevent": d.get("prevention", "Maintain wide row spacing, practice crop rotation, and avoid overhead watering."),
                    "management_treatment": d.get("treatment", "Consult local Krishi Vigyan Kendra (KVK) for recommended spray schedule."),
                    "source": f"ICAR Agricultural Advisory for {crop_name}"
                }

    # 4. Standard ICAR Expert Advisory Template
    return {
        "crop_name": crop_name,
        "disease_name": disease_name,
        "what_is_it": f"{disease_name} identified on {crop_name} foliage.",
        "symptoms": f"Visual symptoms associated with {disease_name}.",
        "why_it_happens": "Caused by localized plant pathogen or pest infestation.",
        "how_it_spreads": "Transmitted via wind, soil contact, and rain splash.",
        "favorable_conditions": "High humidity and dense crop canopy.",
        "what_to_do_now": "Isolate affected plants, prune heavily symptomatic leaves, and avoid overhead sprinkler watering.",
        "how_to_prevent": "Use certified disease-free seeds, practice crop rotation, and ensure adequate field drainage.",
        "management_treatment": "Consult the nearest Krishi Vigyan Kendra (KVK) or Agriculture University extension officer.",
        "source": f"ICAR Agricultural Extension Service ({crop_name})"
    }

def _trim_memory():
    """Forces Python GC and asks Linux glibc to return freed C++ arenas to OS."""
    gc.collect()
    try:
        import ctypes
        ctypes.CDLL("libc.so.6").malloc_trim(0)
    except Exception:
        pass

@app.on_event("startup")
def startup_event():
    if not LOW_MEMORY_MODE:
        load_vmamba_model()

@app.get("/")
def root_endpoint():
    return {
        "name": "Smart Crop Advisory System API",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/health"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    model_ready = MODEL is not None or os.path.exists(os.path.join(BASE_DIR, "model", "vmamba_int8.onnx"))
    return {
        "status": "healthy",
        "device": str(DEVICE),
        "gpu_name": torch.cuda.get_device_name(0) if (torch is not None and torch.cuda.is_available()) else "CPU",
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "model_loaded": model_ready
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

    # 3. Model Inference: Dedicated VMamba Tiny for Supported Crops
    if crop_id in CROP_TO_INDICES:
        if MODEL is None:
            load_vmamba_model()
        if MODEL is None:
            raise HTTPException(status_code=503, detail="AI Disease Detection model is currently unavailable on the server.")

        try:
            tta_views = preprocess_tta_views(pil_img)
            crop_indices = CROP_TO_INDICES[crop_id]
            probs_accum = None
            temperature = 1.20

            for input_arr in tta_views:
                if MODEL_BACKEND == "onnx":
                    outputs = MODEL.run(["logits"], {"input": input_arr})[0]
                else:
                    with torch.no_grad():
                        input_tensor = torch.from_numpy(input_arr).to(DEVICE)
                        outputs = MODEL(input_tensor).cpu().numpy()

                crop_logits = outputs[0, crop_indices] / temperature
                exp_logits = np.exp(crop_logits - np.max(crop_logits))
                view_probs = exp_logits / np.sum(exp_logits)
                probs_accum = view_probs if probs_accum is None else (probs_accum + view_probs)

            probs = probs_accum / len(tta_views)

            top_local_idx = int(np.argmax(probs))
            confidence = float(probs[top_local_idx])
            global_idx = crop_indices[top_local_idx]
            meta = INDEX_TO_MULTICROP.get(global_idx, {})
            predicted_disease = meta.get("disease_name", "Unknown Disease")
            is_healthy = meta.get("is_healthy", False)

            k_candidates = min(3, len(probs))
            topk_local = np.argsort(probs)[::-1][:k_candidates]
            top_probabilities = [
                {
                    "disease": INDEX_TO_MULTICROP.get(crop_indices[int(loc_idx)], {}).get("disease_name", f"Class {int(loc_idx)}"),
                    "probability": round(float(probs[int(loc_idx)]), 4)
                }
                for loc_idx in topk_local
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Model inference failed: {str(e)}")

        # Low Confidence Handling (lower threshold for 58-class fine-tuned model)
        if confidence < 0.25:
            return {
                "status": "uncertain",
                "uncertain": True,
                "disease": predicted_disease,
                "confidence": round(confidence, 4),
                "top_probabilities": top_probabilities,
                "message": "Result is uncertain. Please upload a clearer image or consult an agricultural expert."
            }

        # Healthy Prediction Handling
        if is_healthy or predicted_disease.lower() == "healthy":
            return {
                "status": "success",
                "uncertain": False,
                "is_model_active": True,
                "model_architecture": "VMamba / VSSM Tiny (Visual State Space Model)",
                "disease": "Healthy",
                "is_healthy": True,
                "crop": crop_name,
                "confidence": round(confidence, 4),
                "top_probabilities": top_probabilities,
                "message": f"The {crop_name.lower()} leaf appears healthy. No disease detected."
            }

        # Fetch Matching Disease Knowledge across ICAR databases
        disease_info = resolve_disease_advisory(crop_id, crop_name, predicted_disease)

        return {
            "status": "success",
            "uncertain": False,
            "is_model_active": True,
            "model_architecture": "VMamba / VSSM Tiny (Visual State Space Model)",
            "disease": predicted_disease,
            "crop": crop_name,
            "confidence": round(confidence, 4),
            "top_probabilities": top_probabilities,
            "disease_info": disease_info
        }
    else:
        # Non-trained crop: Run Multi-Crop Vision Pathology Classifier
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

# -------------------------------------------------------------------------
# ADVANCED COMMUNITY ALERTS & FARMER-TO-FARMER COMMUNITY PLATFORM
# -------------------------------------------------------------------------

class CreateAlertRequest(BaseModel):
    title: str
    description: str
    crop: str
    district: str
    taluk: Optional[str] = ""
    village: Optional[str] = ""
    danger_level: Optional[str] = "Medium"
    photo_url: Optional[str] = None
    author_name: Optional[str] = None
    author_phone: Optional[str] = None

class CreateConversationRequest(BaseModel):
    alert_id: str
    receiver_id: Optional[str] = None

class SendChatMessageRequest(BaseModel):
    content: Optional[str] = ""
    photo_url: Optional[str] = None

@app.get("/api/community/alerts")
def get_community_alerts_endpoint(
    district: Optional[str] = None,
    crop: Optional[str] = None,
    danger_level: Optional[str] = None,
    sort_by: str = "priority",
    user_district: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 12,
    offset: int = 0,
    authorization: Optional[str] = Header(None)
):
    if not user_district and authorization:
        user = _resolve_user(authorization)
        if user:
            prof = supa_svc.get_or_create_farmer_profile(user["id"], user.get("email", ""))
            user_district = prof.get("district")

    res = supa_svc.get_community_alerts(
        district=district,
        crop=crop,
        danger_level=danger_level,
        sort_by=sort_by,
        user_district=user_district,
        search=search,
        limit=limit,
        offset=offset
    )
    return {
        "status": "success",
        "alerts": res.get("alerts", []),
        "total_count": res.get("total", len(res.get("alerts", []))),
        "has_more": res.get("has_more", False)
    }

@app.post("/api/community/alerts")
def create_community_alert_endpoint(req: CreateAlertRequest, authorization: Optional[str] = Header(None)):
    user_dict = _resolve_user(authorization) if authorization else None
    if not user_dict:
        user_dict = {
            "id": f"farmer_{int(time.time())}",
            "email": "farmer@krishidrishti.local",
            "name": req.author_name or "Local Farmer"
        }

    alert_data = req.model_dump()
    new_alert = supa_svc.create_community_alert(alert_data, user_dict)

    try:
        supa_svc.dispatch_alert_notifications(new_alert)
    except Exception as e:
        logging.warning(f"Notification dispatch warning: {e}")

    return {"status": "success", "alert": new_alert}

@app.get("/api/community/alerts/{alert_id}")
def get_single_alert_endpoint(alert_id: str, user_district: Optional[str] = None):
    res = supa_svc.get_community_alerts(user_district=user_district, limit=100)
    for a in res["alerts"]:
        if a["id"] == alert_id:
            return {"status": "success", "alert": a}
    raise HTTPException(status_code=404, detail="Community alert not found.")

@app.post("/api/community/alerts/{alert_id}/upvote")
def upvote_alert_endpoint(alert_id: str):
    new_count = supa_svc.upvote_alert(alert_id)
    return {"status": "success", "upvotes": new_count}

@app.post("/api/community/upload")
async def upload_community_file_endpoint(
    file: UploadFile = File(...),
    bucket: str = Form("alert-photos"),
    authorization: Optional[str] = Header(None)
):
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type and file.content_type.lower() not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed.")

    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum image size is 5MB.")

    token = _extract_token(authorization)
    result = supa_svc.upload_file_to_storage(
        file_bytes=file_bytes,
        original_filename=file.filename or "upload.jpg",
        content_type=file.content_type or "image/jpeg",
        bucket=bucket,
        token=token
    )
    return {"status": "success", **result}

@app.get("/api/community/farmers")
def list_community_farmers_endpoint(authorization: Optional[str] = Header(None)):
    user = _resolve_user(authorization) if authorization else None
    user_id = user["id"] if user else None
    farmers = supa_svc.list_community_farmers(exclude_user_id=user_id)
    return {"status": "success", "farmers": farmers}

@app.get("/api/community/conversations")
def get_user_conversations_endpoint(authorization: Optional[str] = Header(None)):
    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required.")
    user = _resolve_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication session.")

    convs = supa_svc.get_user_conversations(user["id"])
    return {"status": "success", "conversations": convs}

@app.post("/api/community/conversations")
def create_conversation_endpoint(req: CreateConversationRequest, authorization: Optional[str] = Header(None)):
    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required.")
    user = _resolve_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication session.")

    conv = supa_svc.create_or_get_conversation(
        alert_id=req.alert_id,
        user_id=user["id"],
        other_user_id=req.receiver_id
    )
    return {"status": "success", "conversation": conv}

@app.get("/api/community/conversations/{conv_id}/messages")
def get_conversation_messages_endpoint(conv_id: str, authorization: Optional[str] = Header(None)):
    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required.")
    user = _resolve_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication session.")

    messages = supa_svc.get_conversation_messages(conv_id, user["id"])
    return {"status": "success", "messages": messages}

@app.post("/api/community/conversations/{conv_id}/messages")
def send_chat_message_endpoint(conv_id: str, req: SendChatMessageRequest, authorization: Optional[str] = Header(None)):
    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required.")
    user = _resolve_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication session.")

    if not req.content and not req.photo_url:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    msg = supa_svc.send_chat_message(
        conv_id=conv_id,
        sender_id=user["id"],
        message_text=req.content or "",
        photo_url=req.photo_url
    )
    return {"status": "success", "message": msg}

@app.get("/api/community/notifications")
def get_user_notifications_endpoint(authorization: Optional[str] = Header(None)):
    token = _extract_token(authorization)
    if not token:
        return {"status": "success", "notifications": [], "unread_count": 0}
    user = _resolve_user(authorization)
    if not user:
        return {"status": "success", "notifications": [], "unread_count": 0}

    notifs = supa_svc.get_user_notifications(user["id"])
    unread = sum(1 for n in notifs if not n.get("is_read"))
    return {"status": "success", "notifications": notifs, "unread_count": unread}

@app.put("/api/community/notifications/{notif_id}/read")
def mark_notification_read_endpoint(notif_id: str, authorization: Optional[str] = Header(None)):
    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required.")
    user = _resolve_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required.")

    supa_svc.mark_notification_read(notif_id, user["id"])
    return {"status": "success"}

@app.put("/api/community/notifications/read-all")
def mark_all_notifications_read_endpoint(authorization: Optional[str] = Header(None)):
    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required.")
    user = _resolve_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required.")

    supa_svc.mark_all_notifications_read(user["id"])
    return {"status": "success"}


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
# MODEL EVALUATION & PERFORMANCE ANALYSIS ENDPOINTS
# ----------------------------------------------------
import backend.evaluation_service as eval_svc

@app.get("/api/evaluation/all")
def get_all_evaluation_endpoint():
    """Returns evaluation metrics, confusion matrices, and reports for all 3 models + overall."""
    return eval_svc.get_all_evaluations()

@app.get("/api/evaluation/disease")
def get_disease_evaluation_endpoint():
    """Returns multiclass confusion matrix and classification report for Disease Detection."""
    return eval_svc.get_disease_evaluation()

@app.get("/api/evaluation/price")
def get_price_evaluation_endpoint():
    """Returns regression metrics (MAE/RMSE/R2) and 3-class confusion matrix for Price Prediction."""
    return eval_svc.get_price_evaluation()

@app.get("/api/evaluation/yield")
def get_yield_evaluation_endpoint():
    """Returns regression metrics (MAE/RMSE/R2) and 3-class confusion matrix for Yield Prediction."""
    return eval_svc.get_yield_evaluation()

@app.get("/api/evaluation/overall")
def get_overall_evaluation_endpoint():
    """Returns executive summary and system-level binary confusion matrix across all models."""
    return eval_svc.get_overall_evaluation()

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

def _run_price_safe(market: str, commodity: str):
    global MODEL, MODEL_BACKEND
    if LOW_MEMORY_MODE and MODEL is not None:
        MODEL = None
        MODEL_BACKEND = None
        _trim_memory()
    return run_price_prediction(market, commodity)

@app.post("/api/price/predict")
def predict_price_post(req: PricePredictRequest):
    try:
        res = _run_price_safe(req.market, req.commodity)
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
        res = _run_price_safe(market, commodity)
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
    user = _resolve_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid.")
    user_id = str(user.get("id", ""))
    email = user.get("email", "")
    profile = supa_svc.get_or_create_farmer_profile(user_id, email)
    return {"status": "success", "user": user, "profile": profile}

@app.post("/api/auth/logout")
def auth_logout_endpoint(authorization: Optional[str] = Header(None)):
    token = _extract_token(authorization)
    if token:
        try:
            logout_user(token)
        except Exception:
            pass
    return {"status": "success", "message": "Logged out successfully"}

@app.get("/api/auth/profile/{user_id}")
def auth_get_profile_endpoint(user_id: str):
    profile = supa_svc.get_or_create_farmer_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found.")
    return {"status": "success", "profile": profile}

@app.put("/api/auth/profile")
def auth_update_profile_endpoint(req: ProfileUpdateRequest, authorization: Optional[str] = Header(None)):
    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required.")
    user = _resolve_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid.")
    user_id = str(user.get("id", ""))
    updates = req.model_dump(exclude_unset=True)
    updated = supa_svc.update_farmer_profile(user_id, updates)
    return {"status": "success", "profile": updated}

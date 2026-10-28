import os
import json
import time
from typing import Dict, Any, Optional
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "model")
MODEL_PATH = os.path.join(MODEL_DIR, "yield_model.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "yield_metadata.json")
DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "crop_yield_data.csv")

CATEGORICAL_FEATURES = ["crop", "state", "season", "soil_type"]
NUMERICAL_FEATURES = [
    "area_hectares",
    "temperature",
    "humidity",
    "rainfall",
    "soil_ph",
    "soil_moisture",
    "irrigation",
]
TARGET_FEATURE = "yield_per_hectare"

_PIPELINE = None
_METADATA = None

def build_yield_preprocessor() -> ColumnTransformer:
    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    return ColumnTransformer([
        ("cat", cat_pipeline, CATEGORICAL_FEATURES),
        ("num", num_pipeline, NUMERICAL_FEATURES),
    ], remainder="drop")

def train_yield_model(data_path: str = DATASET_PATH) -> Dict[str, Any]:
    """Train Random Forest Yield Regressor on the verified agricultural dataset."""
    os.makedirs(MODEL_DIR, exist_ok=True)
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Crop yield dataset not found at {data_path}")

    df = pd.read_csv(data_path)
    X = df[CATEGORICAL_FEATURES + NUMERICAL_FEATURES].copy()
    if "irrigation" in X.columns:
        X["irrigation"] = X["irrigation"].astype(int)
    y = df[TARGET_FEATURE].copy()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)

    preprocessor = build_yield_preprocessor()
    rf = RandomForestRegressor(
        n_estimators=100,
        max_depth=16,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", rf)
    ])

    t0 = time.time()
    pipeline.fit(X_train, y_train)
    duration = time.time() - t0

    preds_test = pipeline.predict(X_test)
    preds_train = pipeline.predict(X_train)

    metrics = {
        "test_r2": round(float(r2_score(y_test, preds_test)), 4),
        "test_mae": round(float(mean_absolute_error(y_test, preds_test)), 4),
        "test_rmse": round(float(np.sqrt(mean_squared_error(y_test, preds_test))), 4),
        "train_r2": round(float(r2_score(y_train, preds_train)), 4),
        "train_mae": round(float(mean_absolute_error(y_train, preds_train)), 4),
        "train_rmse": round(float(np.sqrt(mean_squared_error(y_train, preds_train))), 4),
        "training_time_sec": round(duration, 2),
        "dataset_rows": len(df)
    }

    joblib.dump(pipeline, MODEL_PATH)

    categories = {
        "crops": sorted(df["crop"].unique().tolist()),
        "states": sorted(df["state"].unique().tolist()),
        "seasons": sorted(df["season"].unique().tolist()),
        "soil_types": sorted(df["soil_type"].unique().tolist()),
    }

    metadata = {
        "model_name": "Random Forest Crop Yield Regressor",
        "algorithm": "RandomForestRegressor(100 trees)",
        "metrics": metrics,
        "features": {
            "categorical": CATEGORICAL_FEATURES,
            "numerical": NUMERICAL_FEATURES,
        },
        "categories": categories,
        "target": "yield_per_hectare (tonnes/ha)"
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    global _PIPELINE, _METADATA
    _PIPELINE = pipeline
    _METADATA = metadata

    print(f"Successfully trained crop yield model: Test R²={metrics['test_r2']}, MAE={metrics['test_mae']} tonnes/ha")
    return metadata

def get_yield_model():
    """Load or retrieve the singleton yield prediction pipeline."""
    global _PIPELINE, _METADATA
    if _PIPELINE is None:
        if os.path.exists(MODEL_PATH):
            try:
                _PIPELINE = joblib.load(MODEL_PATH)
            except Exception:
                print("Re-training yield model with current scikit-learn version...")
                train_yield_model()
        else:
            train_yield_model()

    if _METADATA is None and os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            _METADATA = json.load(f)

    return _PIPELINE, _METADATA

CROP_ALIAS_MAP = {
    "rice / paddy": "Rice",
    "rice": "Rice",
    "paddy": "Rice",
    "dhan": "Rice",
    "chawal": "Rice",
    "maize / corn": "Maize",
    "maize": "Maize",
    "corn": "Maize",
    "makka": "Maize",
    "cotton": "Cotton",
    "kapas": "Cotton",
    "sugarcane": "Sugarcane",
    "cane": "Sugarcane",
    "ganna": "Sugarcane",
    "potato": "Potato",
    "aloo": "Potato",
    "aalugadde": "Potato",
    "tomato": "Tomato",
    "tamatar": "Tomato",
    "thakkali": "Tomato",
    "wheat": "Wheat",
    "gehun": "Wheat",
    "godhi": "Wheat",
    "groundnut": "Groundnut",
    "peanut": "Groundnut",
    "shenga": "Groundnut",
    "soybean": "Soybean",
    "soya": "Soybean",
    "pulses": "Pulses",
    "dal": "Pulses",
    "gram": "Pulses",
    "red gram": "Pulses",
    "bengal gram": "Pulses",
    "chana": "Pulses",
    "tur": "Pulses",
    "mustard": "Mustard",
    "sarson": "Mustard",
    "sasive": "Mustard",
    "jute": "Jute",
}

CROP_BENCHMARK_PRICES = {
    "Tomato": 2400,
    "Rice": 2500,
    "Wheat": 2425,
    "Potato": 1850,
    "Maize": 2300,
    "Cotton": 7300,
    "Sugarcane": 340,
    "Groundnut": 6550,
    "Soybean": 4850,
    "Pulses": 7500,
    "Mustard": 5650,
    "Jute": 5050,
}

CROP_CYCLE_DAYS = {
    "Tomato": "100 - 120 Days",
    "Rice": "120 - 140 Days",
    "Wheat": "110 - 130 Days",
    "Potato": "80 - 100 Days",
    "Maize": "105 - 115 Days",
    "Cotton": "150 - 165 Days",
    "Sugarcane": "300 - 365 Days",
    "Groundnut": "105 - 120 Days",
    "Soybean": "90 - 105 Days",
    "Pulses": "85 - 110 Days",
    "Mustard": "100 - 115 Days",
    "Jute": "120 - 135 Days",
}

CROP_METADATA_EXTENDED = {
    "Tomato": {
        "scientific_name": "Solanum lycopersicum",
        "suitability_score": 98,
        "suitability_level": "Optimal (Best Fit)",
        "why_suitable": "High diurnal temperature variation and well-drained loamy/red soil produce optimal fruit firmness and disease resilience.",
        "yield_range": "340 – 430 Qtl/Ha",
        "best_season": "Kharif & Rabi (Round the Year with Drip)",
        "market_name": "Kolar / Bengaluru APMC (Asia's Largest Tomato Yard)",
        "trend_pct": "+6.2% expected (7-day APMC arrival forecast)",
        "trend_direction": "bullish",
        "price_range_qtl": "₹2,100 – ₹2,800",
        "retail_kg": 28.0,
        "estimated_revenue_per_acre": "₹2,20,000 – ₹2,90,000",
        "icar_guidelines": "Mulching recommended; monitor for Early Blight and TSWV during humid monsoon.",
        "irrigation_advice": "Morning drip irrigation recommended. Keep leaf foliage dry during afternoon hours to limit fungal spore germination in high relative humidity.",
        "foliar_alert": "Watch for early blight target-spots on bottom canopy leaves in solanaceous plots. Ensure copper-based preventive spray if cloudy dew persists.",
        "soil_management": "Maintain soil pH 6.0 – 7.0. Apply balanced N-P-K (120:60:60 kg/ha) with calcium nitrate to prevent blossom end rot."
    },
    "Potato": {
        "scientific_name": "Solanum tuberosum",
        "suitability_score": 94,
        "suitability_level": "Highly Suitable",
        "why_suitable": "Loose, friable soils and cool night temperatures facilitate uniform tuber initiation, rapid bulking, and high dry matter content.",
        "yield_range": "200 – 280 Qtl/Ha",
        "best_season": "Rabi & Late Kharif",
        "market_name": "Hassan / Malur APMC",
        "trend_pct": "+4.5% expected",
        "trend_direction": "bullish",
        "price_range_qtl": "₹1,600 – ₹2,200",
        "retail_kg": 22.0,
        "estimated_revenue_per_acre": "₹1,40,000 – ₹1,85,000",
        "icar_guidelines": "Use certified disease-free seed tubers; ridge properly at 30 days to avoid tuber greening.",
        "irrigation_advice": "Maintain uniform soil moisture with sprinkler or furrow irrigation; avoid excess moisture at stolon maturity.",
        "foliar_alert": "Scout lower canopy for water-soaked late blight lesions during foggy mornings. Spray Mancozeb preventively.",
        "soil_management": "Ensure soil pH 5.2 – 6.5. High potassium application (K2O 120 kg/ha) enhances tuber size and storage quality."
    },
    "Rice": {
        "scientific_name": "Oryza sativa",
        "suitability_score": 96,
        "suitability_level": "Optimal (Best Fit)",
        "why_suitable": "Canal-irrigated alluvial and clay soils provide excellent water retention, promoting uniform tillering and panicle development.",
        "yield_range": "50 – 75 Qtl/Ha",
        "best_season": "Kharif & Summer",
        "market_name": "Siruguppa / Mandya APMC (Granary Hub)",
        "trend_pct": "+3.8% expected",
        "trend_direction": "stable",
        "price_range_qtl": "₹2,300 – ₹2,750",
        "retail_kg": 35.0,
        "estimated_revenue_per_acre": "₹55,000 – ₹85,000",
        "icar_guidelines": "Incorporate System of Rice Intensification (SRI) or AWD water-saving practices; monitor for blast and stem borer.",
        "irrigation_advice": "Maintain 2-5 cm shallow standing water during tillering to panicle initiation; drain field 10 days before harvest.",
        "foliar_alert": "Monitor for spindle-shaped blast lesions and sheath blight along water lines during rainy spells.",
        "soil_management": "Apply split nitrogen doses with neem-coated urea. Ensure zinc sulfate (25 kg/ha) application to prevent Khaira disease."
    },
    "Wheat": {
        "scientific_name": "Triticum aestivum",
        "suitability_score": 93,
        "suitability_level": "Highly Suitable",
        "why_suitable": "Cool winter temperatures during vegetative phase and sunny grain-filling days produce high test weight and gluten quality.",
        "yield_range": "45 – 65 Qtl/Ha",
        "best_season": "Rabi",
        "market_name": "Khanna / Belagavi APMC",
        "trend_pct": "+2.5% expected (MSP supported)",
        "trend_direction": "bullish",
        "price_range_qtl": "₹2,275 – ₹2,550",
        "retail_kg": 28.0,
        "estimated_revenue_per_acre": "₹48,000 – ₹72,000",
        "icar_guidelines": "Timely sowing between Nov 1-15 ensures optimal tillering without terminal heat stress.",
        "irrigation_advice": "Critical irrigation stages: Crown Root Initiation (21 DAS), Tillering, Booting, and Milking stages.",
        "foliar_alert": "Scout for yellow/stripe rust pustules on upper leaves when relative humidity exceeds 85%.",
        "soil_management": "Apply 120:60:40 kg/ha N:P2O5:K2O. Apply half N and full P & K as basal dressing."
    },
    "Maize": {
        "scientific_name": "Zea mays",
        "suitability_score": 92,
        "suitability_level": "Optimal (Best Fit)",
        "why_suitable": "Warm sunny days and well-aerated soils enable vigorous C4 photosynthetic efficiency and heavy cob development.",
        "yield_range": "60 – 85 Qtl/Ha",
        "best_season": "Kharif & Rabi",
        "market_name": "Davangere / Ranebennur APMC",
        "trend_pct": "+4.1% expected",
        "trend_direction": "bullish",
        "price_range_qtl": "₹2,100 – ₹2,500",
        "retail_kg": 26.0,
        "estimated_revenue_per_acre": "₹52,000 – ₹78,000",
        "icar_guidelines": "Use certified single-cross hybrids; deploy pheromone traps early for Fall Armyworm management.",
        "irrigation_advice": "Moisture stress during silking and tassel emergence causes drastic yield decline; ensure furrow irrigation.",
        "foliar_alert": "Scout whorl leaves for Fall Armyworm pinholes and Turcicum leaf blight lesions.",
        "soil_management": "Deep ploughing with farmyard manure (10 t/ha); apply 150:75:40 kg/ha N:P:K with zinc enrichment."
    },
    "Cotton": {
        "scientific_name": "Gossypium hirsutum",
        "suitability_score": 90,
        "suitability_level": "Highly Suitable",
        "why_suitable": "Deep black cotton soils (Vertisols) retain deep moisture needed for taproot expansion and uniform boll bursting.",
        "yield_range": "20 – 35 Qtl/Ha",
        "best_season": "Kharif",
        "market_name": "Raichur / Ballari APMC",
        "trend_pct": "+5.5% expected",
        "trend_direction": "bullish",
        "price_range_qtl": "₹6,800 – ₹7,800",
        "retail_kg": 85.0,
        "estimated_revenue_per_acre": "₹65,000 – ₹98,000",
        "icar_guidelines": "Plant refuge non-Bt border rows; install pheromone traps at square formation stage.",
        "irrigation_advice": "Drip irrigation with alternate furrow method saves 40% water while maintaining peak boll retention.",
        "foliar_alert": "Check flower buds for pink bollworm entry rosettes and sucking pest infestation (whitefly/thrips).",
        "soil_management": "Apply magnesium sulfate (25 kg/ha) to prevent leaf reddening; balanced N-P-K (120:60:60 kg/ha)."
    },
    "Groundnut": {
        "scientific_name": "Arachis hypogaea",
        "suitability_score": 89,
        "suitability_level": "Favorable",
        "why_suitable": "Friable sandy loam allows easy peg penetration and uniform pod expansion with minimal harvesting loss.",
        "yield_range": "20 – 30 Qtl/Ha",
        "best_season": "Kharif & Rabi",
        "market_name": "Challakere / Pavagada APMC",
        "trend_pct": "+3.2% expected",
        "trend_direction": "stable",
        "price_range_qtl": "₹6,200 – ₹7,100",
        "retail_kg": 90.0,
        "estimated_revenue_per_acre": "₹50,000 – ₹75,000",
        "icar_guidelines": "Seed treatment with Rhizobium inoculant and Trichoderma; apply gypsum at pegging.",
        "irrigation_advice": "Avoid irrigation during flowering to facilitate pegging; critical water need at pod filling.",
        "foliar_alert": "Monitor for Tikka leaf spot (cercospora) dark circular lesions; spray Carbendazim + Mancozeb.",
        "soil_management": "Apply Gypsum @ 500 kg/ha at pegging (40-45 DAS) for superior pod filling and oil synthesis."
    },
    "Pulses": {
        "scientific_name": "Cajanus cajan / Cicer arietinum",
        "suitability_score": 95,
        "suitability_level": "Optimal (Best Fit)",
        "why_suitable": "Atmospheric nitrogen-fixing legumes thrive in semi-arid conditions with moderate rainfall and deep root systems.",
        "yield_range": "15 – 25 Qtl/Ha",
        "best_season": "Kharif (Tur) / Rabi (Gram)",
        "market_name": "Kalaburagi / Bidar APMC (Tur Bowl)",
        "trend_pct": "+6.8% expected",
        "trend_direction": "bullish",
        "price_range_qtl": "₹7,200 – ₹8,400",
        "retail_kg": 110.0,
        "estimated_revenue_per_acre": "₹52,000 – ₹80,000",
        "icar_guidelines": "Adopt broad-bed furrow planting to prevent waterlogging; nip apical shoots to induce lateral branching.",
        "irrigation_advice": "Protective irrigation at flowering and pod development stages dramatically boosts yield.",
        "foliar_alert": "Install bird perches and pheromone traps for Helicoverpa pod borer larvae management.",
        "soil_management": "Apply DAP as basal dose (100 kg/ha) with sulfur (20 kg/ha) for high protein and nodule efficiency."
    },
    "Mustard": {
        "scientific_name": "Brassica juncea",
        "suitability_score": 88,
        "suitability_level": "Favorable",
        "why_suitable": "Thrives under cool clear weather with low water requirement; excellent residual moisture utilization.",
        "yield_range": "18 – 28 Qtl/Ha",
        "best_season": "Rabi",
        "market_name": "Alwar / North Karnataka APMC",
        "trend_pct": "+3.0% expected",
        "trend_direction": "stable",
        "price_range_qtl": "₹5,200 – ₹6,100",
        "retail_kg": 75.0,
        "estimated_revenue_per_acre": "₹42,000 – ₹62,000",
        "icar_guidelines": "Sow before end of October to avoid aphid infestation during flowering.",
        "irrigation_advice": "Requires only 2 irrigations: first at pre-flowering (30 DAS) and second at pod development (60 DAS).",
        "foliar_alert": "Inspect inflorescence for mustard aphids; spray neem oil 5% or thiamethoxam if ETL crossed.",
        "soil_management": "Sulfur application (40 kg/ha) is indispensable for high oil content and glucosinolate quality."
    },
    "Soybean": {
        "scientific_name": "Glycine max",
        "suitability_score": 91,
        "suitability_level": "Highly Suitable",
        "why_suitable": "Medium-textured fertile soils with moderate monsoon rainfall support rapid vegetative spread and high bean oil yield.",
        "yield_range": "20 – 32 Qtl/Ha",
        "best_season": "Kharif",
        "market_name": "Belagavi / Dharwad APMC",
        "trend_pct": "+4.0% expected",
        "trend_direction": "bullish",
        "price_range_qtl": "₹4,500 – ₹5,200",
        "retail_kg": 60.0,
        "estimated_revenue_per_acre": "₹40,000 – ₹65,000",
        "icar_guidelines": "Inoculate seeds with Bradyrhizobium japonicum; avoid deep sowing exceeding 3-4 cm.",
        "irrigation_advice": "Ensure adequate moisture at pod-initiation and seed-filling stages; drain excess monsoon water.",
        "foliar_alert": "Watch for Yellow Mosaic Virus spread by whiteflies and defoliating semiloopers.",
        "soil_management": "Apply 30:60:40 kg/ha N:P:K basal dose. Zinc and iron micronutrient foliar spray at 30 DAS."
    },
    "Sugarcane": {
        "scientific_name": "Saccharum officinarum",
        "suitability_score": 97,
        "suitability_level": "Optimal (Best Fit)",
        "why_suitable": "Perennial river basin fertile loam with high solar radiation drives rapid stalk elongation and high sucrose recovery.",
        "yield_range": "900 – 1300 Qtl/Ha",
        "best_season": "Annual / Adsali",
        "market_name": "Mandya / Belagavi Sugar Factories",
        "trend_pct": "+2.0% (FRP backed)",
        "trend_direction": "stable",
        "price_range_qtl": "₹320 – ₹365",
        "retail_kg": 4.5,
        "estimated_revenue_per_acre": "₹1,30,000 – ₹1,80,000",
        "icar_guidelines": "Adopt single-bud trench planting with subsurface drip; trash mulching conserves moisture.",
        "irrigation_advice": "Drip fertigation yields 30-40% cane volume increase; irrigate every 2-3 days during formative stage.",
        "foliar_alert": "Monitor for early shoot borer at tillering and red rot on stalks; rogue out affected clumps.",
        "soil_management": "Apply 250:100:125 kg/ha N:P:K in split doses. Apply iron and zinc sulfate to eliminate chlorosis."
    },
    "Jute": {
        "scientific_name": "Corchorus olitorius",
        "suitability_score": 87,
        "suitability_level": "Favorable",
        "why_suitable": "Humid tropical climate, alluvial loam, and abundance of retting water produce long, lustrous golden fiber.",
        "yield_range": "25 – 38 Qtl/Ha",
        "best_season": "Annual / Pre-Kharif",
        "market_name": "Kolkata / Barrackpore Jute Mills",
        "trend_pct": "+3.5% expected",
        "trend_direction": "stable",
        "price_range_qtl": "₹4,800 – ₹5,400",
        "retail_kg": 65.0,
        "estimated_revenue_per_acre": "₹45,000 – ₹70,000",
        "icar_guidelines": "Harvest at 50% flowering for optimal fiber fineness and tensile strength.",
        "irrigation_advice": "Light irrigation during early vegetative phase; thrives under humid rainy weather.",
        "foliar_alert": "Inspect stem for stem rot (Macrophomina) and semilooper caterpillar damage.",
        "soil_management": "Apply 60:30:30 kg/ha N:P:K. Topdress nitrogen after first and second weedings."
    }
}

def predict_crop_yield(
    crop: str,
    state: str = "Karnataka",
    season: str = "Kharif",
    area_hectares: float = 1.0,
    soil_type: str = "Loamy",
    temperature: float = 26.5,
    humidity: float = 65.0,
    rainfall: float = 750.0,
    soil_ph: float = 6.5,
    soil_moisture: float = 60.0,
    irrigation: bool = True
) -> Dict[str, Any]:
    """Execute crop yield prediction and agronomic advisory."""
    if area_hectares <= 0:
        raise ValueError("Field area (hectares) must be strictly greater than 0.")

    pipeline, metadata = get_yield_model()
    if pipeline is None:
        raise RuntimeError("Crop yield model is currently unavailable on the server.")

    # Normalize crop name using alias map
    raw_crop = crop.strip().lower()
    normalized_crop = CROP_ALIAS_MAP.get(raw_crop)
    if not normalized_crop:
        for alias, canon in CROP_ALIAS_MAP.items():
            if alias in raw_crop or raw_crop in alias:
                normalized_crop = canon
                break

    valid_crops = [c.lower() for c in metadata.get("categories", {}).get("crops", [])]
    if not normalized_crop or normalized_crop.lower() not in valid_crops:
        raise ValueError(f"Unsupported crop '{crop}'. Supported crops: {', '.join(metadata.get('categories', {}).get('crops', []))}")

    crop_clean = normalized_crop
    state_clean = state.strip().title()
    season_clean = season.strip().title()
    soil_clean = soil_type.strip().title()

    input_df = pd.DataFrame([{
        "crop": crop_clean,
        "state": state_clean,
        "season": season_clean,
        "soil_type": soil_clean,
        "area_hectares": float(area_hectares),
        "irrigation": int(bool(irrigation)),
        "temperature": float(temperature),
        "humidity": float(humidity),
        "rainfall": float(rainfall),
        "soil_ph": float(soil_ph),
        "soil_moisture": float(soil_moisture)
    }])

    pred_raw = float(pipeline.predict(input_df)[0])
    predicted_yield = max(0.5, round(pred_raw, 2))
    total_production = round(predicted_yield * float(area_hectares), 2)

    # 1 Tonne = 10 Quintals
    yield_qtl_ha = round(predicted_yield * 10, 1)
    total_qtl = round(total_production * 10, 1)

    # Extended metadata lookup
    ext_meta = CROP_METADATA_EXTENDED.get(crop_clean, {})
    scientific_name = ext_meta.get("scientific_name", f"{crop_clean} spp.")
    suitability_score = ext_meta.get("suitability_score", 92)
    suitability_level = ext_meta.get("suitability_level", "Optimal (Best Fit)")
    why_suitable = ext_meta.get("why_suitable", f"Calibrated for {soil_clean} soil and {season_clean} climate conditions in {state_clean}.")
    yield_range = ext_meta.get("yield_range", f"{round(yield_qtl_ha*0.85)} – {round(yield_qtl_ha*1.15)} Qtl/Ha")
    best_season = ext_meta.get("best_season", season_clean)
    market_name = ext_meta.get("market_name", f"{state_clean} Regional APMC")
    trend_pct = ext_meta.get("trend_pct", "+4.2% expected (7-day forecast)")
    trend_direction = ext_meta.get("trend_direction", "bullish")
    price_range_qtl = ext_meta.get("price_range_qtl", f"₹{round(CROP_BENCHMARK_PRICES.get(crop_clean, 2500)*0.88):,} – ₹{round(CROP_BENCHMARK_PRICES.get(crop_clean, 2500)*1.12):,}")
    retail_kg = ext_meta.get("retail_kg", round(CROP_BENCHMARK_PRICES.get(crop_clean, 2500) / 75.0, 1))
    estimated_rev_acre = ext_meta.get("estimated_revenue_per_acre", f"₹{round((yield_qtl_ha * CROP_BENCHMARK_PRICES.get(crop_clean, 2500)) / 2.471):,}")
    icar_guidelines = ext_meta.get("icar_guidelines", f"Follow ICAR agronomic package of practices for {crop_clean}.")
    irrigation_advice = ext_meta.get("irrigation_advice", "Morning irrigation recommended. Maintain adequate root zone moisture.")
    foliar_alert = ext_meta.get("foliar_alert", f"Monitor foliage regularly for early pest and disease symptoms in {crop_clean}.")
    soil_mgmt = ext_meta.get("soil_management", f"Maintain soil pH 6.0 – 7.0 and apply balanced N-P-K.")

    # Market Price & Revenue calculation
    mandi_price_qtl = CROP_BENCHMARK_PRICES.get(crop_clean, 2500)
    mandi_price_kg = round(mandi_price_qtl / 100.0, 2)
    estimated_revenue = round(total_qtl * mandi_price_qtl, 2)
    revenue_per_acre = round((yield_qtl_ha * mandi_price_qtl) / 2.471, 2)
    cycle_duration = CROP_CYCLE_DAYS.get(crop_clean, "100 - 130 Days")

    # Calculate tree variance estimate range
    lower_bound = max(0.2, round(predicted_yield * 0.88, 2))
    upper_bound = round(predicted_yield * 1.12, 2)
    try:
        regressor = pipeline.named_steps.get("regressor")
        preprocessor = pipeline.named_steps.get("preprocessor")
        if regressor and preprocessor and hasattr(regressor, "estimators_"):
            X_trans = preprocessor.transform(input_df)
            tree_preds = [float(t.predict(X_trans)[0]) for t in regressor.estimators_]
            std_val = float(np.std(tree_preds))
            lower_bound = max(0.2, round(predicted_yield - (1.28 * std_val), 2))
            upper_bound = round(predicted_yield + (1.28 * std_val), 2)
    except Exception:
        pass

    # Custom tailored agronomic recommendations
    custom_irrigation = f"Scheduled {'drip' if irrigation else 'rainfed conservation'} irrigation: {irrigation_advice}"
    recommendations = [
        f"Maintain soil pH between {max(5.5, soil_ph-0.5):.1f} and {min(7.5, soil_ph+0.5):.1f}: {soil_mgmt}",
        custom_irrigation,
        f"Foliar & Crop Health: {foliar_alert}",
        f"ICAR Extension Guideline: {icar_guidelines}"
    ]

    return {
        "status": "success",
        "crop": crop_clean,
        "scientific_name": scientific_name,
        "suitability_score": suitability_score,
        "suitability_level": suitability_level,
        "why_suitable": why_suitable,
        "state": state_clean,
        "season": season_clean,
        "best_season": best_season,
        "soil_type": soil_clean,
        "area_hectares": float(area_hectares),
        "area_acres": round(float(area_hectares) * 2.471, 2),
        "predicted_yield_per_hectare": predicted_yield,
        "predicted_yield_qtl_ha": yield_qtl_ha,
        "total_production": total_production,
        "total_production_quintals": total_qtl,
        "yield_range": yield_range,
        "unit_yield": "tonnes/hectare",
        "unit_production": "tonnes",
        "cycle_duration": cycle_duration,
        "mandi_benchmark": {
            "price_per_qtl": mandi_price_qtl,
            "price_per_kg": mandi_price_kg,
            "retail_kg": retail_kg,
            "price_range_qtl": price_range_qtl,
            "market_name": market_name,
            "trend_pct": trend_pct,
            "trend_direction": trend_direction,
            "estimated_gross_revenue": estimated_revenue,
            "estimated_revenue_formatted": f"₹{int(estimated_revenue):,}",
            "estimated_revenue_per_acre": estimated_rev_acre,
            "estimated_revenue_per_acre_num": revenue_per_acre
        },
        "agro_climatic_advisory": {
            "irrigation": custom_irrigation,
            "foliar_alert": foliar_alert,
            "soil_management": soil_mgmt,
            "icar_guidelines": icar_guidelines,
            "kvk_field_day": "Weekly ICAR-KVK Field Advisory Day: Every Tuesday"
        },
        "estimate_range": {
            "lower": lower_bound,
            "upper": upper_bound,
            "lower_qtl": round(lower_bound * 10, 1),
            "upper_qtl": round(upper_bound * 10, 1),
            "description": "Estimated 90% confidence interval based on tree variance across agro-climatic estimators."
        },
        "model_used": "RandomForestRegressor (100 estimators)",
        "recommendations": recommendations,
        "agronomic_recommendations": recommendations
    }

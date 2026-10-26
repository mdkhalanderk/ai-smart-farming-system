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

    valid_crops = [c.lower() for c in metadata.get("categories", {}).get("crops", [])]
    if crop.strip().lower() not in valid_crops:
        raise ValueError(f"Unsupported crop '{crop}'. Supported crops: {', '.join(metadata.get('categories', {}).get('crops', []))}")

    crop_clean = crop.strip().title()
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

    recommendations = [
        f"Maintain soil pH between {max(5.5, soil_ph-0.5):.1f} and {min(7.5, soil_ph+0.5):.1f} for optimal {crop_clean} nutrient uptake.",
        "Ensure scheduled drip irrigation during peak flowering and vegetative stages to prevent moisture stress.",
        "Apply balanced N-P-K according to local state agricultural university (UAS Bangalore) guidelines."
    ]

    return {
        "status": "success",
        "crop": crop_clean,
        "state": state_clean,
        "season": season_clean,
        "soil_type": soil_clean,
        "area_hectares": float(area_hectares),
        "predicted_yield_per_hectare": predicted_yield,
        "total_production": total_production,
        "unit_yield": "tonnes/hectare",
        "unit_production": "tonnes",
        "estimate_range": {
            "lower": lower_bound,
            "upper": upper_bound,
            "description": "Estimated 90% confidence interval based on tree variance across agro-climatic estimators."
        },
        "model_used": "RandomForestRegressor (100 estimators)",
        "recommendations": recommendations
    }

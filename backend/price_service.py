from __future__ import annotations

import os
import joblib
import pandas as pd
import requests
from pathlib import Path
from datetime import date, timedelta
from typing import Dict, List, Optional, Any

# Locate paths relative to this backend file
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
PRICE_PROJECT_ROOT = PROJECT_ROOT / "market price 1-20261002T015252Z-1-001" / "market price 1"

MODEL_FILE = PRICE_PROJECT_ROOT / "models" / "random_forest" / "random_forest_model.pkl"
FEATURES_FILE = PRICE_PROJECT_ROOT / "models" / "random_forest" / "random_forest_features.pkl"
HISTORICAL_FILE = PRICE_PROJECT_ROOT / "data" / "historical" / "training_dataset.csv"

MANDI_API_URL = "https://mandi-api.onrender.com/v1/prices"

# Market Coordinates Mapping for Open-Meteo Weather Forecasts
COORDINATES: Dict[str, tuple[float, float]] = {
    "bangalore": (12.9716, 77.5946),
    "bengaluru apmc": (12.9716, 77.5946),
    "kolar": (13.1367, 78.1292),
    "chintamani": (13.4015, 78.0573),
    "chickkaballapura": (13.4355, 77.7275),
    "chikkaballapur": (13.4355, 77.7275),
    "bagepalli": (13.7850, 77.7946),
    "bangarpet": (12.9863, 78.1925),
    "davangere": (14.4644, 75.9218),
    "belgaum": (15.8497, 74.4977),
    "belagavi": (15.8497, 74.4977),
    "mysore": (12.2958, 76.6394),
    "mysuru": (12.2958, 76.6394),
    "hubli": (15.3647, 75.1240),
    "dharwad": (15.4589, 75.0078),
    "hassan": (13.0033, 76.1004),
    "mandya": (12.5218, 76.8951),
    "bagalkot": (16.1852, 75.6961),
    "bellary": (15.1394, 76.9214),
    "ballari": (15.1394, 76.9214),
    "chikmagalur": (13.3161, 75.7720),
    "chikkamagaluru": (13.3161, 75.7720),
    "chitradurga": (14.2251, 76.3980),
    "bidar": (17.9104, 77.5199),
    "chamarajanagar": (11.9261, 76.9437),
    "dakshina kannada": (12.9141, 74.8560),
    "mangaluru": (12.9141, 74.8560),
    "gadag": (15.4319, 75.6355),
    "haveri": (14.7954, 75.3991),
    "byadgi": (14.6800, 75.4800),
    "kalaburagi": (17.3297, 76.8343),
    "gulbarga": (17.3297, 76.8343),
    "kodagu": (12.4244, 75.7382),
    "madikeri": (12.4244, 75.7382),
    "koppal": (15.3524, 76.1557),
    "gangavathi": (15.4300, 76.5300),
    "raichur": (16.2120, 77.3439),
    "sindhanur": (15.7800, 76.7600),
    "ramanagara": (12.7209, 77.2799),
    "shivamogga": (13.9299, 75.5681),
    "shimoga": (13.9299, 75.5681),
    "tumakuru": (13.3392, 77.1017),
    "tumkur": (13.3392, 77.1017),
    "udupi": (13.3409, 74.7421),
    "uttara kannada": (14.8185, 74.1350),
    "sirsi": (14.6200, 74.8500),
    "karwar": (14.8185, 74.1350),
    "vijayanagara": (15.2740, 76.3900),
    "hospet": (15.2740, 76.3900),
    "vijayapura": (16.8302, 75.7100),
    "bijapur": (16.8302, 75.7100),
    "yadgir": (16.7628, 77.1442),
}
DEFAULT_COORDS = (12.9716, 77.5946)

# Alias mapping for market names in training dataset
MARKET_TRAINING_ALIASES: Dict[str, str] = {
    "bengaluru apmc": "bangalore",
    "bengaluru": "bangalore",
    "chikkaballapur": "chickkaballapura",
    "chikkaballapura": "chickkaballapura",
    "belagavi": "belgaum",
    "mysuru": "mysore",
    "ballari": "bellary",
}

_MODEL = None
_FEATURE_COLUMNS = None
_CATEGORY_MAPPINGS = None
_HISTORICAL_DF = None


def load_model_and_metadata():
    """Load model, feature specification, and category encoders."""
    global _MODEL, _FEATURE_COLUMNS, _CATEGORY_MAPPINGS, _HISTORICAL_DF
    if _MODEL is None:
        if not MODEL_FILE.exists():
            raise FileNotFoundError(f"Missing trained model file at {MODEL_FILE}")
        
        _MODEL = joblib.load(MODEL_FILE)
        _FEATURE_COLUMNS = joblib.load(FEATURES_FILE)

        _HISTORICAL_DF = pd.read_csv(HISTORICAL_FILE)
        all_training = _HISTORICAL_DF.copy()
        for col in ["District Name", "Market Name", "Commodity", "Variety", "Grade"]:
            all_training[col] = all_training[col].fillna("Unknown").astype(str).str.strip().str.lower()

        _CATEGORY_MAPPINGS = {
            "commodity": sorted(all_training["Commodity"].unique()),
            "market": sorted(all_training["Market Name"].unique()),
            "district": sorted(all_training["District Name"].unique()),
            "variety": sorted(all_training["Variety"].unique()),
            "grade": sorted(all_training["Grade"].unique()),
        }
    return _MODEL, _FEATURE_COLUMNS, _CATEGORY_MAPPINGS, _HISTORICAL_DF


def get_available_markets() -> List[str]:
    """Return supported Karnataka APMC markets across all regions."""
    return [
        "Bengaluru APMC",
        "Bagalkot",
        "Ballari",
        "Belagavi",
        "Bidar",
        "Byadgi",
        "Challakere",
        "Chamarajanagar",
        "Chikkaballapura",
        "Chikkamagaluru",
        "Chintamani",
        "Chitradurga",
        "Davangere",
        "Dharwad",
        "Gadag",
        "Gangavathi",
        "Hassan",
        "Haveri",
        "Hosakote",
        "Hosapete",
        "Hubballi",
        "Kalaburagi",
        "Kodagu (Madikeri)",
        "Kolar",
        "Koppal",
        "Kundapura",
        "Mandya",
        "Mangaluru",
        "Mysuru",
        "Puttur",
        "Raichur",
        "Ramanagara",
        "Ranebennur",
        "Shivamogga",
        "Sindhanur",
        "Sirsi",
        "Srinivaspur",
        "Tiptur",
        "Tumakuru",
        "Udupi",
        "Vijayapura",
        "Yadgir",
    ]


def get_available_commodities(market: Optional[str] = None) -> List[str]:
    """Return supported agricultural commodities."""
    return ["Onion", "Tomato", "Potato", "Rice", "Wheat"]


def get_weather_forecast(market_name: str) -> pd.DataFrame:
    """Fetch 7-day weather forecast from Open-Meteo for market location with fallback to regional seasonal norms."""
    market_clean = market_name.strip().lower()
    lat, lon = COORDINATES.get(market_clean, DEFAULT_COORDS)

    today = date.today()
    default_dates = [today + timedelta(days=i + 1) for i in range(7)]
    fallback_df = pd.DataFrame({
        "date": pd.to_datetime(default_dates),
        "temperature": [26.5] * 7,
        "humidity": [65.0] * 7,
        "rain": [0.0] * 7,
        "wind_speed": [12.0] * 7,
    })

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "forecast_days": 7,
        "daily": (
            "temperature_2m_mean,"
            "relative_humidity_2m_mean,"
            "precipitation_sum,"
            "wind_speed_10m_max"
        ),
        "timezone": "Asia/Kolkata",
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            daily = data.get("daily", {})
            if daily and "time" in daily and len(daily["time"]) >= 7:
                df = pd.DataFrame(daily).rename(
                    columns={
                        "time": "date",
                        "temperature_2m_mean": "temperature",
                        "relative_humidity_2m_mean": "humidity",
                        "precipitation_sum": "rain",
                        "wind_speed_10m_max": "wind_speed",
                    }
                )
                df["date"] = pd.to_datetime(df["date"])
                return df
    except Exception as e:
        print(f"Notice: Open-Meteo weather service unavailable ({e}); using regional seasonal values.")

    return fallback_df


def fetch_current_mandi_price(market: str, commodity: str) -> Optional[Dict[str, Any]]:
    """Query live Mandi API for current price observation."""
    try:
        response = requests.get(
            MANDI_API_URL,
            params={"state": "Karnataka", "commodity": commodity},
            headers={"Accept": "application/json"},
            timeout=15,
        )
        if response.status_code != 200:
            return None

        result = response.json()
        records = (
            result.get("data", result.get("prices", []))
            if isinstance(result, dict)
            else result
        )
        if not isinstance(records, list) or len(records) == 0:
            return None

        df = pd.DataFrame(records)
        if df.empty:
            return None

        rename_map = {}
        for col in df.columns:
            name = str(col).strip().lower()
            if name in ["market", "market_name"]:
                rename_map[col] = "market"
            elif name in ["commodity", "commodity_name"]:
                rename_map[col] = "commodity"
            elif name in ["arrival_date", "price_date", "date"]:
                rename_map[col] = "date"
            elif name in ["modal_price", "modal price"]:
                rename_map[col] = "modal_price"
            elif name in ["min_price", "min price"]:
                rename_map[col] = "min_price"
            elif name in ["max_price", "max price"]:
                rename_map[col] = "max_price"

        df = df.rename(columns=rename_map)
        if "market" not in df.columns or "modal_price" not in df.columns:
            return None

        df["market_clean"] = df["market"].astype(str).str.strip().str.lower()
        market_clean = market.strip().lower()
        target_market_name = MARKET_TRAINING_ALIASES.get(market_clean, market_clean)

        matched = df[
            (df["market_clean"] == market_clean)
            | (df["market_clean"] == target_market_name)
            | (df["market_clean"].str.contains(target_market_name, regex=False))
        ].copy()

        if matched.empty:
            return None

        matched = matched.copy()
        matched["date"] = pd.to_datetime(matched["date"], errors="coerce")
        matched["modal_price"] = pd.to_numeric(matched["modal_price"], errors="coerce")
        matched = matched.dropna(subset=["modal_price"]).sort_values("date")

        if matched.empty:
            return None

        latest = matched.iloc[-1]
        modal_p = float(latest["modal_price"])
        min_p = float(latest.get("min_price", modal_p)) if pd.notnull(latest.get("min_price")) else modal_p
        max_p = float(latest.get("max_price", modal_p)) if pd.notnull(latest.get("max_price")) else modal_p
        arrival_d = str(latest.get("date")).split(" ")[0] if pd.notnull(latest.get("date")) else str(date.today())

        return {
            "source": "Live Mandi API",
            "date": arrival_d,
            "modal_price": modal_p,
            "min_price": min_p,
            "max_price": max_p,
            "modal_price_kg": round(modal_p / 100.0, 2),
            "min_price_kg": round(min_p / 100.0, 2),
            "max_price_kg": round(max_p / 100.0, 2),
            "unit": "₹/quintal",
            "unit_kg": "₹/kg",
        }
    except Exception as e:
        print(f"Mandi API fetch notice: {e}")
        return None


def run_price_prediction(market: str, commodity: str) -> Dict[str, Any]:
    """
    Run 7-day price prediction using verified RandomForestRegressor model.
    """
    model, feature_cols, category_mappings, historical_df = load_model_and_metadata()

    market_clean = market.strip().lower()
    commodity_clean = commodity.strip().lower()
    training_market_name = MARKET_TRAINING_ALIASES.get(market_clean, market_clean)

    # 1. Attempt Live Mandi Current Price Fetch
    current_price_info = fetch_current_mandi_price(market, commodity)

    # 2. Load Historical Data for Lags
    hist = historical_df.copy()
    hist["STATE"] = hist["STATE"].astype(str).str.strip().str.lower()
    hist["market_clean"] = hist["Market Name"].fillna("Unknown").astype(str).str.strip().str.lower()
    hist["commodity_clean"] = hist["Commodity"].fillna("Unknown").astype(str).str.strip().str.lower()
    hist["market_clean"] = hist["market_clean"].replace({"bangalore": "bengaluru apmc"})

    matching = hist[
        (hist["STATE"] == "karnataka")
        & (
            (hist["market_clean"] == market_clean)
            | (hist["market_clean"] == training_market_name)
        )
        & (hist["commodity_clean"] == commodity_clean)
    ].copy()

    if matching.empty:
        matching = hist[
            (hist["STATE"] == "karnataka")
            & (hist["commodity_clean"] == commodity_clean)
        ].copy()

    if matching.empty:
        raise ValueError(f"No historical price series found for commodity '{commodity}'.")

    matching["Price Date"] = pd.to_datetime(matching["Price Date"], errors="coerce")
    matching["Modal_Price"] = pd.to_numeric(matching["Modal_Price"], errors="coerce")
    matching = matching.dropna(subset=["Price Date", "Modal_Price"]).sort_values("Price Date")

    history_prices = matching["Modal_Price"].tolist()

    if current_price_info:
        latest_actual_price = current_price_info["modal_price"]
        history_prices.append(latest_actual_price)
    else:
        latest_row = matching.iloc[-1]
        latest_actual_price = float(latest_row["Modal_Price"])
        min_p = float(latest_row.get("Min_Price", latest_actual_price))
        max_p = float(latest_row.get("Max_Price", latest_actual_price))
        current_price_info = {
            "source": "Historical Market Records",
            "date": str(latest_row["Price Date"]).split(" ")[0],
            "modal_price": latest_actual_price,
            "min_price": min_p,
            "max_price": max_p,
            "modal_price_kg": round(latest_actual_price / 100.0, 2),
            "min_price_kg": round(min_p / 100.0, 2),
            "max_price_kg": round(max_p / 100.0, 2),
            "unit": "₹/quintal",
            "unit_kg": "₹/kg",
        }

    # 3. Category Encoding System
    commodity_cats = category_mappings["commodity"]
    market_cats = category_mappings["market"]
    district_cats = category_mappings["district"]
    variety_cats = category_mappings["variety"]
    grade_cats = category_mappings["grade"]

    commodity_code = commodity_cats.index(commodity_clean) if commodity_clean in commodity_cats else 0

    if training_market_name in market_cats:
        market_code = market_cats.index(training_market_name)
    elif market_clean in market_cats:
        market_code = market_cats.index(market_clean)
    else:
        market_code = 0

    district_name = str(matching.iloc[-1].get("District Name", "Unknown")).strip().lower()
    district_code = district_cats.index(district_name) if district_name in district_cats else 0

    variety_name = str(matching.iloc[-1].get("Variety", "Unknown")).strip().lower()
    variety_code = variety_cats.index(variety_name) if variety_name in variety_cats else 0

    grade_name = str(matching.iloc[-1].get("Grade", "Unknown")).strip().lower()
    grade_code = grade_cats.index(grade_name) if grade_name in grade_cats else 0

    # 4. Fetch Weather Forecast
    weather_df = get_weather_forecast(market)

    # 5. Iterative 7-Day Model Predictions
    today = date.today()
    forecast = []

    for i in range(7):
        prediction_date = today + timedelta(days=i + 1)
        weather_row = weather_df.iloc[i] if i < len(weather_df) else weather_df.iloc[-1]

        lag_1 = history_prices[-1]
        lag_3 = history_prices[-3] if len(history_prices) >= 3 else history_prices[-1]
        lag_7 = history_prices[-7] if len(history_prices) >= 7 else history_prices[-1]
        rolling_7 = float(pd.Series(history_prices[-7:]).mean())

        m = prediction_date.month
        if m in [12, 1, 2]:
            season = 1
        elif m in [3, 4, 5]:
            season = 2
        elif m in [6, 7, 8, 9]:
            season = 3
        else:
            season = 4

        future_row = {
            "year": prediction_date.year,
            "month": m,
            "day": prediction_date.day,
            "day_of_week": prediction_date.weekday(),
            "day_of_year": prediction_date.timetuple().tm_yday,
            "season": season,

            "commodity_code": commodity_code,
            "market_code": market_code,
            "district_code": district_code,
            "variety_code": variety_code,
            "grade_code": grade_code,

            "lag_1": lag_1,
            "lag_3": lag_3,
            "lag_7": lag_7,
            "rolling_7": rolling_7,

            "temperature": weather_row["temperature"],
            "humidity": weather_row["humidity"],
            "rain": weather_row["rain"],
            "wind_speed": weather_row["wind_speed"],
        }

        X_future = pd.DataFrame([future_row])[feature_cols]
        predicted_price = max(100.0, float(model.predict(X_future)[0]))
        predicted_price_kg = round(predicted_price / 100.0, 2)

        diff = predicted_price - lag_1
        if abs(diff) < 5.0:
            trend = "stable"
            trend_label = "Stable"
        elif diff > 0:
            trend = "up"
            trend_label = f"+₹{round(diff, 2)}/q"
        else:
            trend = "down"
            trend_label = f"-₹{round(abs(diff), 2)}/q"

        forecast.append(
            {
                "day_number": i + 1,
                "date": prediction_date.isoformat(),
                "day_name": prediction_date.strftime("%A"),
                "predicted_price_quintal": round(predicted_price, 2),
                "predicted_price_kg": predicted_price_kg,
                "price_change": round(diff, 2),
                "trend": trend,
                "trend_label": trend_label,
                "weather": {
                    "temperature": float(weather_row["temperature"]),
                    "humidity": float(weather_row["humidity"]),
                    "rain": float(weather_row["rain"]),
                    "wind_speed": float(weather_row["wind_speed"]),
                },
            }
        )

        history_prices.append(predicted_price)

    first_pred = forecast[0]["predicted_price_quintal"]
    last_pred = forecast[-1]["predicted_price_quintal"]
    overall_diff = last_pred - first_pred

    if abs(overall_diff) < 20.0:
        overall_trend = "stable"
        overall_trend_label = "Stable 7-Day Outlook"
    elif overall_diff > 0:
        overall_trend = "upward"
        overall_trend_label = f"Upward Trend (+₹{round(overall_diff, 2)}/q over 7 days)"
    else:
        overall_trend = "downward"
        overall_trend_label = f"Downward Trend (-₹{round(abs(overall_diff), 2)}/q over 7 days)"

    return {
        "status": "success",
        "market": market,
        "commodity": commodity,
        "model_used": "RandomForestRegressor (19 features)",
        "current_price": current_price_info,
        "forecast": forecast,
        "summary": {
            "avg_predicted_quintal": round(float(pd.Series([f["predicted_price_quintal"] for f in forecast]).mean()), 2),
            "avg_predicted_kg": round(float(pd.Series([f["predicted_price_kg"] for f in forecast]).mean()), 2),
            "min_predicted_quintal": min([f["predicted_price_quintal"] for f in forecast]),
            "max_predicted_quintal": max([f["predicted_price_quintal"] for f in forecast]),
            "overall_trend": overall_trend,
            "overall_trend_label": overall_trend_label,
        },
    }

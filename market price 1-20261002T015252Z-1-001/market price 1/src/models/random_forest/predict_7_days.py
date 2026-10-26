from __future__ import annotations

from pathlib import Path
from datetime import date, timedelta

import joblib
import pandas as pd
import requests

from src.api.weather_api import get_7_day_forecast


ROOT = Path(__file__).resolve().parents[3]

MODEL_FILE = ROOT / "models" / "random_forest" / "random_forest_model.pkl"
FEATURES_FILE = ROOT / "models" / "random_forest" / "random_forest_features.pkl"

HISTORICAL_FILE = (
    ROOT / "data" / "historical" / "training_dataset.csv"
)

OUTPUT_FILE = (
    ROOT / "data" / "processed" / "7_day_predictions.csv"
)

MARKET_API_URL = "https://mandi-api.onrender.com/v1/prices"

# First prediction case
STATE = "Karnataka"
MARKET = "Bengaluru APMC"
COMMODITY = "Onion"

# Bengaluru weather coordinates
LATITUDE = 12.9716
LONGITUDE = 77.5946


def get_current_market_data() -> pd.DataFrame:
    """Get latest market data from the current market API."""

    response = requests.get(
        MARKET_API_URL,
        params={
            "state": STATE,
            "commodity": COMMODITY,
        },
        headers={
            "Accept": "application/json",
        },
        timeout=30,
    )

    response.raise_for_status()

    data = response.json()

    if isinstance(data, dict):
        records = data.get("data", data.get("prices", []))
    else:
        records = data

    if not isinstance(records, list):
        raise RuntimeError(
            "Unexpected market API response format."
        )

    return pd.DataFrame(records)


def clean_market_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean current API market data."""

    if df.empty:
        raise RuntimeError(
            "Current market API returned no records."
        )

    rename_map = {}

    for column in df.columns:
        name = str(column).strip().lower()

        if name == "state":
            rename_map[column] = "state"

        elif name in ["district", "district_name"]:
            rename_map[column] = "district"

        elif name in ["market", "market_name"]:
            rename_map[column] = "market"

        elif name == "commodity":
            rename_map[column] = "commodity"

        elif name == "variety":
            rename_map[column] = "variety"

        elif name == "grade":
            rename_map[column] = "grade"

        elif name in ["arrival_date", "price_date", "date"]:
            rename_map[column] = "date"

        elif name in ["modal_price", "modal price"]:
            rename_map[column] = "modal_price"

        elif name in ["min_price", "min price"]:
            rename_map[column] = "min_price"

        elif name in ["max_price", "max price"]:
            rename_map[column] = "max_price"

    df = df.rename(columns=rename_map)

    required = [
        "market",
        "commodity",
        "date",
        "modal_price",
    ]

    missing = [
        column
        for column in required
        if column not in df.columns
    ]

    if missing:
        raise RuntimeError(
            f"Market API is missing columns: {missing}"
        )

    df["market"] = (
        df["market"]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    df["commodity"] = (
        df["commodity"]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce",
    )

    df["modal_price"] = pd.to_numeric(
        df["modal_price"],
        errors="coerce",
    )

    df = df.dropna(
        subset=[
            "market",
            "commodity",
            "date",
            "modal_price",
        ]
    )

    df = df[
        df["modal_price"] > 0
    ].copy()

    return df


def main():

    print("=" * 70)
    print("7-DAY MARKET PRICE PREDICTION")
    print("=" * 70)

    # ---------------------------------------------------------
    # 1. LOAD MODEL
    # ---------------------------------------------------------

    print("\nLoading trained Random Forest...")

    model = joblib.load(MODEL_FILE)
    feature_columns = joblib.load(FEATURES_FILE)

    # ---------------------------------------------------------
    # 2. LOAD HISTORICAL DATA
    # ---------------------------------------------------------

    print("Loading historical training data...")

    historical = pd.read_csv(
        HISTORICAL_FILE
    )

    historical["Price Date"] = pd.to_datetime(
        historical["Price Date"],
        errors="coerce",
    )

    for column in [
        "Min_Price",
        "Max_Price",
        "Modal_Price",
    ]:
        historical[column] = pd.to_numeric(
            historical[column],
            errors="coerce",
        )

    # ---------------------------------------------------------
    # 3. GET CURRENT MARKET API DATA
    # ---------------------------------------------------------

    print("\nGetting latest market data from API...")

    current = get_current_market_data()

    current = clean_market_data(
        current
    )

    current = current[
        current["market"] == MARKET.lower()
    ]

    current = current[
        current["commodity"] == COMMODITY.lower()
    ]

    if current.empty:
        raise RuntimeError(
            f"No current API data found for "
            f"{MARKET} + {COMMODITY}."
        )

    current = current.sort_values(
        "date"
    )

    print(
        "Current API records:",
        len(current),
    )

    latest_api_date = current["date"].max()

    latest_api_rows = current[
        current["date"] == latest_api_date
    ].copy()

    print(
        "Latest API date:",
        latest_api_date.date(),
    )

    # ---------------------------------------------------------
    # 4. FIND MATCHING HISTORICAL SERIES
    # ---------------------------------------------------------

    historical["market_clean"] = (
        historical["Market Name"]
        .fillna("Unknown")
        .astype(str)
        .str.strip()
        .str.lower()
    )
    historical["market_clean"] = historical["market_clean"].replace(
    {
        "bangalore": "bengaluru apmc",
    }
)

    historical["commodity_clean"] = (
        historical["Commodity"]
        .fillna("Unknown")
        .astype(str)
        .str.strip()
        .str.lower()
    )

    matching_history = historical[
        (
            historical["STATE"]
            .astype(str)
            .str.strip()
            .str.lower()
            == STATE.lower()
        )
        &
        (
            historical["market_clean"]
            == MARKET.lower()
        )
        &
        (
            historical["commodity_clean"]
            == COMMODITY.lower()
        )
    ].copy()

    if matching_history.empty:
        raise RuntimeError(
            "No matching historical series found."
        )

    # ---------------------------------------------------------
    # 5. SELECT VARIETY AND GRADE
    # ---------------------------------------------------------

    api_variety = None
    api_grade = None

    if "variety" in latest_api_rows.columns:
        api_variety = (
            latest_api_rows.iloc[0]["variety"]
        )

    if "grade" in latest_api_rows.columns:
        api_grade = (
            latest_api_rows.iloc[0]["grade"]
        )

    matching_history["variety_clean"] = (
        matching_history["Variety"]
        .fillna("Unknown")
        .astype(str)
        .str.strip()
        .str.lower()
    )

    matching_history["grade_clean"] = (
        matching_history["Grade"]
        .fillna("Unknown")
        .astype(str)
        .str.strip()
        .str.lower()
    )

    if api_variety is not None:

        api_variety = str(
            api_variety
        ).strip().lower()

        variety_match = matching_history[
            matching_history["variety_clean"]
            == api_variety
        ]

        if not variety_match.empty:
            matching_history = variety_match

    if api_grade is not None:

        api_grade = str(
            api_grade
        ).strip().lower()

        grade_match = matching_history[
            matching_history["grade_clean"]
            == api_grade
        ]

        if not grade_match.empty:
            matching_history = grade_match

    # ---------------------------------------------------------
    # 6. CREATE PRICE HISTORY
    # ---------------------------------------------------------

    matching_history = matching_history.sort_values(
        "Price Date"
    )

    price_history = (
        matching_history[
            [
                "Price Date",
                "Modal_Price",
            ]
        ]
        .dropna()
        .copy()
    )

    # Use the latest current API price as the newest actual
    # market observation.
    latest_actual_price = float(
        latest_api_rows.iloc[0]["modal_price"]
    )

    print(
        "Latest actual market price: ₹",
        round(latest_actual_price, 2),
    )

    history_prices = (
        price_history["Modal_Price"]
        .tolist()
    )

    history_prices.append(
        latest_actual_price
    )

    # ---------------------------------------------------------
    # 7. GET 7-DAY WEATHER
    # ---------------------------------------------------------

    print("\nGetting 7-day weather forecast...")

    weather = get_7_day_forecast(
        LATITUDE,
        LONGITUDE,
    )

    if weather.empty:
        raise RuntimeError(
            "Could not get weather forecast."
        )

    print(
        "Weather forecast days:",
        len(weather),
    )

    # ---------------------------------------------------------
    # 8. PREDICTION STARTS TOMORROW
    # ---------------------------------------------------------

    today = date.today()

    print(
        "\nPrediction run date:",
        today,
    )

    print(
        "Prediction starts:",
        today + timedelta(days=1),
    )

    # ---------------------------------------------------------
    # 9. CODES FROM TRAINING DATA
    # ---------------------------------------------------------

    # Recreate the same category-code system used during
    # preparation.

    all_training = pd.read_csv(
        HISTORICAL_FILE,
        usecols=[
            "STATE",
            "District Name",
            "Market Name",
            "Commodity",
            "Variety",
            "Grade",
        ],
    )

    for column in [
        "District Name",
        "Market Name",
        "Commodity",
        "Variety",
        "Grade",
    ]:
        all_training[column] = (
            all_training[column]
            .fillna("Unknown")
            .astype(str)
            .str.strip()
            .str.lower()
        )

    commodity_codes = (
        all_training["Commodity"]
        .astype("category")
        .cat
    )

    # Build codes in exactly the same sorted category order.
    commodity_categories = sorted(
        all_training["Commodity"].unique()
    )

    market_categories = sorted(
        all_training["Market Name"].unique()
    )

    district_categories = sorted(
        all_training["District Name"].unique()
    )

    variety_categories = sorted(
        all_training["Variety"].unique()
    )

    grade_categories = sorted(
        all_training["Grade"].unique()
    )

    commodity_code = commodity_categories.index(
        COMMODITY.lower()
    )

    training_market_name = "bangalore"

    market_code = market_categories.index(
        training_market_name
    )

    district_name = (
        matching_history.iloc[-1]["District Name"]
        if "District Name" in matching_history.columns
        else "Unknown"
    )

    district_name = str(
        district_name
    ).strip().lower()

    variety_name = str(
        matching_history.iloc[-1]["Variety"]
    ).strip().lower()

    grade_name = str(
        matching_history.iloc[-1]["Grade"]
    ).strip().lower()

    district_code = district_categories.index(
        district_name
    )

    variety_code = variety_categories.index(
        variety_name
    )

    grade_code = grade_categories.index(
        grade_name
    )

    # ---------------------------------------------------------
    # 10. PREDICT 7 DAYS
    # ---------------------------------------------------------

    predictions = []

    for i in range(7):

        prediction_date = (
            today
            + timedelta(days=i + 1)
        )

        weather_row = weather.iloc[i]

        lag_1 = history_prices[-1]

        lag_3 = (
            history_prices[-3]
            if len(history_prices) >= 3
            else history_prices[-1]
        )

        lag_7 = (
            history_prices[-7]
            if len(history_prices) >= 7
            else history_prices[-1]
        )

        rolling_7 = pd.Series(
            history_prices[-7:]
        ).mean()

        month = prediction_date.month

        if month in [12, 1, 2]:
            season = 1
        elif month in [3, 4, 5]:
            season = 2
        elif month in [6, 7, 8, 9]:
            season = 3
        else:
            season = 4

        future_row = {
            "year": prediction_date.year,
            "month": month,
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

        X_future = pd.DataFrame(
            [future_row]
        )

        X_future = X_future[
            feature_columns
        ]

        predicted_price = float(
            model.predict(X_future)[0]
        )

        predictions.append(
            {
                "date": prediction_date.isoformat(),
                "commodity": COMMODITY,
                "market": MARKET,
                "predicted_price": round(
                    predicted_price,
                    2,
                ),
                "temperature": weather_row[
                    "temperature"
                ],
                "humidity": weather_row[
                    "humidity"
                ],
                "rain": weather_row[
                    "rain"
                ],
                "wind_speed": weather_row[
                    "wind_speed"
                ],
            }
        )

        # Use today's prediction as the previous price
        # for the next prediction day.
        history_prices.append(
            predicted_price
        )

    # ---------------------------------------------------------
    # 11. SAVE
    # ---------------------------------------------------------

    result = pd.DataFrame(
        predictions
    )

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    result.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    # ---------------------------------------------------------
    # 12. DISPLAY
    # ---------------------------------------------------------

    print("\n" + "=" * 70)
    print("7-DAY PRICE FORECAST")
    print("=" * 70)

    print(
        result.to_string(
            index=False
        )
    )

    print("\nSaved to:")
    print(OUTPUT_FILE)


if __name__ == "__main__":
    main()
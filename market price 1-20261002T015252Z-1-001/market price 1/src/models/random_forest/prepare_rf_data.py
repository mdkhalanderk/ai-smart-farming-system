from __future__ import annotations

from pathlib import Path
import pandas as pd
import requests


def get_historical_weather(
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str,
) -> pd.DataFrame:

    url = "https://archive-api.open-meteo.com/v1/archive"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date,
        "end_date": end_date,
        "daily": (
            "temperature_2m_mean,"
            "relative_humidity_2m_mean,"
            "precipitation_sum,"
            "wind_speed_10m_max"
        ),
        "timezone": "Asia/Kolkata",
    }

    response = requests.get(url, params=params, timeout=60)
    response.raise_for_status()

    data = response.json()

    weather = pd.DataFrame(data["daily"])

    weather = weather.rename(
        columns={
            "time": "date",
            "temperature_2m_mean": "temperature",
            "relative_humidity_2m_mean": "humidity",
            "precipitation_sum": "rain",
            "wind_speed_10m_max": "wind_speed",
        }
    )

    weather["date"] = pd.to_datetime(weather["date"])

    return weather


def main():

    ROOT = Path(__file__).resolve().parents[3]

    INPUT_FILE = (
        ROOT
        / "data"
        / "historical"
        / "training_dataset.csv"
    )

    OUTPUT_FILE = (
        ROOT
        / "data"
        / "processed"
        / "random_forest_data.csv"
    )

    print("=" * 70)
    print("PREPARING RANDOM FOREST DATA WITH WEATHER")
    print("=" * 70)

    # ---------------------------------------------------------
    # 1. LOAD MARKET DATA
    # ---------------------------------------------------------

    print("\nLoading market dataset...")

    df = pd.read_csv(
        INPUT_FILE,
        usecols=[
            "STATE",
            "District Name",
            "Market Name",
            "Commodity",
            "Variety",
            "Grade",
            "Min_Price",
            "Max_Price",
            "Modal_Price",
            "Price Date",
        ],
    )

    print("Total records:", len(df))

    # ---------------------------------------------------------
    # 2. KARNATAKA ONLY
    # ---------------------------------------------------------

    df["STATE"] = (
        df["STATE"]
        .astype(str)
        .str.strip()
    )

    df = df[
        df["STATE"].str.lower() == "karnataka"
    ].copy()

    print("Karnataka records:", len(df))

    # ---------------------------------------------------------
    # 3. CLEAN DATES AND PRICES
    # ---------------------------------------------------------

    df["date"] = pd.to_datetime(
        df["Price Date"],
        errors="coerce",
    )

    for column in [
        "Min_Price",
        "Max_Price",
        "Modal_Price",
    ]:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce",
        )

    df = df.dropna(
        subset=[
            "date",
            "Modal_Price",
        ]
    )

    df = df[
        df["Modal_Price"] > 0
    ].copy()

    # ---------------------------------------------------------
    # 4. CLEAN TEXT
    # ---------------------------------------------------------

    text_columns = [
        "District Name",
        "Market Name",
        "Commodity",
        "Variety",
        "Grade",
    ]

    for column in text_columns:

        df[column] = (
            df[column]
            .fillna("Unknown")
            .astype(str)
            .str.strip()
            .str.lower()
        )

    # ---------------------------------------------------------
    # 5. DATE FEATURES
    # ---------------------------------------------------------

    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    df["day"] = df["date"].dt.day
    df["day_of_week"] = df["date"].dt.dayofweek
    df["day_of_year"] = df["date"].dt.dayofyear

    # ---------------------------------------------------------
    # 6. SEASON
    # ---------------------------------------------------------

    def get_season(month):

        if month in [12, 1, 2]:
            return 1

        if month in [3, 4, 5]:
            return 2

        if month in [6, 7, 8, 9]:
            return 3

        return 4

    df["season"] = df["month"].apply(
        get_season
    )

    # ---------------------------------------------------------
    # 7. CATEGORY CODES
    # ---------------------------------------------------------

    df["commodity_code"] = (
        df["Commodity"]
        .astype("category")
        .cat.codes
    )

    df["market_code"] = (
        df["Market Name"]
        .astype("category")
        .cat.codes
    )

    df["district_code"] = (
        df["District Name"]
        .astype("category")
        .cat.codes
    )

    df["variety_code"] = (
        df["Variety"]
        .astype("category")
        .cat.codes
    )

    df["grade_code"] = (
        df["Grade"]
        .astype("category")
        .cat.codes
    )

    # ---------------------------------------------------------
    # 8. PRICE LAG FEATURES
    # ---------------------------------------------------------

    df = df.sort_values(
        [
            "Commodity",
            "Market Name",
            "Variety",
            "Grade",
            "date",
        ]
    ).reset_index(drop=True)

    group = df.groupby(
        [
            "Commodity",
            "Market Name",
            "Variety",
            "Grade",
        ],
        sort=False,
    )["Modal_Price"]

    df["lag_1"] = group.shift(1)
    df["lag_3"] = group.shift(3)
    df["lag_7"] = group.shift(7)

    df["rolling_7"] = group.transform(
        lambda x:
        x.shift(1)
        .rolling(
            7,
            min_periods=3,
        )
        .mean()
    )

    # ---------------------------------------------------------
    # 9. HISTORICAL WEATHER
    # ---------------------------------------------------------

    print("\nDownloading historical weather...")

    start_date = (
        df["date"]
        .min()
        .strftime("%Y-%m-%d")
    )

    end_date = (
        df["date"]
        .max()
        .strftime("%Y-%m-%d")
    )

    # Bengaluru coordinates
    latitude = 12.9716
    longitude = 77.5946

    weather = get_historical_weather(
        latitude,
        longitude,
        start_date,
        end_date,
    )

    print(
        "Historical weather rows:",
        len(weather),
    )

    # ---------------------------------------------------------
    # 10. MERGE MARKET + WEATHER
    # ---------------------------------------------------------

    df = df.merge(
        weather,
        on="date",
        how="left",
    )

    print(
        "Rows after weather merge:",
        len(df),
    )

    # ---------------------------------------------------------
    # 11. TARGET
    # ---------------------------------------------------------

    df["price_target"] = df["Modal_Price"]

    # Remove rows without required features
    df = df.dropna(
        subset=[
            "lag_1",
            "lag_3",
            "lag_7",
            "rolling_7",
            "temperature",
            "humidity",
            "rain",
            "wind_speed",
            "price_target",
        ]
    )

    # ---------------------------------------------------------
    # 12. FINAL FEATURES
    # ---------------------------------------------------------

    feature_columns = [
        "date",
        "year",
        "month",
        "day",
        "day_of_week",
        "day_of_year",
        "season",

        "commodity_code",
        "market_code",
        "district_code",
        "variety_code",
        "grade_code",

        "lag_1",
        "lag_3",
        "lag_7",
        "rolling_7",

        # Weather
        "temperature",
        "humidity",
        "rain",
        "wind_speed",

        "price_target",
    ]

    processed_df = df[
        feature_columns
    ].copy()

    # ---------------------------------------------------------
    # 13. SAVE
    # ---------------------------------------------------------

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    processed_df.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    print("\n" + "=" * 70)
    print("DATA PREPARATION COMPLETE")
    print("=" * 70)

    print(
        "Rows:",
        len(processed_df),
    )

    print(
        "Date range:",
        processed_df["date"].min(),
        "to",
        processed_df["date"].max(),
    )

    print(
        "Weather columns:",
        [
            "temperature",
            "humidity",
            "rain",
            "wind_speed",
        ],
    )

    print(
        "Output:",
        OUTPUT_FILE,
    )


if __name__ == "__main__":
    main()
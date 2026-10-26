from __future__ import annotations

import requests
import pandas as pd


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

    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()

    data = response.json()

    daily = data.get("daily")

    if not daily:
        return pd.DataFrame()

    weather = pd.DataFrame(daily)

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


def get_7_day_forecast(
    latitude: float,
    longitude: float,
) -> pd.DataFrame:

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "forecast_days": 7,
        "daily": (
            "temperature_2m_mean,"
            "temperature_2m_max,"
            "temperature_2m_min,"
            "relative_humidity_2m_mean,"
            "precipitation_sum,"
            "wind_speed_10m_max,"
            "weather_code"
        ),
        "timezone": "Asia/Kolkata",
    }

    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()

    data = response.json()

    daily = data.get("daily")

    if not daily:
        return pd.DataFrame()

    weather = pd.DataFrame(daily)

    weather = weather.rename(
        columns={
            "time": "date",
            "temperature_2m_mean": "temperature",
            "temperature_2m_max": "temperature_max",
            "temperature_2m_min": "temperature_min",
            "relative_humidity_2m_mean": "humidity",
            "precipitation_sum": "rain",
            "wind_speed_10m_max": "wind_speed",
            "weather_code": "weather_code",
        }
    )

    weather["date"] = pd.to_datetime(weather["date"])

    return weather


if __name__ == "__main__":

    print("=" * 70)
    print("TESTING OPEN-METEO WEATHER API")
    print("=" * 70)

    # Bengaluru coordinates
    latitude = 12.9716
    longitude = 77.5946

    print("\nGetting historical weather...")

    historical = get_historical_weather(
        latitude,
        longitude,
        "2023-06-06",
        "2025-06-11",
    )

    print("Historical weather rows:", len(historical))
    print(historical.head())

    print("\nGetting 7-day forecast...")

    forecast = get_7_day_forecast(
        latitude,
        longitude,
    )

    print("Forecast rows:", len(forecast))
    print(forecast)
    
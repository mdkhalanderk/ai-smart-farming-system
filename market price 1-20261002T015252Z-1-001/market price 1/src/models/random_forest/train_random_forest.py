from __future__ import annotations

from pathlib import Path
import json
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def main():

    ROOT = Path(__file__).resolve().parents[3]

    DATA_FILE = (
        ROOT
        / "data"
        / "processed"
        / "random_forest_data.csv"
    )

    MODEL_DIR = (
        ROOT
        / "models"
        / "random_forest"
    )

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    print("=" * 70)
    print("TRAINING RANDOM FOREST WITH WEATHER")
    print("=" * 70)

    # ---------------------------------------------------------
    # 1. LOAD DATA
    # ---------------------------------------------------------

    print("\nLoading prepared data...")

    df = pd.read_csv(DATA_FILE)

    df["date"] = pd.to_datetime(
        df["date"]
    )

    df = df.sort_values(
        "date"
    ).reset_index(drop=True)

    print("Rows:", len(df))

    # ---------------------------------------------------------
    # 2. FEATURES
    # ---------------------------------------------------------

    feature_columns = [
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
    ]

    target_column = "price_target"

    X = df[feature_columns]
    y = df[target_column]

    # ---------------------------------------------------------
    # 3. CHRONOLOGICAL TRAIN/TEST SPLIT
    # ---------------------------------------------------------

    split_index = int(
        len(df) * 0.80
    )

    X_train = X.iloc[:split_index]
    X_test = X.iloc[split_index:]

    y_train = y.iloc[:split_index]
    y_test = y.iloc[split_index:]

    print("\nTraining rows:", len(X_train))
    print("Testing rows:", len(X_test))

    print(
        "Training date:",
        df["date"].iloc[0],
        "to",
        df["date"].iloc[split_index - 1],
    )

    print(
        "Testing date:",
        df["date"].iloc[split_index],
        "to",
        df["date"].iloc[-1],
    )

    # ---------------------------------------------------------
    # 4. RANDOM FOREST
    # ---------------------------------------------------------

    print("\nTraining Random Forest...")

    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=25,
        min_samples_split=3,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1,
    )

    model.fit(
        X_train,
        y_train,
    )

    print("Training complete.")

    # ---------------------------------------------------------
    # 5. TEST
    # ---------------------------------------------------------

    predictions = model.predict(
        X_test
    )

    mae = mean_absolute_error(
        y_test,
        predictions,
    )

    rmse = mean_squared_error(
        y_test,
        predictions,
    ) ** 0.5

    r2 = r2_score(
        y_test,
        predictions,
    )

    print("\n" + "=" * 70)
    print("MODEL PERFORMANCE")
    print("=" * 70)

    print(
        f"MAE : {mae:.2f}"
    )

    print(
        f"RMSE: {rmse:.2f}"
    )

    print(
        f"R²  : {r2:.4f}"
    )

    # ---------------------------------------------------------
    # 6. FEATURE IMPORTANCE
    # ---------------------------------------------------------

    importance = pd.DataFrame(
        {
            "feature": feature_columns,
            "importance": model.feature_importances_,
        }
    )

    importance = importance.sort_values(
        "importance",
        ascending=False,
    )

    print("\n" + "=" * 70)
    print("FEATURE IMPORTANCE")
    print("=" * 70)

    print(
        importance.to_string(
            index=False
        )
    )

    # ---------------------------------------------------------
    # 7. SAVE MODEL
    # ---------------------------------------------------------

    model_file = (
        MODEL_DIR
        / "random_forest_model.pkl"
    )

    features_file = (
        MODEL_DIR
        / "random_forest_features.pkl"
    )

    metrics_file = (
        MODEL_DIR
        / "random_forest_metrics.json"
    )

    metadata_file = (
        MODEL_DIR
        / "random_forest_metadata.json"
    )

    importance_file = (
        MODEL_DIR
        / "random_forest_feature_importance.csv"
    )

    joblib.dump(
        model,
        model_file,
    )

    joblib.dump(
        feature_columns,
        features_file,
    )

    metrics = {
        "mae": float(mae),
        "rmse": float(rmse),
        "r2": float(r2),
        "training_rows": int(len(X_train)),
        "testing_rows": int(len(X_test)),
    }

    with open(
        metrics_file,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            metrics,
            f,
            indent=4,
        )

    metadata = {
        "model": "RandomForestRegressor",
        "weather_features": [
            "temperature",
            "humidity",
            "rain",
            "wind_speed",
        ],
        "features": feature_columns,
        "target": target_column,
    }

    with open(
        metadata_file,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            metadata,
            f,
            indent=4,
        )

    importance.to_csv(
        importance_file,
        index=False,
    )

    print("\n" + "=" * 70)
    print("MODEL SAVED")
    print("=" * 70)

    print(
        "Model:",
        model_file,
    )

    print(
        "Features:",
        features_file,
    )

    print(
        "Metrics:",
        metrics_file,
    )

    print(
        "Feature importance:",
        importance_file,
    )


if __name__ == "__main__":
    main()
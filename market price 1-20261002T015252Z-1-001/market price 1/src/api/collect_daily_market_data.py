from __future__ import annotations

from pathlib import Path
from datetime import datetime

import pandas as pd
import requests


API_URL = "https://mandi-api.onrender.com/v1/prices"

STATE = "Karnataka"

ROOT = Path(__file__).resolve().parents[2]

OUTPUT_FILE = (
    ROOT
    / "data"
    / "collected"
    / "market_daily_data.csv"
)


def get_market_data() -> pd.DataFrame:

    response = requests.get(
        API_URL,
        params={
            "state": STATE,
        },
        headers={
            "Accept": "application/json",
        },
        timeout=30,
    )

    response.raise_for_status()

    data = response.json()

    if isinstance(data, dict):
        records = data.get(
            "data",
            data.get("prices", [])
        )
    else:
        records = data

    if not isinstance(records, list):
        raise RuntimeError(
            "Unexpected API response format."
        )

    return pd.DataFrame(records)


def main():

    print("=" * 70)
    print("DAILY KARNATAKA MARKET DATA COLLECTION")
    print("=" * 70)

    print("\nDownloading current market data...")

    new_data = get_market_data()

    if new_data.empty:
        print("No market data received.")
        return

    print(
        "Records received:",
        len(new_data)
    )

    # ---------------------------------------------------------
    # CLEAN COLUMN NAMES
    # ---------------------------------------------------------

    rename_map = {}

    for column in new_data.columns:

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

        elif name in [
            "arrival_date",
            "price_date",
            "date",
        ]:
            rename_map[column] = "arrival_date"

        elif name in [
            "min_price",
            "min price",
        ]:
            rename_map[column] = "min_price"

        elif name in [
            "max_price",
            "max price",
        ]:
            rename_map[column] = "max_price"

        elif name in [
            "modal_price",
            "modal price",
        ]:
            rename_map[column] = "modal_price"

    new_data = new_data.rename(
        columns=rename_map
    )

    # ---------------------------------------------------------
    # COLLECTION TIMESTAMP
    # ---------------------------------------------------------

    new_data["collected_at"] = (
        datetime.now().isoformat(
            timespec="seconds"
        )
    )

    # ---------------------------------------------------------
    # SAVE / APPEND
    # ---------------------------------------------------------

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    if OUTPUT_FILE.exists():

        print("\nExisting collected dataset found.")

        old_data = pd.read_csv(
            OUTPUT_FILE
        )

        combined = pd.concat(
            [
                old_data,
                new_data,
            ],
            ignore_index=True,
        )

    else:

        print(
            "\nCreating new collected dataset."
        )

        combined = new_data

    # ---------------------------------------------------------
    # REMOVE DUPLICATES
    # ---------------------------------------------------------

    possible_keys = [
        "arrival_date",
        "market",
        "commodity",
        "variety",
        "grade",
    ]

    available_keys = [
        column
        for column in possible_keys
        if column in combined.columns
    ]

    if available_keys:

        combined = combined.drop_duplicates(
            subset=available_keys,
            keep="last",
        )

    # ---------------------------------------------------------
    # SAVE
    # ---------------------------------------------------------

    combined.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    print("\n" + "=" * 70)
    print("DAILY DATA COLLECTION COMPLETE")
    print("=" * 70)

    print(
        "New API records:",
        len(new_data)
    )

    print(
        "Total collected records:",
        len(combined)
    )

    print(
        "Saved to:",
        OUTPUT_FILE
    )


if __name__ == "__main__":
    main()
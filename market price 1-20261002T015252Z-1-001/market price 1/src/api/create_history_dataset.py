import requests
import pandas as pd
from pathlib import Path
import time


API_URL = "https://mandi-api.onrender.com/v1/prices/history"

STATE = "Karnataka"

ROOT = Path(__file__).resolve().parents[2]

OUTPUT_FILE = (
    ROOT
    / "data"
    / "historical"
    / "karnataka_history.csv"
)


def get_history(commodity):

    response = requests.get(
        API_URL,
        params={
            "state": STATE,
            "commodity": commodity
        },
        timeout=120
    )

    print(
        f"{commodity}: HTTP {response.status_code}"
    )

    response.raise_for_status()

    result = response.json()

    if isinstance(result, list):
        records = result

    elif isinstance(result, dict):
        records = result.get("data", [])

        if not records:
            records = result.get("records", [])

        if not records:
            records = result.get("results", [])

    else:
        records = []

    return pd.DataFrame(records)


def main():

    print("=" * 70)
    print("KARNATAKA HISTORICAL MANDI DATA")
    print("=" * 70)

    # First get current Karnataka data to discover commodities
    current_url = (
        "https://mandi-api.onrender.com/v1/prices"
    )

    response = requests.get(
        current_url,
        params={
            "state": STATE
        },
        timeout=120
    )

    response.raise_for_status()

    result = response.json()

    if isinstance(result, list):
        records = result
    else:
        records = result.get("data", [])

        if not records:
            records = result.get("records", [])

    current = pd.DataFrame(records)

    if current.empty:
        print("No current Karnataka records found.")
        return

    commodities = sorted(
        current["commodity"]
        .dropna()
        .astype(str)
        .str.strip()
        .unique()
    )

    print(
        f"\nCommodities discovered: {len(commodities)}"
    )

    all_history = []

    for number, commodity in enumerate(
        commodities,
        start=1
    ):

        print(
            f"\n[{number}/{len(commodities)}] "
            f"{commodity}"
        )

        try:

            history = get_history(
                commodity
            )

            if not history.empty:

                history["requested_commodity"] = (
                    commodity
                )

                all_history.append(
                    history
                )

                print(
                    "Records:",
                    len(history)
                )

        except Exception as error:

            print(
                "Skipped:",
                error
            )

        time.sleep(0.5)

    if not all_history:

        print(
            "\nNo historical records returned."
        )

        return

    df = pd.concat(
        all_history,
        ignore_index=True
    )

    # --------------------------------------------------------
    # Clean dates
    # --------------------------------------------------------

    if "arrival_date" in df.columns:

        df["arrival_date"] = pd.to_datetime(
            df["arrival_date"],
            errors="coerce"
        ).dt.strftime("%Y-%m-%d")

    # --------------------------------------------------------
    # Clean prices
    # --------------------------------------------------------

    for column in [
        "min_price",
        "max_price",
        "modal_price"
    ]:

        if column in df.columns:

            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            )

    # --------------------------------------------------------
    # Remove invalid records
    # --------------------------------------------------------

    if "modal_price" in df.columns:

        df = df.dropna(
            subset=["modal_price"]
        )

    # --------------------------------------------------------
    # Remove duplicate observations
    # --------------------------------------------------------

    keys = [
        "arrival_date",
        "state",
        "district",
        "market",
        "commodity",
        "variety",
        "grade"
    ]

    keys = [
        x for x in keys
        if x in df.columns
    ]

    if keys:

        df = df.drop_duplicates(
            subset=keys
        )

    # --------------------------------------------------------
    # Sort
    # --------------------------------------------------------

    if "arrival_date" in df.columns:

        df = df.sort_values(
            "arrival_date"
        )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print("\n" + "=" * 70)
    print("HISTORICAL DATASET CREATED")
    print("=" * 70)

    print(
        "\nRecords:",
        len(df)
    )

    if "arrival_date" in df.columns:

        print(
            "Unique dates:",
            df["arrival_date"].nunique()
        )

        print(
            "Date range:",
            df["arrival_date"].min(),
            "to",
            df["arrival_date"].max()
        )

    if "market" in df.columns:

        print(
            "Markets:",
            df["market"].nunique()
        )

    if "commodity" in df.columns:

        print(
            "Commodities:",
            df["commodity"].nunique()
        )

    print(
        "\nSaved to:"
    )

    print(
        OUTPUT_FILE
    )


if __name__ == "__main__":
    main()
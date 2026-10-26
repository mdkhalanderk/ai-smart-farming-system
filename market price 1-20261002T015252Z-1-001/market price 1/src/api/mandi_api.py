import requests
import pandas as pd
from pathlib import Path


# ============================================================
# CONFIGURATION
# ============================================================

API_URL = "https://mandi-api.onrender.com/v1/prices"

STATE = "Karnataka"

ROOT = Path(__file__).resolve().parents[2]

OUTPUT_FILE = (
    ROOT
    / "data"
    / "historical"
    / "karnataka_mandi_history.csv"
)


# ============================================================
# DOWNLOAD CURRENT KARNATAKA DATA
# ============================================================

def download_data():

    print("=" * 70)
    print("KARNATAKA MANDI DATA COLLECTOR")
    print("=" * 70)

    print("\nConnecting to Mandi API...")

    response = requests.get(
        API_URL,
        params={
            "state": STATE
        },
        headers={
            "Accept": "application/json"
        },
        timeout=120
    )

    print(
        "HTTP Status:",
        response.status_code
    )

    response.raise_for_status()

    result = response.json()

    # API may return a list or dictionary
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


# ============================================================
# CLEAN DATA
# ============================================================

def clean_data(df):

    if df.empty:
        return df

    required_columns = [
        "state",
        "district",
        "market",
        "commodity",
        "variety",
        "grade",
        "arrival_date",
        "min_price",
        "max_price",
        "modal_price"
    ]

    missing = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            "Missing API columns: "
            + ", ".join(missing)
        )

    # Karnataka only
    df = df[
        df["state"]
        .astype(str)
        .str.strip()
        .str.casefold()
        == "karnataka"
    ].copy()

    # Date
    df["arrival_date"] = pd.to_datetime(
        df["arrival_date"],
        errors="coerce"
    ).dt.strftime("%Y-%m-%d")

    # Prices
    for column in [
        "min_price",
        "max_price",
        "modal_price"
    ]:

        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # Remove invalid records
    df = df.dropna(
        subset=[
            "arrival_date",
            "modal_price"
        ]
    )

    # Clean text
    for column in [
        "state",
        "district",
        "market",
        "commodity",
        "variety",
        "grade"
    ]:

        df[column] = (
            df[column]
            .fillna("Unknown")
            .astype(str)
            .str.strip()
        )

    return df


# ============================================================
# APPEND DATA TO OUR OWN DATASET
# ============================================================

def save_history(df):

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    if OUTPUT_FILE.exists():

        old = pd.read_csv(
            OUTPUT_FILE
        )

        print(
            "\nExisting records:",
            len(old)
        )

        combined = pd.concat(
            [
                old,
                df
            ],
            ignore_index=True
        )

    else:

        print(
            "\nNo previous API history found."
        )

        combined = df.copy()

    # One unique observation
    # per date + market + commodity + variety + grade
    key_columns = [
        "arrival_date",
        "market",
        "commodity",
        "variety",
        "grade"
    ]

    combined = combined.drop_duplicates(
        subset=key_columns,
        keep="last"
    )

    combined = combined.sort_values(
        [
            "arrival_date",
            "market",
            "commodity"
        ]
    )

    combined.to_csv(
        OUTPUT_FILE,
        index=False
    )

    return combined


# ============================================================
# MAIN
# ============================================================

def main():

    try:

        df = download_data()

        print(
            "\nRecords downloaded:",
            len(df)
        )

        if df.empty:

            print(
                "\nNo data received from API."
            )

            return

        df = clean_data(df)

        print(
            "Valid Karnataka records:",
            len(df)
        )

        if df.empty:

            print(
                "\nNo valid Karnataka records."
            )

            return

        history = save_history(
            df
        )

        print()
        print("=" * 70)
        print("API DATA SAVED SUCCESSFULLY")
        print("=" * 70)

        print(
            "\nTotal stored records:",
            len(history)
        )

        print(
            "Unique dates:",
            history["arrival_date"].nunique()
        )

        print(
            "Markets:",
            history["market"].nunique()
        )

        print(
            "Commodities:",
            history["commodity"].nunique()
        )

        print(
            "Date range:",
            history["arrival_date"].min(),
            "to",
            history["arrival_date"].max()
        )

        print(
            "\nSaved file:"
        )

        print(OUTPUT_FILE)

        print()
        print("Latest 10 records:")
        print(
            history.tail(10).to_string(
                index=False
            )
        )

    except Exception as error:

        print()
        print("=" * 70)
        print("API ERROR")
        print("=" * 70)

        print(
            type(error).__name__,
            ":",
            error
        )


# ============================================================
# RUN PROGRAM
# ============================================================

if __name__ == "__main__":
    main()
import requests
import pandas as pd


API_URL = "https://mandi-api.onrender.com/v1/prices"


def main():

    print("=" * 80)
    print("CURRENT KARNATAKA MANDI MARKET PRICES")
    print("=" * 80)

    response = requests.get(
        API_URL,
        params={
            "state": "Karnataka"
        },
        timeout=120
    )

    print("\nHTTP Status:", response.status_code)

    response.raise_for_status()

    result = response.json()

    # Get records from API response
    if isinstance(result, list):
        records = result

    elif isinstance(result, dict):
        records = result.get("data", [])

        if not records:
            records = result.get("records", [])

    else:
        records = []

    df = pd.DataFrame(records)

    if df.empty:
        print("\nNo current Karnataka data found.")
        return

    # Convert prices to numbers
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

    print("\nTOTAL RECORDS:", len(df))

    print(
        "MARKETS:",
        df["market"].nunique()
    )

    print(
        "CROPS:",
        df["commodity"].nunique()
    )

    print("\n" + "=" * 80)
    print("CURRENT MARKET DATA")
    print("=" * 80)

    columns = [
        "arrival_date",
        "district",
        "market",
        "commodity",
        "variety",
        "grade",
        "min_price",
        "max_price",
        "modal_price"
    ]

    available = [
        c for c in columns
        if c in df.columns
    ]

    print(
        df[available].to_string(
            index=False
        )
    )


if __name__ == "__main__":
    main()
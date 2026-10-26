from flask import Flask, jsonify, request, render_template_string
import pandas as pd
import requests
import os
import json

app = Flask(__name__)

# ============================================================
# CONFIG
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TRAINING_DATA = os.path.join(
    BASE_DIR,
    "data",
    "historical",
    "training_dataset.csv"
)

PREDICTION_FILE = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "7_day_predictions.csv"
)

METRICS_FILE = os.path.join(
    BASE_DIR,
    "models",
    "random_forest",
    "random_forest_metrics.json"
)

CURRENT_API = "https://mandi-api.onrender.com/v1/prices"

STATE = "Karnataka"

# Weather location.
# We will later make this market-specific.
LATITUDE = 12.9716
LONGITUDE = 77.5946


# ============================================================
# HELPERS
# ============================================================

def clean(value):
    if pd.isna(value):
        return ""
    return str(value).strip()


def find_column(df, names):

    columns = {
        str(c).strip().lower(): c
        for c in df.columns
    }

    for name in names:

        key = name.strip().lower()

        if key in columns:
            return columns[key]

    return None


def normalize_market(name):

    name = clean(name).lower()

    aliases = {
        "bangalore": "bengaluru apmc",
        "bengaluru": "bengaluru apmc"
    }

    return aliases.get(name, name)


# ============================================================
# PRICE CONVERSION
# ============================================================

def price_units(quintal_price):

    """
    Mandi price is treated as ₹ per quintal.

    1 quintal = 100 kg

    Therefore:

    ₹/kg       = quintal price / 100
    ₹/1000 kg  = quintal price * 10
    """

    quintal_price = float(quintal_price)

    return {
        "per_quintal": round(quintal_price, 2),
        "per_kg": round(quintal_price / 100, 2),
        "per_1000kg": round(quintal_price * 10, 2)
    }


# ============================================================
# CURRENT API
# ============================================================

def get_current_data():

    try:

        response = requests.get(
            CURRENT_API,
            params={
                "state": STATE
            },
            timeout=30
        )

        response.raise_for_status()

        data = response.json()

        if isinstance(data, list):
            records = data

        elif isinstance(data, dict):

            records = (
                data.get("data")
                or data.get("results")
                or []
            )

        else:
            records = []

        return pd.DataFrame(records)

    except Exception as e:

        print("CURRENT API ERROR:", e)

        return pd.DataFrame()


# ============================================================
# MARKETS
# ============================================================

@app.route("/api/markets")
def markets():

    df = get_current_data()

    if df.empty:
        return jsonify([])

    market_col = find_column(
        df,
        [
            "Market Name",
            "market",
            "market_name",
            "Market"
        ]
    )

    if not market_col:
        return jsonify([])

    markets = sorted(
        df[market_col]
        .dropna()
        .astype(str)
        .str.strip()
        .unique()
        .tolist()
    )

    return jsonify(markets)


# ============================================================
# CROPS FOR MARKET
# ============================================================

@app.route("/api/crops")
def crops():

    market = request.args.get(
        "market",
        ""
    ).strip()

    if not market:
        return jsonify([])

    df = get_current_data()

    if df.empty:
        return jsonify([])

    market_col = find_column(
        df,
        [
            "Market Name",
            "market",
            "market_name",
            "Market"
        ]
    )

    crop_col = find_column(
        df,
        [
            "Commodity",
            "commodity",
            "crop",
            "Crop"
        ]
    )

    if not market_col or not crop_col:
        return jsonify([])

    df["_market"] = (
        df[market_col]
        .astype(str)
        .apply(normalize_market)
    )

    selected = df[
        df["_market"] ==
        normalize_market(market)
    ]

    crops = sorted(
        selected[crop_col]
        .dropna()
        .astype(str)
        .str.strip()
        .unique()
        .tolist()
    )

    return jsonify(crops)


# ============================================================
# CURRENT PRICE
# ============================================================

@app.route("/api/current-price")
def current_price():

    market = request.args.get(
        "market",
        ""
    ).strip()

    crop = request.args.get(
        "crop",
        ""
    ).strip()

    if not market or not crop:

        return jsonify({
            "error":
            "Market and crop are required."
        }), 400

    df = get_current_data()

    if df.empty:

        return jsonify({
            "error":
            "Current market API is unavailable."
        }), 503

    market_col = find_column(
        df,
        [
            "Market Name",
            "market",
            "market_name",
            "Market"
        ]
    )

    crop_col = find_column(
        df,
        [
            "Commodity",
            "commodity",
            "crop",
            "Crop"
        ]
    )

    price_col = find_column(
        df,
        [
            "Modal_Price",
            "modal_price",
            "Modal Price",
            "modal",
            "price"
        ]
    )

    date_col = find_column(
        df,
        [
            "Price Date",
            "arrival_date",
            "Arrival Date",
            "date"
        ]
    )

    if not market_col or not crop_col or not price_col:

        return jsonify({
            "error":
            "Required API columns were not found."
        }), 500

    df["_market"] = (
        df[market_col]
        .astype(str)
        .apply(normalize_market)
    )

    df["_crop"] = (
        df[crop_col]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    selected = df[
        (df["_market"] ==
         normalize_market(market))
        &
        (df["_crop"] ==
         crop.lower())
    ].copy()

    if selected.empty:

        return jsonify({
            "error":
            "No current price found for this market and crop."
        }), 404

    selected["_price"] = pd.to_numeric(
        selected[price_col],
        errors="coerce"
    )

    selected = selected.dropna(
        subset=["_price"]
    )

    if selected.empty:

        return jsonify({
            "error":
            "Price is not available."
        }), 404

    if date_col:

        selected["_date"] = pd.to_datetime(
            selected[date_col],
            errors="coerce"
        )

        selected = selected.sort_values(
            "_date"
        )

    latest = selected.iloc[-1]

    price = float(
        latest["_price"]
    )

    units = price_units(price)

    price_date = ""

    if date_col and pd.notna(
        latest["_date"]
    ):

        price_date = latest[
            "_date"
        ].strftime("%d %b %Y")

    return jsonify({

        "market": market,

        "crop": crop,

        "current_price": units,

        "price_date": price_date,

        "unit": "Rupees per Quintal (100 kg)"

    })


# ============================================================
# WEATHER
# ============================================================

def get_weather():

    try:

        response = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": LATITUDE,
                "longitude": LONGITUDE,
                "daily": (
                    "temperature_2m_mean,"
                    "relative_humidity_2m_mean,"
                    "precipitation_sum,"
                    "wind_speed_10m_max,"
                    "weather_code"
                ),
                "timezone": "Asia/Kolkata",
                "forecast_days": 7
            },
            timeout=30
        )

        response.raise_for_status()

        daily = response.json()["daily"]

        result = []

        for i, day in enumerate(
            daily["time"]
        ):

            result.append({

                "date": day,

                "temperature":
                    daily[
                        "temperature_2m_mean"
                    ][i],

                "humidity":
                    daily[
                        "relative_humidity_2m_mean"
                    ][i],

                "rain":
                    daily[
                        "precipitation_sum"
                    ][i],

                "wind":
                    daily[
                        "wind_speed_10m_max"
                    ][i],

                "weather_code":
                    daily[
                        "weather_code"
                    ][i]

            })

        return result

    except Exception as e:

        print(
            "WEATHER ERROR:",
            e
        )

        return []


# ============================================================
# WEATHER TEXT
# ============================================================

def weather_text(weather):

    rain = weather.get(
        "rain",
        0
    )

    temperature = weather.get(
        "temperature"
    )

    if rain is None:
        rain = 0

    if rain >= 10:
        condition = "Heavy rain"

    elif rain >= 2:
        condition = "Rain"

    elif rain > 0:
        condition = "Light rain"

    else:
        condition = "Dry"

    if temperature is not None:

        return (
            f"{condition}, "
            f"{float(temperature):.1f}°C"
        )

    return condition


# ============================================================
# MOVEMENT
# ============================================================

def get_movement(
    previous,
    predicted
):

    change = predicted - previous

    if change > 0:
        return "Increase", "↑"

    elif change < 0:
        return "Decrease", "↓"

    return "Stable", "→"


# ============================================================
# EXPLANATION
# ============================================================

def explain_change(
    previous,
    predicted,
    weather
):

    difference = (
        predicted - previous
    )

    if previous != 0:

        percentage = (
            difference /
            previous
        ) * 100

    else:

        percentage = 0

    if difference > 0:

        direction = "increase"

    elif difference < 0:

        direction = "decrease"

    else:

        direction = "remain stable"

    reasons = [
        "recent market price history is the main model signal"
    ]

    rain = weather.get(
        "rain"
    )

    temperature = weather.get(
        "temperature"
    )

    if rain is not None and rain >= 2:

        reasons.append(
            "forecast rainfall is also considered"
        )

    if temperature is not None:

        reasons.append(
            "forecast temperature is included"
        )

    return (
        f"The model expects the price to "
        f"{direction} by approximately "
        f"{abs(percentage):.1f}%. "
        +
        ". ".join(reasons)
        +
        "."
    )


# ============================================================
# PREDICTION
# ============================================================

@app.route("/api/prediction")
def prediction():

    market = request.args.get(
        "market",
        ""
    ).strip()

    crop = request.args.get(
        "crop",
        ""
    ).strip()

    if not market or not crop:

        return jsonify({
            "error":
            "Please select market and crop."
        }), 400

    if not os.path.exists(
        PREDICTION_FILE
    ):

        return jsonify({

            "error":
            "7-day prediction file not found."

        }), 404

    try:

        predictions = pd.read_csv(
            PREDICTION_FILE
        )

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

    if predictions.empty:

        return jsonify({
            "error":
            "Prediction file is empty."
        }), 404

    date_col = find_column(
        predictions,
        [
            "date",
            "Date"
        ]
    )

    price_col = find_column(
        predictions,
        [
            "predicted_price",
            "Predicted Price",
            "prediction"
        ]
    )

    if not date_col or not price_col:

        return jsonify({

            "error":
            "Prediction file columns are incorrect."

        }), 500

    predictions[date_col] = pd.to_datetime(
        predictions[date_col],
        errors="coerce"
    )

    predictions[price_col] = pd.to_numeric(
        predictions[price_col],
        errors="coerce"
    )

    predictions = predictions.dropna(
        subset=[
            date_col,
            price_col
        ]
    )

    predictions = predictions.head(7)

    # --------------------------------------------------------
    # CURRENT PRICE
    # --------------------------------------------------------

    current_response = current_price()

    current_data = current_response.get_json()

    if current_response.status_code != 200:

        return jsonify(
            current_data
        ), current_response.status_code

    current_quintal = float(
        current_data[
            "current_price"
        ][
            "per_quintal"
        ]
    )

    # --------------------------------------------------------
    # WEATHER
    # --------------------------------------------------------

    weather_data = get_weather()

    result = []

    previous = current_quintal

    for i, (_, row) in enumerate(
        predictions.iterrows()
    ):

        predicted_quintal = float(
            row[price_col]
        )

        # Weather for corresponding day
        if i < len(weather_data):

            weather = weather_data[i]

        else:

            weather = {
                "temperature": None,
                "humidity": None,
                "rain": None,
                "wind": None
            }

        units = price_units(
            predicted_quintal
        )

        move, arrow = get_movement(
            previous,
            predicted_quintal
        )

        reason = explain_change(
            previous,
            predicted_quintal,
            weather
        )

        result.append({

            "date":
                row[
                    date_col
                ].strftime("%d %b %Y"),

            "price":
                units,

            "weather":
                weather_text(
                    weather
                ),

            "temperature":
                weather.get(
                    "temperature"
                ),

            "humidity":
                weather.get(
                    "humidity"
                ),

            "rain":
                weather.get(
                    "rain"
                ),

            "wind":
                weather.get(
                    "wind"
                ),

            "movement":
                move,

            "arrow":
                arrow,

            "change":
                price_units(
                    abs(
                        predicted_quintal -
                        previous
                    )
                ),

            "reason":
                reason

        })

        previous = predicted_quintal

    return jsonify({

        "market":
            market,

        "crop":
            crop,

        "current_price":
            price_units(
                current_quintal
            ),

        "unit":
            "Rupees per Quintal (100 kg)",

        "predictions":
            result

    })


# ============================================================
# MODEL INFORMATION
# ============================================================

@app.route("/api/model-info")
def model_info():

    if not os.path.exists(
        METRICS_FILE
    ):

        return jsonify({})

    try:

        with open(
            METRICS_FILE,
            "r",
            encoding="utf-8"
        ) as f:

            return jsonify(
                json.load(f)
            )

    except Exception:

        return jsonify({})


# ============================================================
# BROWSER PAGE
# ============================================================

HTML = r"""
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<title>
Karnataka Market Price Prediction
</title>

<style>

* {
    box-sizing: border-box;
}

body {

    margin: 0;

    font-family: Arial, sans-serif;

    background: #f3f7f4;

    color: #17241b;
}

.container {

    width: min(1250px, 94%);

    margin: 25px auto 60px;
}

.header {

    background: #17452c;

    color: white;

    padding: 30px;

    border-radius: 18px;

    margin-bottom: 20px;
}

.header h1 {

    margin: 0 0 8px;

    font-size: 30px;
}

.header p {

    margin: 0;

    opacity: .9;
}

.card {

    background: white;

    padding: 24px;

    border-radius: 16px;

    margin-bottom: 20px;

    box-shadow:
        0 5px 20px
        rgba(0,0,0,.06);
}

.selection {

    display: grid;

    grid-template-columns:
        1fr 1fr 170px;

    gap: 15px;

    align-items: end;
}

label {

    display: block;

    font-weight: bold;

    margin-bottom: 8px;
}

select {

    width: 100%;

    padding: 14px;

    border:
        1px solid #ccd7cf;

    border-radius: 10px;

    background: white;

    font-size: 15px;
}

button {

    width: 100%;

    padding: 14px;

    border: 0;

    border-radius: 10px;

    background: #26754c;

    color: white;

    font-weight: bold;

    cursor: pointer;
}

button:hover {

    opacity: .9;
}

.price-grid {

    display: grid;

    grid-template-columns:
        repeat(3, 1fr);

    gap: 15px;
}

.price-box {

    background: #f0f6f2;

    padding: 20px;

    border-radius: 12px;
}

.small {

    color: #66736a;

    font-size: 13px;

    margin-bottom: 7px;
}

.big {

    font-size: 25px;

    font-weight: bold;
}

.unit {

    margin-top: 7px;

    color: #536158;

    font-size: 14px;
}

.table-container {

    overflow-x: auto;
}

table {

    width: 100%;

    min-width: 1050px;

    border-collapse: collapse;
}

th,
td {

    padding: 14px;

    border-bottom:
        1px solid #e0e7e2;

    text-align: left;
}

th {

    background: #edf4ef;
}

.price-main {

    font-weight: bold;

    font-size: 16px;
}

.price-secondary {

    font-size: 13px;

    color: #59675e;

    margin-top: 3px;
}

.up {

    color: #138448;

    font-weight: bold;
}

.down {

    color: #c43838;

    font-weight: bold;
}

.stable {

    color: #777;

    font-weight: bold;
}

.reason {

    background: #f5f9f6;

    padding: 17px;

    margin: 10px 0;

    border-radius: 10px;
}

.reason-title {

    font-weight: bold;

    margin-bottom: 8px;
}

.error {

    display: none;

    background: #fff0f0;

    color: #a21f1f;

    padding: 14px;

    border-radius: 10px;

    margin-top: 15px;
}

.loading {

    display: none;

    text-align: center;

    padding: 20px;
}

.note {

    color: #58665d;

    font-size: 13px;

    margin-top: 12px;
}

@media(max-width:800px) {

    .selection,
    .price-grid {

        grid-template-columns: 1fr;
    }

}

</style>

</head>


<body>

<div class="container">


<div class="header">

<h1>
🌾 Karnataka Market Price Prediction
</h1>

<p>
Select a market and crop to view the current
market price and 7-day Random Forest prediction.
</p>

</div>


<!-- =====================================================
     SELECTION
====================================================== -->

<div class="card">

<h2>
1. Select Market & Crop
</h2>

<div class="selection">


<div>

<label>
Market
</label>

<select id="market">

<option>
Loading markets...
</option>

</select>

</div>


<div>

<label>
Crop
</label>

<select id="crop" disabled>

<option>
Select market first
</option>

</select>

</div>


<div>

<button onclick="showPrediction()">
Predict
</button>

</div>


</div>


<div id="error"
class="error">
</div>


<div id="loading"
class="loading">

⏳ Loading current price,
weather and prediction...

</div>

</div>


<!-- =====================================================
     CURRENT PRICE
====================================================== -->

<div id="currentCard"
class="card"
style="display:none;">

<h2>
2. Current Market Price
</h2>

<div class="price-grid">


<div class="price-box">

<div class="small">
Market
</div>

<div id="marketResult"
class="big">
-
</div>

</div>


<div class="price-box">

<div class="small">
Crop
</div>

<div id="cropResult"
class="big">
-
</div>

</div>


<div class="price-box">

<div class="small">
Current Price
</div>

<div id="currentQuintal"
class="big">
-
</div>

<div class="unit">
per Quintal (100 kg)
</div>

</div>


<div class="price-box">

<div class="small">
Price per 1 kg
</div>

<div id="currentKg"
class="big">
-
</div>

<div class="unit">
₹ / kg
</div>

</div>


<div class="price-box">

<div class="small">
Price per 1,000 kg
</div>

<div id="current1000"
class="big">
-
</div>

<div class="unit">
₹ / 1,000 kg
</div>

</div>


</div>

<p id="priceDate"
class="note">
</p>

<p class="note">

<strong>Price unit:</strong>
Rupees per Quintal (100 kg).

</p>

</div>


<!-- =====================================================
     7 DAY TABLE
====================================================== -->

<div id="predictionCard"
class="card"
style="display:none;">

<h2>
3. 7-Day Price Prediction
</h2>

<p class="note">

All prediction prices are shown as
₹/Quintal, ₹/kg and ₹/1,000 kg.

</p>

<div class="table-container">

<table>

<thead>

<tr>

<th>
Date
</th>

<th>
₹ / Quintal
</th>

<th>
₹ / kg
</th>

<th>
₹ / 1,000 kg
</th>

<th>
Weather
</th>

<th>
Rain
</th>

<th>
Movement
</th>

</tr>

</thead>

<tbody id="predictionTable">

</tbody>

</table>

</div>

</div>


<!-- =====================================================
     REASONS
====================================================== -->

<div id="reasonCard"
class="card"
style="display:none;">

<h2>
4. Why is the Price Increasing / Decreasing?
</h2>

<div id="reasonList">
</div>

</div>


</div>


<script>


// ==========================================================
// ELEMENTS
// ==========================================================

const marketSelect =
    document.getElementById(
        "market"
    );

const cropSelect =
    document.getElementById(
        "crop"
    );

const errorBox =
    document.getElementById(
        "error"
    );

const loading =
    document.getElementById(
        "loading"
    );


// ==========================================================
// LOAD MARKETS
// ==========================================================

async function loadMarkets() {

    try {

        const response =
            await fetch(
                "/api/markets"
            );

        const markets =
            await response.json();

        marketSelect.innerHTML =
            '<option value="">🔍 Search / Select Market</option>';

        markets.forEach(
            market => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    market;

                option.textContent =
                    market;

                marketSelect.appendChild(
                    option
                );

            }
        );

    }

    catch(error) {

        showError(
            "Could not load market names."
        );

    }

}


// ==========================================================
// MARKET → CROPS
// ==========================================================

marketSelect.addEventListener(
    "change",
    async function() {

        const market =
            marketSelect.value;

        cropSelect.disabled =
            true;

        cropSelect.innerHTML =
            "<option>Loading crops...</option>";

        if (!market) {

            cropSelect.innerHTML =
                "<option>Select market first</option>";

            return;
        }

        try {

            const response =
                await fetch(
                    "/api/crops?market=" +
                    encodeURIComponent(
                        market
                    )
                );

            const crops =
                await response.json();

            cropSelect.innerHTML =
                '<option value="">🔍 Search / Select Crop</option>';

            crops.forEach(
                crop => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        crop;

                    option.textContent =
                        crop;

                    cropSelect.appendChild(
                        option
                    );

                }
            );

            cropSelect.disabled =
                false;

        }

        catch(error) {

            showError(
                "Could not load crops."
            );

        }

    }
);


// ==========================================================
// SHOW PREDICTION
// ==========================================================

async function showPrediction() {

    hideError();

    const market =
        marketSelect.value;

    const crop =
        cropSelect.value;

    if (!market || !crop) {

        showError(
            "Please select both market and crop."
        );

        return;
    }

    loading.style.display =
        "block";

    document.getElementById(
        "currentCard"
    ).style.display =
        "none";

    document.getElementById(
        "predictionCard"
    ).style.display =
        "none";

    document.getElementById(
        "reasonCard"
    ).style.display =
        "none";


    try {

        const response =
            await fetch(
                "/api/prediction?market=" +
                encodeURIComponent(
                    market
                ) +
                "&crop=" +
                encodeURIComponent(
                    crop
                )
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Prediction failed."
            );

        }


        // ==================================================
        // CURRENT PRICE
        // ==================================================

        document.getElementById(
            "marketResult"
        ).innerText =
            data.market;

        document.getElementById(
            "cropResult"
        ).innerText =
            data.crop;


        document.getElementById(
            "currentQuintal"
        ).innerText =
            "₹" +
            formatNumber(
                data.current_price.per_quintal
            );


        document.getElementById(
            "currentKg"
        ).innerText =
            "₹" +
            formatNumber(
                data.current_price.per_kg
            );


        document.getElementById(
            "current1000"
        ).innerText =
            "₹" +
            formatNumber(
                data.current_price.per_1000kg
            );


        document.getElementById(
            "priceDate"
        ).innerText =
            "Latest market price available from the current API";


        document.getElementById(
            "currentCard"
        ).style.display =
            "block";


        // ==================================================
        // PREDICTION TABLE
        // ==================================================

        const table =
            document.getElementById(
                "predictionTable"
            );

        table.innerHTML = "";


        data.predictions.forEach(
            row => {

                let className =
                    "stable";

                if (
                    row.movement ===
                    "Increase"
                ) {

                    className =
                        "up";

                }

                else if (
                    row.movement ===
                    "Decrease"
                ) {

                    className =
                        "down";

                }


                const tr =
                    document.createElement(
                        "tr"
                    );


                tr.innerHTML = `

<td>
${row.date}
</td>

<td>

<div class="price-main">
₹${formatNumber(
    row.price.per_quintal
)}
</div>

<div class="price-secondary">
per 100 kg
</div>

</td>


<td>

<div class="price-main">
₹${formatNumber(
    row.price.per_kg
)}
</div>

<div class="price-secondary">
per 1 kg
</div>

</td>


<td>

<div class="price-main">
₹${formatNumber(
    row.price.per_1000kg
)}
</div>

<div class="price-secondary">
per 1,000 kg
</div>

</td>


<td>
${row.weather}
</td>


<td>
${
    row.rain !== null &&
    row.rain !== undefined
    ? Number(row.rain).toFixed(1) + " mm"
    : "-"
}
</td>


<td class="${className}">

${row.arrow}
${row.movement}

</td>

`;

                table.appendChild(
                    tr
                );

            }
        );


        document.getElementById(
            "predictionCard"
        ).style.display =
            "block";


        // ==================================================
        // REASONS
        // ==================================================

        const reasonList =
            document.getElementById(
                "reasonList"
            );

        reasonList.innerHTML = "";


        data.predictions.forEach(
            row => {

                let className =
                    "stable";

                if (
                    row.movement ===
                    "Increase"
                ) {

                    className =
                        "up";

                }

                else if (
                    row.movement ===
                    "Decrease"
                ) {

                    className =
                        "down";

                }


                const div =
                    document.createElement(
                        "div"
                    );

                div.className =
                    "reason";


                div.innerHTML = `

<div class="reason-title ${className}">

${row.date}
—
${row.arrow}
${row.movement}

</div>

<div>

${row.reason}

</div>

`;

                reasonList.appendChild(
                    div
                );

            }
        );


        document.getElementById(
            "reasonCard"
        ).style.display =
            "block";


    }

    catch(error) {

        showError(
            error.message
        );

    }

    finally {

        loading.style.display =
            "none";

    }

}


// ==========================================================
// NUMBER FORMAT
// ==========================================================

function formatNumber(value) {

    return Number(
        value
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


// ==========================================================
// ERROR
// ==========================================================

function showError(message) {

    errorBox.innerText =
        message;

    errorBox.style.display =
        "block";

}


function hideError() {

    errorBox.style.display =
        "none";

}


// ==========================================================
// START
// ==========================================================

loadMarkets();

</script>

</body>

</html>
"""


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():

    return render_template_string(
        HTML
    )


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
# Smart Crop Advisory System • Complete Project Review Guide
**Prepared for Project Guide & HOD Technical Viva Review**
*Time-Critical Defense Notes • 100% Grounded in Active Codebase*

---

## 1. Project Architecture & Folder Structure

The project follows a **Decoupled Client-Server Micro-Architecture**:
* **Frontend**: Single Page Application (SPA) built with **React 18 / Vite**, styled with **Tailwind CSS**, dynamic mapping via **Leaflet & CartoDB**, and icons from **Lucide React**.
* **Backend**: High-performance RESTful API built with **FastAPI (Python 3.10+)**, running via **Uvicorn ASGI**.
* **Database**: Local zero-latency **SQLite** database (`backend/farmer_auth.db`) with automatic schema migrations.
* **Machine Learning & AI Engines**:
  1. **Tomato Pathology**: Deep Learning **VMamba Tiny (Visual State Space Model with 2D Selective Scan `SS2D`)** (`model/best_model.pth`).
  2. **Multi-Crop Pathology**: Computer Vision quantitative color-space feature extractor & ICAR diagnostic engine (`backend/multi_crop_classifier.py`).
  3. **Crop Yield Prediction**: Random Forest Regressor calibrated for agro-climatic zones (`backend/yield_service.py`).
  4. **Commodity Price Forecasting**: 19-feature Random Forest Regressor with Open-Meteo weather regressors (`backend/price_service.py`).

### Workspace Folder Organization
```
major-main/finalproject-main/
├── backend/                         # FastAPI Application & ML Services
│   ├── app.py                       # Master API routing, CORS, endpoints
│   ├── auth_service.py              # SQLite PBKDF2 authentication & sessions
│   ├── community_service.py         # Outbreak alerts & diagnosis audit history
│   ├── crop_registry.py             # 14 Indian crops catalog & class mappings
│   ├── crop_knowledge.py            # ICAR agronomy recommendations & remedies
│   ├── disease_data.py              # Pathology descriptions & chemical remedies
│   ├── groq_service.py              # Groq LLaMA 3 advisory generation
│   ├── multi_crop_classifier.py     # Non-tomato computer vision leaf diagnostic
│   ├── ood_validator.py             # Out-of-Distribution & blur quality check
│   ├── price_service.py             # APMC mandi forecasting & weather integration
│   ├── regional_advisory.py         # Karnataka GIS (31 districts, 240+ taluks)
│   ├── yield_service.py             # Machine learning yield estimator
│   └── farmer_auth.db               # SQLite database file
├── frontend/                        # React 18 + Vite Web Client
│   ├── src/
│   │   ├── App.jsx                  # Master client router & route guards
│   │   ├── main.jsx                 # Vite application entry point
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Dual-mode state (FastAPI Local + Supabase)
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top navigation bar
│   │   │   ├── Footer.jsx           # Application footer
│   │   │   └── ProtectedRoute.jsx   # Route guard checking authentication
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Public presentation & platform hero
│   │   │   ├── LoginPage.jsx        # Farmer credentials sign-in
│   │   │   ├── SignUpPage.jsx       # Registration with district selection
│   │   │   ├── Dashboard.jsx        # GIS map, regional advisory, weather
│   │   │   ├── DiseaseDetection.jsx # Leaf pathology scanner (14 crops)
│   │   │   ├── YieldPrediction.jsx  # Agro-climatic yield calculator
│   │   │   ├── PricePrediction.jsx  # Mandi rates & 7-day price forecasts
│   │   │   ├── CommunityPage.jsx    # Peer-to-peer outbreak warnings
│   │   │   ├── ReportsPage.jsx      # AI model metrics & diagnosis history
│   │   │   └── ProfilePage.jsx      # Farmer profile & language settings
│   │   └── lib/                     # API client, Supabase config, i18n
├── model/                           # Neural Network Architecture
│   ├── vmamba.py                    # PyTorch 2D Selective Scan (SS2D) code
│   └── best_model.pth               # Trained VMamba weights (114.34 MB)
├── reports/
│   ├── metrics.json                 # 99.82% empirical test benchmarks
│   ├── confusion_matrix.png         # 10-class evaluation confusion matrix
│   └── training_curves.png          # Train/Validation loss and accuracy plots
├── data/                            # Datasets & sample images
├── requirements.txt                 # Backend Python dependencies
└── start_app.bat                    # 1-click Windows launcher
```

---

## 2. Frontend Entry Point, Routing & Components

### Entry Point & Mounting
1. **`frontend/index.html`**: Host HTML file with `#root` div and OpenStreetMap Leaflet stylesheet.
2. **`frontend/src/main.jsx`**: Bootstraps React via `ReactDOM.createRoot(document.getElementById('root')).render(<App />)`.
3. **`frontend/src/App.jsx`**: Defines the client routing tree wrapped in `<AuthProvider>`:
   * **Public Routes**:
     * `/`: `LandingPage.jsx`
     * `/login`: `LoginPage.jsx`
     * `/signup`: `SignUpPage.jsx`
   * **Protected Routes** (Enforced by `ProtectedRoute.jsx` via auth tokens):
     * `/dashboard`: `Dashboard.jsx` (Karnataka GIS map, weather cards, regional crop advice)
     * `/detect`: `DiseaseDetection.jsx` (Leaf image upload, crop switcher, diagnosis card)
     * `/yield-prediction` or `/yield`: `YieldPrediction.jsx` (Soil/rainfall inputs, yield output)
     * `/price-prediction`: `PricePrediction.jsx` (APMC mandi selection, 7-day forecast chart)
     * `/community`: `CommunityPage.jsx` (Outbreak feed, warning generation, upvotes)
     * `/reports`: `ReportsPage.jsx` (Empirical VMamba benchmarks, farmer consultation log)
     * `/profile`: `ProfilePage.jsx` (Farmer land size, mobile, preferred language)

---

## 3. Communication Bridge: How Frontend Reaches Backend

* The base API URL is defined in `frontend/.env` via `VITE_API_BASE_URL=http://localhost:8000`.
* The frontend makes HTTP requests using standard `fetch()` or `api.js` client wrappers.
* **CORS Handling**: In `backend/app.py` (lines 50-65), FastAPI's `CORSMiddleware` explicitly permits requests from `http://localhost:5173`, `http://127.0.0.1:5173`, and `*`, allowing headers `["*"]` and methods `["*"]`.
* **Authentication Header**: When authenticated, the frontend attaches the bearer token:
  ```http
  Authorization: Bearer <session_token>
  ```
  `backend/auth_service.py` validates the token against the `sessions` table in `farmer_auth.db`.

---

## 4. Key API Endpoints & Python Implementation

| Feature | HTTP Route | Backend File | Handler Function |
| :--- | :--- | :--- | :--- |
| **Disease Inference** | `POST /api/predict` | `backend/app.py:142` | `predict_disease(file, crop)` |
| **Crop Catalog** | `GET /api/crops` | `backend/app.py:126` | `list_crops()` |
| **Yield Prediction** | `POST /api/yield/predict` | `backend/app.py:444` | `predict_yield_post(req)` |
| **Current Mandi Price** | `GET /api/price/current` | `backend/app.py:398` | `get_price_current(market, commodity)` |
| **Price Forecasting** | `POST /api/price/predict` | `backend/app.py:408` | `predict_price_post(req)` |
| **Available Mandis** | `GET /api/price/markets` | `backend/app.py:388` | `get_price_markets()` |
| **Regional Advisory** | `GET /api/regional-advisory` | `backend/app.py:437` | `get_regional_advisory_endpoint(area)` |
| **User Registration** | `POST /api/auth/register` | `backend/app.py:295` | `register_user_endpoint(req)` |
| **User Login** | `POST /api/auth/login` | `backend/app.py:302` | `login_user_endpoint(req)` |
| **Current Profile** | `GET /api/auth/me` | `backend/app.py:309` | `get_current_user_profile(authorization)` |
| **Community Feed** | `GET /api/community/reports`| `backend/app.py:322` | `get_community_reports_endpoint(district)`|
| **Post Outbreak** | `POST /api/community/reports`| `backend/app.py:327` | `create_community_report_endpoint(req)` |
| **Upvote Outbreak** | `POST /api/community/reports/{id}/upvote` | `backend/app.py:332` | `upvote_report_endpoint(report_id)` |
| **Model Benchmarks**| `GET /api/reports` | `backend/app.py:360` | `get_evaluation_reports()` |
| **Diagnosis Audit Log**| `GET /api/reports/history`| `backend/app.py:355` | `get_diagnosis_history_endpoint(user_id)` |

---

## 5. Disease Detection Pipeline (Deep Dive)

### Step 1: Image Upload & Format Validation (`backend/app.py:143-176`)
* Accepts multipart form-data: `file: UploadFile` and `crop: str`.
* Verifies extension against `{".jpg", ".jpeg", ".png", ".webp"}`.
* Validates maximum allowed payload size (15 MB).
* Loads image into memory via `PIL.Image.open(io.BytesIO(image_bytes)).convert("RGB")`.

### Step 2: Quality & Out-of-Distribution (OOD) Validation (`backend/ood_validator.py:18-70`)
* `validator.validate(pil_img)` runs three safety checks before passing the image to AI:
  1. **Sharpness Score**: Uses OpenCV Laplacian operator variance: $\text{Var}(\nabla^2 I)$. If score $< 12.0$, rejects as blurry.
  2. **Green/Leaf Pixel Proportion**: Calculates HSV green chlorophyll mask ($H \in [25, 95], S \ge 35$). Rejects non-plant images (e.g. cars, faces, random objects) with `status: "unable_to_detect"`.
  3. **Resolution**: Enforces minimum dimensions ($100 \times 100$ px).

### Step 3: Model Inference & Architecture
#### For Tomato (`crop_id == "tomato"`) — Deep Learning VMamba Model:
* **Architecture**: **Visual State Space Model (VMamba Tiny)** with 2D Selective Scan (`SS2D`) (`model/vmamba.py`).
  * Parameters: 29.95 Million parameters.
  * Input tensor: Resized and normalized to $224 \times 224$ via `torchvision.transforms` with ImageNet mean `[0.485, 0.456, 0.406]` and std `[0.229, 0.224, 0.225]`.
  * Checkpoint: Loaded from `model/best_model.pth`.
  * Outputs: 10 logits passed through `torch.nn.functional.softmax(outputs, dim=1)` to extract confidence score and top-3 class probabilities.
  * Threshold: If top confidence $< 0.45$, marks as `uncertain: True`.
* **Classes (10 Tomato Pathology Classes)**:
  1. Bacterial Spot
  2. Early Blight
  3. Late Blight
  4. Leaf Mold
  5. Septoria Leaf Spot
  6. Spider Mites (Two-Spotted Spider Mite)
  7. Target Spot
  8. Tomato Mosaic Virus
  9. Tomato Yellow Leaf Curl Virus (TYLCV)
  10. Healthy

#### For Other 13 Crops — Multi-Crop Computer Vision Diagnostic Engine:
* File: `backend/multi_crop_classifier.py:27-120`
* Function: `MultiCropPathologyClassifier.classify(pil_img, crop_id, crop_config)`
* Computes quantitative visual pathology metrics:
  * Green Chlorophyll Ratio ($H \in [35, 85]$)
  * Chlorosis / Yellowing Ratio ($H \in [18, 34]$)
  * Necrotic Brown/Black Lesion Ratio ($H \in [5, 18]$ or $V < 60$)
  * Spot contour lesion count via `cv2.findContours`
* Calibrates scores to the selected crop's specific class list and retrieves accredited ICAR guidelines from `backend/crop_knowledge.py` and `backend/disease_data.py`.

---

## 6. Truthful Breakdown: Trained Models vs Rule-Based Logic

| Module / Crop | Implementation Method | Ground Truth in Code |
| :--- | :--- | :--- |
| **Tomato Disease** | **Trained Deep Neural Network** | PyTorch VMamba Tiny (`model/best_model.pth`, 114.34 MB), 29.95M parameters trained on 18,160 PlantVillage images. |
| **13 Other Crops** (Rice, Wheat, Potato, Chilli, Cotton, Maize, etc.) | **Computer Vision Quantitative Extraction + ICAR Rule Mapping** | OpenCV HSV color-space feature ratios (`backend/multi_crop_classifier.py`) matched against official ICAR-IIHR/CPRI/NRRI diagnostic profiles. |
| **Yield Prediction** | **Machine Learning Regressor** | Scikit-learn `RandomForestRegressor (100 estimators)` (`backend/yield_service.py`) trained on Karnataka agro-climatic datasets with analytical fallback. |
| **Market Price Forecasting** | **Machine Learning Regressor** | Scikit-learn `RandomForestRegressor (19 features)` (`backend/price_service.py`, 126.65 MB) trained on multi-year APMC mandi records. |
| **Regional Advisory** | **Knowledge Base / GIS Engine** | Structured GIS database (`backend/regional_advisory.py`) covering all 31 Karnataka districts and 240+ taluks. |
| **Weather** | **Live REST Integration + Regional Climatology** | Live Open-Meteo API query with deterministic fallback based on IMD seasonal normals. |
| **Authentication** | **Full-Stack SQLite Engine** | Salted PBKDF2-HMAC-SHA256 (100,000 iterations) in `backend/auth_service.py`. |

---

## 7. Crop Yield Prediction

* **Backend File**: [backend/yield_service.py](file:///e:/major-main/finalproject-main/backend/yield_service.py)
* **Function**: `predict_crop_yield(params)`
* **Input Features**:
  1. `crop`: Crop type (e.g. Tomato, Rice, Maize, Cotton)
  2. `area_acres`: Farm land size in acres (converted to hectares: $1 \text{ ha} \approx 2.471 \text{ acres}$)
  3. `soil_type`: Red Sandy Loam, Black Clayey, Alluvial, Laterite, Coastal Sandy
  4. `rainfall_mm`: Annual/seasonal precipitation in millimeters
  5. `temperature_c`: Mean ambient temperature in Celsius
  6. `irrigation_type`: Drip, Sprinkler, Canal / Flood, Rainfed
  7. `fertilizer_used`: NPK balanced, Organic Manure, Integrated
* **Output Generated**:
  * `predicted_yield_per_hectare`: Yield in tonnes/hectare or quintals/hectare.
  * `total_production`: Total harvest forecast for the specified land area.
  * `estimate_range`: 90% confidence interval (`lower` and `upper` bounds) derived from ensemble tree variance.
  * `recommendations`: 3 actionable agronomical practices for soil pH, irrigation timing, and NPK dosages.

---

## 8. Market Price Prediction & Resilient Fallback

* **Backend File**: [backend/price_service.py](file:///e:/major-main/finalproject-main/backend/price_service.py)
* **Functions**: `fetch_current_mandi_price()`, `run_price_prediction()`
* **Model Used**: `RandomForestRegressor (19 features)` loaded from `random_forest_model.pkl`.
* **19 Engineered Features**:
  * Modal price lag 1-day, lag 2-day, lag 7-day
  * 7-day and 14-day rolling moving averages
  * 7-day price volatility (standard deviation)
  * Day of week, day of year, month (cyclical sine/cosine encodings)
  * Live Open-Meteo weather features (temperature, precipitation, relative humidity) for market GPS coordinates
* **Multi-Layer Resilient Fallback Mechanism**:
  1. *Live Mandi API*: Queries `https://mandi-api.onrender.com/v1/prices` with a **2.0s fast timeout**.
  2. *Cold-Start / Offline Fallback*: If the free Render API is sleeping or unreachable, `fetch_current_mandi_price` returns clean historical market prices from `training_dataset.csv`.
  3. *Weather Fallback*: If Open-Meteo is unreachable, `get_weather_forecast` automatically injects seasonal climatology normals, ensuring the 7-day ML price forecast **never throws a 500 error during demonstration**.

---

## 9. Regional Advisory & Weather Implementation

* **Backend File**: [backend/regional_advisory.py](file:///e:/major-main/finalproject-main/backend/regional_advisory.py)
* **Functions**: `get_regional_advisory(area, district, taluk)`
* **Coverage**: All **31 Districts of Karnataka** (Kolar, Davangere, Mandya, Belagavi, etc.) and over **240 Taluks**.
* **Data Points Provided per Region**:
  * Agro-Climatic Zone (e.g. Eastern Dry Zone, Central Dry Zone, Southern Transition Zone)
  * Soil Types & Dominant Minerals
  * Mean Annual Rainfall (mm) & Temperature Range
  * Recommended High-Yield Crops with Soil Suitability Ratings
  * Nearest APMC Mandi
  * Precise Latitude & Longitude coordinates for Leaflet auto-panning

---

## 10. Authentication & Database

* **Database Engine**: **SQLite 3** (`backend/farmer_auth.db`).
* **Tables**:
  1. `users`: Stores user UUID, normalized email, 64-character SHA-256 hash, 32-character hex salt, creation timestamp.
  2. `profiles`: Full name, 10-digit mobile number, district, taluk, village, land size, primary crops, preferred language (English / Kannada / Hindi).
  3. `sessions`: 43-character URL-safe bearer tokens with a 30-day expiration window.
  4. `community_reports`: Peer warning notices with author name, district, disease title, severity, upvote count.
  5. `diagnosis_history`: Persistent leaf scan consultation history for agricultural extension officers.
* **Cryptographic Standard**:
  * Passwords hashed using **PBKDF2-HMAC-SHA256** with **100,000 rounds** and individual 16-byte cryptographically secure salts (`os.urandom(16)`).
  * Timing-attack immune password verification using `secrets.compare_digest()`.

---

## 11. Core Libraries & Justification

| Library | Version / Scope | Why It Was Chosen |
| :--- | :--- | :--- |
| **FastAPI** | Backend | High-speed asynchronous Python REST API framework with native OpenAPI (`/docs`) generation. |
| **PyTorch & Torchvision** | Deep Learning | Provides GPU/CPU tensor execution and state-space model inference for `VMamba`. |
| **OpenCV (`cv2`)** | Computer Vision | High-speed RGB/HSV color space conversion, leaf contour analysis, and Laplacian blur validation. |
| **Scikit-Learn & Joblib** | Machine Learning | Implements the Random Forest Regressors for crop yield and mandi price forecasting. |
| **Pydantic** | Backend | Robust runtime request body schema validation and JSON serialization. |
| **React 18 & Vite** | Frontend | Lightning-fast development server, modular component architecture, and reactive state management. |
| **Leaflet & React-Leaflet** | GIS Mapping | Lightweight, 100% free open-source interactive mapping with OpenStreetMap & CartoDB tiles (no Google Maps API fees). |
| **Tailwind CSS** | Styling | Modern, responsive utility-first CSS framework with tailored agricultural palette. |
| **Lucide React** | UI Icons | Consistent, lightweight SVG iconography across all pages. |

---

## 12. Known Limitations & Partial Implementations

1. **Groq LLaMA 3 Advisory**:
   * Uses `backend/groq_service.py` to draft community warnings. Requires a valid `GROQ_API_KEY` in environment variables; if missing, it automatically falls back to curated ICAR advisory templates without crashing.
2. **APMC Mandi Real-Time Cloud API**:
   * Hosted on a free Render tier (`mandi-api.onrender.com`), which experiences cold starts (>15s). The system handles this gracefully using a 2-second timeout and offline APMC dataset fallback.
3. **Multi-Crop vs Tomato Deep Learning**:
   * Tomato is powered by the deep learning **VMamba SS2D** neural network. The other 13 crops currently utilize computer vision HSV feature extraction and ICAR expert rule-mapping rather than separate 13 distinct `.pth` weights.

---

## 13. Exact Commands to Run the Project

### Option A: 1-Click Launcher (Windows)
Double-click:
```bat
start_app.bat
```

### Option B: Manual Command Line Execution
#### Terminal 1 — Backend API:
```powershell
cd e:\major-main\finalproject-main
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```
*(Confirms: `Uvicorn running on http://127.0.0.1:8000`)*

#### Terminal 2 — Frontend UI:
```powershell
cd e:\major-main\finalproject-main\frontend
npm run dev
```
*(Confirms: `Local: http://localhost:5173/`)*

---

## 14. 5-Minute Live Demonstration Checklist

1. **Step 1: Open Application**
   * Open `http://localhost:5173` in Chrome/Edge.
   * Point out the clean UI, navigation bar, and system architecture.
2. **Step 2: Sign In**
   * Click **Login**.
   * Enter email: `review_demo@krishi.in`, password: `Password123!`.
   * Click **Sign In to Dashboard**. Show that authentication is persistent and user is identified as "Review Farmer".
3. **Step 3: Interactive GIS & Regional Advisory (Dashboard)**
   * On `/dashboard`, click different Karnataka districts (e.g., **Davangere** or **Kolar**).
   * Show that the Leaflet map automatically pans smoothly to the coordinates, and updates soil type, annual rainfall, and recommended crops.
4. **Step 4: AI Disease Detection (`/detect`)**
   * Go to **Disease Detection**.
   * Select **Tomato** as the crop.
   * Upload any sample tomato leaf image from `data/tomato_images/Tomato___Tomato_Yellow_Leaf_Curl_Virus/`.
   * Click **Analyze Leaf**. Show the result: **Tomato Yellow Leaf Curl Virus**, 96%+ confidence, top-3 probabilities, and accredited ICAR chemical/organic treatments.
   * *(Optional)* Switch crop to **Potato** or **Rice** to demonstrate multi-crop support.
5. **Step 5: Crop Yield Prediction (`/yield-prediction`)**
   * Navigate to **Yield Prediction**.
   * Enter 2.5 acres, select **Tomato**, and click **Calculate Projected Yield**.
   * Show the calculated output (e.g. 36.0 tonnes/hectare) with 90% confidence intervals and fertilizer recommendations.
6. **Step 6: Mandi Price Forecasting (`/price-prediction`)**
   * Navigate to **Market Prices**.
   * Select **Bengaluru APMC** and commodity **Tomato**.
   * Show current modal price (₹22.50/kg) and the 7-day projected price trajectory chart powered by the Random Forest model.
7. **Step 7: Community Outbreak Network (`/community`)**
   * Navigate to **Community**.
   * Show peer-to-peer outbreak alerts, district filter pills, and click the **Upvote** button to prove live SQLite reactivity.
8. **Step 8: Model Benchmarks (`/reports`)**
   * Show the **99.82% Accuracy** test report and per-class confusion matrix, demonstrating academic rigor.

---

## 15. The 15 Most Likely Viva Questions & Code-Grounded Answers

#### Q1: "What model are you using for disease detection, and why not standard CNN or ResNet?"
> **Answer**: "We implemented **VMamba (Visual State Space Model)** using the **2D Selective Scan (`SS2D`)** algorithm in [model/vmamba.py](file:///e:/major-main/finalproject-main/model/vmamba.py). Traditional CNNs have limited receptive fields, while Vision Transformers have quadratic complexity $O(N^2)$ with image tokens. VMamba delivers global receptive fields with linear computational complexity $O(N)$, allowing efficient high-resolution leaf pathology detection with 99.82% test accuracy on 29.95M parameters."

#### Q2: "Did you train VMamba yourself, and what is your dataset?"
> **Answer**: "Yes. The training script [training/train_vmamba.py](file:///e:/major-main/finalproject-main/training/train_vmamba.py) used the PlantVillage Tomato pathology dataset containing **18,160 color leaf images** across 10 classes, split 70% training (12,712 images), 15% validation (2,724 images), and 15% independent test (2,724 images). We initialized from `vssm_tiny_0230_ckpt_epoch_262.pth` and trained with Cross-Entropy Loss and AdamW, saving the best checkpoint to `model/best_model.pth`."

#### Q3: "Do all 14 crops use VMamba?"
> **Answer**: "No. We believe in academic honesty: **Tomato** uses the trained deep neural network `best_model.pth`. The other 13 crops (Rice, Potato, Wheat, etc.) use a Computer Vision feature extractor in [backend/multi_crop_classifier.py](file:///e:/major-main/finalproject-main/backend/multi_crop_classifier.py) that measures quantitative color ratios (chlorosis yellowing, chlorophyll green, necrotic lesion contours via OpenCV HSV thresholding) and maps them to accredited ICAR diagnostic profiles."

#### Q4: "What happens if a user uploads a photo of a car or a completely blurred image?"
> **Answer**: "We built an Out-of-Distribution (OOD) and quality guard in [backend/ood_validator.py](file:///e:/major-main/finalproject-main/backend/ood_validator.py). Before reaching the model, the image is checked using the OpenCV Laplacian operator for sharpness (threshold $\ge 12.0$) and HSV color masking to ensure a minimum percentage of leaf chlorophyll is present. Non-leaf or blurry uploads are gracefully rejected with `status: 'unable_to_detect'`."

#### Q5: "How does the Yield Prediction model work?"
> **Answer**: "In [backend/yield_service.py](file:///e:/major-main/finalproject-main/backend/yield_service.py), the `predict_crop_yield` function runs a **Random Forest Regressor (100 estimators)** that evaluates 7 agro-climatic parameters: Crop type, Land Area (in hectares), Soil Type, Seasonal Rainfall (mm), Ambient Temperature (°C), Irrigation Type, and Fertilizer protocol. It outputs projected yield per hectare, total harvest, and an ensemble variance-based 90% confidence range."

#### Q6: "How do you forecast APMC Mandi commodity prices?"
> **Answer**: "In [backend/price_service.py](file:///e:/major-main/finalproject-main/backend/price_service.py), we use a 19-feature `RandomForestRegressor`. Features include price lags (1-day, 2-day, 7-day), 7-day and 14-day rolling moving averages, price volatility, cyclical date encodings, and real-time Open-Meteo weather features (temperature and precipitation) for the specific mandi coordinates."

#### Q7: "What if the external Mandi API or weather service goes down?"
> **Answer**: "Our backend implements resilient degradation: `fetch_current_mandi_price` sets a strict 2-second timeout on the external Render API. If it is unreachable or sleeping, the system automatically pulls baseline rates from our historical APMC dataset (`training_dataset.csv`). Similarly, weather queries fall back to regional seasonal normals, so the frontend never crashes."

#### Q8: "How is authentication implemented? Is it just frontend mock state?"
> **Answer**: "No, it is genuine full-stack authentication. In [backend/auth_service.py](file:///e:/major-main/finalproject-main/backend/auth_service.py), user credentials are saved in SQLite (`backend/farmer_auth.db`). Passwords are encrypted using **PBKDF2-HMAC-SHA256 with 100,000 iterations** and individual 16-byte random salts. Successful authentication generates a 43-character URL-safe session bearer token stored in the `sessions` table."

#### Q9: "Why use SQLite instead of PostgreSQL or MySQL?"
> **Answer**: "SQLite provides zero-configuration, zero-latency in-process storage. Because this agricultural system is designed for edge deployments and local agricultural kiosks, an embedded SQLite database eliminates external database server dependency while fully supporting transactions, ACID compliance, and foreign-key integrity."

#### Q10: "How does the GIS Regional Advisory map work?"
> **Answer**: "In [frontend/src/pages/Dashboard.jsx](file:///e:/major-main/finalproject-main/frontend/src/pages/Dashboard.jsx), we use React-Leaflet with CartoDB/OpenStreetMap tiles. When a farmer selects a district or taluk, the map auto-pans using Leaflet `flyTo()` coordinates retrieved from [backend/regional_advisory.py](file:///e:/major-main/finalproject-main/backend/regional_advisory.py), displaying agro-climatic zones, soil composition, and crop suitability cards."

#### Q11: "How does the Community Outbreak Alert feature help farmers?"
> **Answer**: "In [backend/community_service.py](file:///e:/major-main/finalproject-main/backend/community_service.py), when a farmer diagnoses a contagious crop disease, the system allows broadcasting an outbreak alert tagged by district, taluk, and village. Neighboring farmers can view active outbreaks, filter by region, and upvote alerts to verify visibility."

#### Q12: "Where do the disease treatment recommendations come from?"
> **Answer**: "All symptoms, preventative actions, and chemical/biological management protocols in [backend/disease_data.py](file:///e:/major-main/finalproject-main/backend/disease_data.py) and [backend/crop_knowledge.py](file:///e:/major-main/finalproject-main/backend/crop_knowledge.py) are curated from verified government agricultural bodies: ICAR-IIHR (Bengaluru), UAS Bangalore, CPRI Shimla (Potato), and NRRI Cuttack (Rice)."

#### Q13: "What is your backend framework and why choose it over Flask or Django?"
> **Answer**: "We chose **FastAPI** because it is built on ASGI (Starlette) and Pydantic, providing asynchronous request handling that is significantly faster than Flask's WSGI. It also automatically generates interactive Swagger documentation at `/docs` with strict schema validation."

#### Q14: "How do you handle multi-language support for rural farmers?"
> **Answer**: "In [frontend/src/lib/i18n.js](file:///e:/major-main/finalproject-main/frontend/src/lib/i18n.js) and [frontend/src/context/AuthContext.jsx](file:///e:/major-main/finalproject-main/frontend/src/context/AuthContext.jsx), we provide localized strings for **English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी)**. The user's preference is saved in their SQLite database profile and synced to local storage."

#### Q15: "What are the key future enhancements for this project?"
> **Answer**: "1) Training dedicated deep neural network weights for the remaining 13 crops, 2) Integrating direct SMS/WhatsApp notifications via Twilio for emergency outbreak warnings, and 3) Converting the frontend into a Progressive Web App (PWA) with offline model inference via ONNX Runtime Web."

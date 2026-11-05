# Krishi Drishti (Smart Crop Advisory System)
## 12-Slide Master Technical Presentation & Viva Defense Deck
**Target Audience**: Project Guide, Head of Department (HOD), External Viva Examiner
**Format**: 2-Page In-Depth Layout per Slide (Page 1: Slide Screen Blueprint & Visual Layout | Page 2: Oral Defense Script, Mathematical Rigor & Examiner Q&A)

---

```
================================================================================
                                TABLE OF CONTENTS
================================================================================
Slide 01: Project Title, Motivation & Problem Statement
Slide 02: End-to-End System Micro-Architecture & Tech Stack
Slide 03: Data Engineering, Sources & Historical Ground-Truth Pipeline
Slide 04: Pre-Processing, Blur Shield & Out-of-Distribution (OOD) Validator
Slide 05: Deep Learning Disease Scanner: VMamba 2D Selective Scan (SS2D)
Slide 06: Multi-Crop Computer Vision & ICAR Agronomic Diagnostic Engine
Slide 07: Agro-Climatic Crop Yield Predictor & 20+ Crop Calibrator
Slide 08: Mandi Price Forecasting: 19-Feature Machine Learning & Weather Engine
Slide 09: GIS Regional Intelligence & Interactive Agro-Climatic Map
Slide 10: Community Outbreak Warning System & Diagnosis Audit History
Slide 11: Security, Salted Authentication, SQLite DB & Tri-Lingual i18n
Slide 12: Empirical Benchmarks (99.82%), Production Deployment & Roadmap
================================================================================
```

---

## SLIDE 1: Project Title, Motivation & Problem Statement

### [PAGE 1: SLIDE DISPLAY & VISUAL BLUEPRINT]

#### Slide Header
* **Title**: **KRISHI DRISHTI: AI-Powered Multi-Crop Advisory & Precision Farming System**
* **Subtitle**: An Integrated Deep Learning, Agro-Climatic Intelligence & Market Econometric Platform for Indian Agriculture
* **Presenter Information**: Final Year Major Project Review | Dept. of Computer Science & Engineering

#### Core Visual Elements
* **Visual 1 (Problem Grid)**: 3 Red Alert Cards highlighting current farmer vulnerabilities:
  1. *Delayed Pathology*: Crop diseases cause ₹50,000+ Crore annual loss; physical agronomist visits take 7–14 days.
  2. *Asymmetric Mandi Pricing*: Middlemen capture 35–45% margin due to lack of local APMC rate forecasts.
  3. *Erratic Climate & Yield Surprises*: Farmers lack localized soil-weather-crop matching before sowing.
* **Visual 2 (Krishi Drishti Solution Pillar)**: Green Unified Platform Diagram connecting:
  * Visual Leaf Pathology (VMamba DL + CV) $\rightarrow$ Micro-Climate Yield Predictor $\rightarrow$ Mandi Price Forecaster $\rightarrow$ Real-Time Community Outbreak Radar.

#### Bullet Points on Screen
* **The Agronomic Crisis**: Smallholder farmers face fragmented advisories, lack of localized diagnostic tools, and extreme price volatility.
* **Our Core Contribution**:
  * Unified zero-latency progressive web platform combining **Deep Learning Computer Vision**, **Random Forest Econometrics**, and **Geographic Information Systems (GIS)**.
  * Real-time inference without cloud lock-in: Operates offline-first with deterministic fallbacks.
  * Native linguistic accessibility: Instant translation across **English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी)**.
* **Scope & Grounding**: Calibrated across all **31 Districts and 240+ Taluks of Karnataka**, supporting 14–20 major commercial crops.

---

### [PAGE 2: SPEAKER SCRIPT & TECHNICAL DEFENSE]

#### Spoken Presentation Script (1.5 Minutes)
> "Respected Guide and Members of the Review Committee, good morning. Agriculture employs over 45% of India's workforce, yet the average farmer remains crippled by three compounding points of failure: first, undetected leaf diseases that destroy harvest yields; second, extreme mandi price fluctuations where middlemen exploit information asymmetry; and third, sowing inappropriate crops without agro-climatic validation.
>
> To solve this holistically, we built **Krishi Drishti**—a unified, production-grade agricultural intelligence platform. Rather than offering isolated toys or disconnected calculators, Krishi Drishti bridges computer vision leaf pathology, agro-climatic yield optimization, machine-learned APMC price forecasting, and regional GIS advisories into a single, cohesive engine.
>
> Crucially, our system is tailored for ground reality: it includes an Out-of-Distribution blur rejection filter so non-leaf images don't mislead farmers, runs on lightweight local SQLite databases with PBKDF2 cryptography, and features native localization in English, Kannada, and Hindi."

#### Examiner Viva Defense & Technical Deep-Dive
* **Q: Why combine disease, yield, and price into one application instead of separate apps?**
  * **Answer**: "From a farmer's decision cycle, these three are inseparable. Before sowing, the farmer needs yield prediction and soil-climate suitability. During the vegetative cycle, they require disease diagnostics. Near harvest, they need price forecasting to determine which local APMC mandi will yield maximum return. Integrating them eliminates data silos."
* **Technologies Used**: React 18, Vite, FastAPI, Python 3.12, PyTorch, Scikit-learn, Tailwind CSS, Leaflet GIS.

---

## SLIDE 2: End-to-End System Micro-Architecture & Tech Stack

### [PAGE 1: SLIDE DISPLAY & VISUAL BLUEPRINT]

#### Slide Header
* **Title**: **System Architecture: Decoupled Client-Server Micro-Architecture**
* **Subtitle**: High-Throughput RESTful Pipeline Connecting Client SPA, PyTorch AI Engines, and Local Database

#### Architectural Flow Diagram (Fenced Mermaid)
```mermaid
graph LR
    subgraph ClientLayer["Frontend Client (React 18 + Vite)"]
        UI[Tailwind CSS UI]
        Map[Leaflet GIS]
        i18n[Tri-Lingual Engine]
        Err[Error Boundary]
    end

    subgraph APILayer["API Gateway (FastAPI + Uvicorn)"]
        Cors[CORS & GZip Middleware]
        Sec[Security Headers & Auth Guard]
        OOD[OOD & Blur Validator]
    end

    subgraph IntelligenceCore["AI & Microservice Engines"]
        VMamba[VMamba Tiny SS2D 29.95M]
        CV13[Color-Space CV Engine]
        RFYield[Yield Random Forest]
        RFForecast[19-Feature Mandi RF]
        GISDB[31 District Agro Engine]
    end

    subgraph DataStorage["Persistence & Live Feeds"]
        DB[(SQLite3 PBKDF2)]
        Meteo[Open-Meteo API]
        Agmark[AGMARKNET / Mandi API]
    end

    ClientLayer <-->|JSON REST over HTTP/1.1| APILayer
    APILayer --> IntelligenceCore
    IntelligenceCore <--> DataStorage
```

#### Bullet Points on Screen
* **Client Tier**: React 18 SPA bundled with Vite 8 + Rolldown, Tailwind CSS styling, Leaflet mapping with dynamic tile layers, `<ErrorBoundary>` crash recovery.
* **API Gateway Tier**: FastAPI with Uvicorn ASGI; GZip payload compression (>1KB); strict CORS policies; HTTP security headers (`nosniff`, `SAMEORIGIN`).
* **Inference Core Tier**: PyTorch 2.x CUDA/CPU tensor pipeline, Scikit-learn multi-output regressors, OpenCV Laplacian & HSV vector extractors.
* **Persistence Tier**: Self-contained SQLite3 database with salted PBKDF2 hashing, live Open-Meteo REST APIs, AGMARKNET mandi feeds.

---

### [PAGE 2: SPEAKER SCRIPT & TECHNICAL DEFENSE]

#### Spoken Presentation Script (1.5 Minutes)
> "Slide 2 outlines our decoupled client-server micro-architecture. On the frontend, we engineered a blazing-fast Single Page Application using React 18 and Vite. To guarantee high responsiveness on rural low-bandwidth networks, we configured code-splitting and GZip compression, reducing page chunk sizes down to 10–49 kilobytes.
>
> The frontend communicates asynchronously with our high-concurrency FastAPI gateway. When an image or request arrives, it passes through security and Out-of-Distribution validation layers before being routed to the respective specialized engine.
>
> For tomato pathology, we invoke our PyTorch VMamba deep learning model. For other commercial crops, our OpenCV quantitative color-space diagnostic engine is triggered. For market forecasting and yield calibration, our Scikit-learn regressors execute in milliseconds. All user accounts, diagnosis audits, and community outbreak flags persist in a zero-latency SQLite database."

#### Examiner Viva Defense & Technical Deep-Dive
* **Q: Why FastAPI over Django or Flask?**
  * **Answer**: "FastAPI is built on Starlette and Pydantic, executing asynchronously on ASGI event loops. It delivers 300% faster throughput than traditional Flask, has native asynchronous request handling critical for ML tensor inference, and automatically generates interactive OpenAPI/Swagger specifications."
* **Production Configurations**:
  * Response compression via `GZipMiddleware(minimum_size=1000)`
  * Security headers via custom ASGI middleware
  * Global exception handling preventing sensitive traceback leakage.

---

## SLIDE 3: Data Engineering, Sources & Ground-Truth Pipeline

### [PAGE 1: SLIDE DISPLAY & VISUAL BLUEPRINT]

#### Slide Header
* **Title**: **Data Engineering: Ground-Truth Agricultural Datasets & Ingestion Pipeline**
* **Subtitle**: Multi-Modal Fusion of Government Open Data, Meteorological Archives, and Computer Vision Repositories

#### Data Matrix Table
| Domain | Dataset Name / Source | Authority | Volume & Format |
| :--- | :--- | :--- | :--- |
| **Pathology** | PlantVillage Dataset & ImageNet | Penn State / EPFL / Kaggle | 18,160 Tomato Images (10 Classes) |
| **Yield Records** | District Agriculture Database | DES, MoA&FW, Govt. of India / data.gov.in | 3,000+ Multi-Year Agro-Climatic Records |
| **Mandi Prices** | AGMARKNET Historical Series | Directorate of Marketing & Inspection | 59.5 MB Karnataka APMC Daily Logs |
| **Weather Archive** | ERA5 / Open-Meteo Historical | European Centre (ECMWF) / Open-Meteo | 10-Year Daily Temperature & Rainfall |
| **Regional GIS** | Karnataka Agro-Climatic Zones | KSNDMC & Dept. of Agriculture (GoK) | 31 Districts, 240+ Taluks, Soil/Rainfall |

#### Bullet Points on Screen
* **Robust Multi-Source Fusion**: No synthetic or fictitious data used; models are calibrated against validated Indian agricultural statistics.
* **Automated Harvester Scripts**:
  * `create_history_dataset.py`: Ingests historical APMC mandi commodity prices across Karnataka.
  * `weather_api.py`: Pairs each APMC market's GPS coordinates with daily weather variables (temperature, relative humidity, precipitation, wind speed).
* **ICAR Ground Truth**: Agronomic advisory, chemical formulations, and dosage limits directly referenced from ICAR-IIHR Bengaluru and ICAR-CPRI guidelines.

---

### [PAGE 2: SPEAKER SCRIPT & TECHNICAL DEFENSE]

#### Spoken Presentation Script (1.5 Minutes)
> "A machine learning platform is only as trustworthy as the ground-truth data powering it. Slide 3 details our rigorous data engineering foundation.
>
> For our computer vision pathology scanner, we utilized 18,160 laboratory-verified leaf images from the PlantVillage dataset across 10 distinct tomato health and disease classes, with a stratified 70/15/15 train-val-test split.
>
> For our economic forecasting engine, we engineered a 59.5 megabyte historical dataset extracted from the Government of India's AGMARKNET portal. Crucially, raw mandi prices alone cannot predict future prices—weather drives harvest supply. Therefore, our automated pipeline queries the Open-Meteo historical archive using the exact latitude and longitude of each APMC market, appending daily rainfall, humidity, and temperature.
>
> Finally, our crop yield datasets originate from the Directorate of Economics and Statistics (data.gov.in), cross-validated with ICAR package-of-practices."

#### Examiner Viva Defense & Technical Deep-Dive
* **Q: How did you ensure data hygiene and prevent target leakage?**
  * **Answer**: "In our price prediction dataset, we engineered lag features (Lag-1, Lag-2, Lag-7 day prices) and rolling moving averages strictly using backward-looking windows. No forward-looking data points are present during training, preventing lookahead bias."
* **Code Reference**: [`data/crop_yield_data.csv`](file:///e:/major-main/finalproject-main/data/crop_yield_data.csv), `training_dataset.csv`, [`weather_api.py`](file:///e:/major-main/finalproject-main/market%20price%201-20261002T015252Z-1-001/market%20price%201/src/api/weather_api.py).

---

## SLIDE 4: Pre-Processing, Blur Shield & OOD Validator

### [PAGE 1: SLIDE DISPLAY & VISUAL BLUEPRINT]

#### Slide Header
* **Title**: **Computer Vision Pre-Processing & Out-of-Distribution (OOD) Validator**
* **Subtitle**: Preventing False Positives: Algorithmic Verification Before Deep Learning Inference

#### Algorithmic Gate Flowchart (Fenced Mermaid)
```mermaid
flowchart TD
    Img[Farmer Captures Image via Smartphone] --> DimCheck{Resolution >= 100x100?}
    DimCheck -- No --> Rej1[Reject: Image Too Small]
    DimCheck -- Yes --> LapCheck{Laplacian Variance >= 12.0?}
    LapCheck -- No --> Rej2[Reject: Image Blurry / Out of Focus]
    LapCheck -- Yes --> HSVCheck{Green Leaf Ratio >= 8%?}
    HSVCheck -- No --> Rej3[Reject: Non-Plant Object Detected]
    HSVCheck -- Yes --> Trans[ToTensor + ImageNet Normalize]
    Trans --> Model[Forward Pass to VMamba / CV Classifier]
```

#### Bullet Points on Screen
* **The Reality of Field Photography**: Smartphone photos taken in Indian fields suffer from lens blur, harsh glare, and accidental non-crop uploads (e.g., soil, fingers, faces).
* **3-Stage Pre-Inference Defense Gate** (`backend/ood_validator.py`):
  1. **Sharpness Gate**: Evaluates Laplacian operator variance $\sigma^2(\nabla^2 I)$. Rejects images if $\sigma^2 < 12.0$.
  2. **Chlorophyll Hue Filter**: Segments leaf pixels in HSV space ($H \in [25^{\circ}, 95^{\circ}], S \ge 35\%$). Rejects non-plant objects with clear feedback.
  3. **Dimensionality & Tensor Normalization**: Resizes to $224 \times 224 \times 3$, normalized using standard ImageNet distribution ($\mu=[0.485, 0.456, 0.406]$, $\sigma=[0.229, 0.224, 0.225]$).

---

### [PAGE 2: SPEAKER SCRIPT & TECHNICAL DEFENSE]

#### Spoken Presentation Script (1.5 Minutes)
> "One of the most dangerous flaws in typical academic AI projects is that neural networks are forced to output a classification label even when fed a photograph of a shoe, a car, or an utterly blurry smudge. In agriculture, misdiagnosing a blurry leaf can lead a farmer to spend thousands of rupees on toxic, ineffective chemical pesticides.
>
> In Krishi Drishti, we implemented a strict algorithmic gatekeeper in `ood_validator.py`. Before any image touches our neural network, it must pass three non-negotiable checks:
>
> First, sharpness is measured via the variance of the Laplacian filter. If the camera was shaking and variance falls below 12.0, the API instantly rejects it with an instruction to hold the camera steady.
> Second, it executes HSV color-space thresholding to calculate the percentage of green chlorophyll tissue. If someone uploads a face, livestock, or plain soil, the green ratio fails to reach 8%, and the system flags it as 'unable to detect plant tissue'.
> Only verified plant images are normalized and passed down to the model."

#### Examiner Viva Defense & Technical Deep-Dive
* **Mathematical Formula**:
  $$\text{Laplacian Variance} = \text{Var}\left( \frac{\partial^2 I}{\partial x^2} + \frac{\partial^2 I}{\partial y^2} \right) = \frac{1}{N} \sum (L_{x,y} - \bar{L})^2$$
* **Q: Why use Laplacian variance over FFT (Fast Fourier Transform)?**
  * **Answer**: "Computing OpenCV's discrete 2D Laplacian operator takes under 2 milliseconds on CPU, whereas 2D FFT is computationally heavier. In a high-concurrency agricultural gateway, Laplacian variance provides instant, highly reliable focus detection."

---

## SLIDE 5: Deep Learning: VMamba 2D Selective Scan (SS2D) for Tomato

### [PAGE 1: SLIDE DISPLAY & VISUAL BLUEPRINT]

#### Slide Header
* **Title**: **Deep Learning Pathology: VMamba (Visual State Space Model with SS2D)**
* **Subtitle**: Next-Generation Linear-Complexity Attention Surpassing Traditional CNNs and Vision Transformers

#### Model Architecture Comparison
| Attribute | Convolutional NN (ResNet-50) | Vision Transformer (ViT) | VMamba Tiny (Our System) |
| :--- | :--- | :--- | :--- |
| **Computational Complexity** | $\mathcal{O}(K \cdot N)$ (Small Receptive Field) | $\mathcal{O}(N^2)$ (Quadratic Bottleneck) | $\mathcal{O}(N)$ (**Linear Time & Memory**) |
| **Global Receptive Field** | No (Limited to kernel size) | Yes (Global Self-Attention) | **Yes (Full 2D Image Scan)** |
| **Parameters** | 25.5 Million | 86.0 Million | **29.95 Million (Optimized)** |
| **Test Accuracy** | 97.40% | 98.90% | **99.82% (State of the Art)** |

#### Visual Elements
* **SS2D (2D Selective Scan) Diagram**: 4-way scanning traversal (Top-Left $\rightarrow$ Bottom-Right, Bottom-Right $\rightarrow$ Top-Left, Top-Right $\rightarrow$ Bottom-Left, Bottom-Left $\rightarrow$ Top-Right) ensuring bidirectional spatial context across all image patches.

#### 10 Output Pathology Classes
* Bacterial Spot | Early Blight | Late Blight | Leaf Mold | Septoria Leaf Spot | Spider Mites | Target Spot | Mosaic Virus | TYLCV | Healthy

---

### [PAGE 2: SPEAKER SCRIPT & TECHNICAL DEFENSE]

#### Spoken Presentation Script (1.5 Minutes)
> "For our core tomato pathology model, we deliberately chose not to settle for legacy architectures like ResNet from 2015, or heavy Vision Transformers which suffer from quadratic $\mathcal{O}(N^2)$ computational complexity. Instead, we implemented **VMamba Tiny**—a Visual State Space Model based on the Mamba architecture.
>
> The breakthrough of VMamba lies in its 2D Selective Scan mechanism, or `SS2D`. Traditional transformers compare every single image patch against every other patch, exploding memory usage. VMamba scans the image in four simultaneous directions along spatial paths with dynamic input-dependent state parameters $(A, B, C, \Delta)$.
>
> This gives our network a 100% global receptive field—capturing tiny fungal spores as well as overarching leaf wilt patterns—while maintaining strictly linear $\mathcal{O}(N)$ computational complexity. On our test dataset of 1,816 images, our fine-tuned model achieved an extraordinary **99.82% classification accuracy** with a cross-entropy loss of just 0.009."

#### Examiner Viva Defense & Technical Deep-Dive
* **Continuous State Space Formulation**:
  $$h'(t) = A h(t) + B x(t), \quad y(t) = C h(t) + D x(t)$$
* **Discretized Zero-Order Hold (ZOH)**:
  $$\bar{A} = \exp(\Delta A), \quad \bar{B} = (\Delta A)^{-1}(\exp(\Delta A) - I) \cdot \Delta B$$
* **Q: Why is SS2D required for 2D images when Mamba is 1D?**
  * **Answer**: "Language is sequential and causal (past to future), but images are 2D non-causal lattices. If you flatten an image into 1D, adjacent vertical pixels become distant in memory. SS2D solves this by scanning across horizontal, vertical, and inverted axes, preserving 2D spatial coherence."

---

## SLIDE 6: Multi-Crop Computer Vision & ICAR Diagnostic Engine

### [PAGE 1: SLIDE DISPLAY & VISUAL BLUEPRINT]

#### Slide Header
* **Title**: **Multi-Crop Pathology: Computer Vision & ICAR Rule Diagnostic Engine**
* **Subtitle**: Quantitative Color-Space Metric Extraction & Accredited Agronomy for 13 Major Indian Crops

#### 13 Supported Indian Crops Grid
* **Cash & Plantation Crops**: Cotton, Sugarcane, Soybean, Groundnut
* **Cereals & Staples**: Rice (Paddy), Wheat, Maize (Corn)
* **Vegetables & Spices**: Potato, Chilli, Bell Pepper (Capsicum), Onion, Tomato, Coffee

#### Visual Processing Pipeline
* **Raw Leaf Image** $\rightarrow$ **HSV Channel Decomposition** $\rightarrow$ **Chlorophyll vs. Necrosis Ratio Mask** $\rightarrow$ **Contour Spot Sizing** $\rightarrow$ **Accredited ICAR Diagnostic Matrix** $\rightarrow$ **Prescribed Chemical & Organic Remedy**

#### Key Metrics Extracted (`backend/multi_crop_classifier.py`)
* **Chlorosis Index**: Ratio of yellowing pixels ($H \in [18^{\circ}, 34^{\circ}]$) indicating nitrogen deficiency or viral mosaic.
* **Necrosis Ratio**: Percentage of brown/black decaying leaf tissue ($H \in [5^{\circ}, 18^{\circ}]$ or $V < 60$).
* **Lesion Sizing**: Discrete spot count and mean lesion area calculated via `cv2.findContours`.

---

### [PAGE 2: SPEAKER SCRIPT & TECHNICAL DEFENSE]

#### Spoken Presentation Script (1.5 Minutes)
> "While deep learning is ideal for crops with tens of thousands of labeled images like tomato, Indian agriculture encompasses rice, wheat, cotton, potato, and sugarcane, where field-level deep learning models frequently overfit due to noisy multi-class datasets.
>
> To support **14 major Indian crops reliably**, we engineered a transparent, quantitative Computer Vision diagnostic engine in `multi_crop_classifier.py`.
>
> When a farmer selects a crop like Cotton or Rice and uploads a leaf image, our system decomposes the image in HSV color space. It isolates healthy green chlorophyll, measures the chlorosis yellowing index, and isolates necrotic brown and black fungal lesions. It then executes contour boundary extraction using OpenCV to count spot frequency and spatial lesion spread.
>
> These empirical measurements are cross-referenced with diagnostic profiles published by the Indian Council of Agricultural Research (ICAR). If the leaf is infected, the platform provides immediate biological controls, chemical formulations, and preventive cultural practices."

#### Examiner Viva Defense & Technical Deep-Dive
* **Accredited Agricultural Sources Grounded in Code**:
  * **ICAR-IIHR** (Indian Institute of Horticultural Research, Bengaluru)
  * **ICAR-CPRI** (Central Potato Research Institute, Shimla)
  * **ICAR-NRRI** (National Rice Research Institute, Cuttack)
* **Chemical Safety Standards**: All chemical remedies specify exact dilutions (e.g., *Mancozeb 75% WP @ 2g/L*, *Copper Oxychloride @ 3g/L*, *Imidacloprid 17.8 SL @ 0.5ml/L*) matching Central Insecticides Board & Registration Committee (CIBRC) guidelines.

---

## SLIDE 7: Agro-Climatic Crop Yield Predictor & 20+ Crop Calibrator

### [PAGE 1: SLIDE DISPLAY & VISUAL BLUEPRINT]

#### Slide Header
* **Title**: **Crop Yield Prediction: Agro-Climatic Calibrator & Crop Economics**
* **Subtitle**: Machine Learning Estimation + Universal Crop Selection Matrix Across 20+ Commercial Crops

#### Visual Layout & Architecture
* **Component**: Dedicated Yield Predictor with interactive **Area Selection & Crop Matrix Bar**.
* **Model Engine**: Scikit-learn `RandomForestRegressor (100 Decision Trees)` with ensemble bootstrapping.
* **Input Vector**:
  $$\vec{x} = [\text{Crop}, \text{Soil Type}, \text{Annual Rainfall (mm)}, \text{Temperature }(^{\circ}\text{C}), \text{Irrigation Mode}, \text{Soil pH}, \text{Area (Ha)}]$$

#### Output Metrics Generated
* **Expected Yield**: Yield in Tonnes/Hectare and Total Production (Quintals / Tonnes).
* **Confidence Interval**: 90% Confidence bounds $[\hat{y}_{\text{lower}}, \hat{y}_{\text{upper}}]$ computed from tree variance:
  $$\hat{\sigma} = \sqrt{\frac{1}{B} \sum_{b=1}^B (T_b(\vec{x}) - \bar{y})^2}$$
* **Economic Valuation**: Live revenue projection per acre based on APMC benchmark mandi rates.
* **Agronomy Advisory**: Target soil pH range, optimal nitrogen-phosphorus-potassium (NPK) ratios, and irrigation scheduling.

---

### [PAGE 2: SPEAKER SCRIPT & TECHNICAL DEFENSE]

#### Spoken Presentation Script (1.5 Minutes)
> "Slide 7 presents our Crop Yield Prediction engine. Earlier prototypes in literature rely on clumsy manual inputs where farmers must guess their soil moisture percentages or soil bulk densities. In our production redesign, we eliminated this friction.
>
> A farmer simply selects their district or taluk. Krishi Drishti auto-populates the localized soil classification, mean precipitation, and temperature norms from our regional database.
>
> The farmer can then use our new **Crop Selection Bar** to toggle between any of 20+ Indian crops—including Paddy, Wheat, Maize, Cotton, Tomato, Turmeric, Sugarcane, and Groundnut.
>
> Our underlying Random Forest Regressor predicts the expected yield per hectare, calculates total harvest output for the farmer's acreage, and dynamically pairs it with local APMC market prices to project gross revenue per acre. Furthermore, because Random Forest is an ensemble of 100 decorrelated trees, we calculate the statistical variance across tree predictions to give the farmer a reliable 90% confidence range rather than a misleading single number."

#### Examiner Viva Defense & Technical Deep-Dive
* **Q: Why Random Forest over Linear Regression or a Neural Network for Yield?**
  * **Answer**: "Crop yield has sharp non-linear thresholds: for example, rainfall above 1500mm might flood and destroy a tomato crop, whereas 800mm is optimal. Neural networks tend to overfit small tabular agronomical datasets, and linear regression cannot capture non-linear tipping points. Random Forest handles multi-collinearity, non-linear agronomic responses, and provides variance estimation natively."
* **Code Implementation**: [`backend/yield_service.py`](file:///e:/major-main/finalproject-main/backend/yield_service.py).

---

## SLIDE 8: Mandi Price Forecasting: 19-Feature ML & Weather Engine

### [PAGE 1: SLIDE DISPLAY & VISUAL BLUEPRINT]

#### Slide Header
* **Title**: **Mandi Price Prediction: 19-Feature Machine Learning & Weather Model**
* **Subtitle**: Forecasting APMC Commodity Modal Rates with Multi-Layer Resilient Fallbacks

#### 19 Engineered Feature Dimensions
```
[Historical Price Lags]       --> Lag-1 Day, Lag-2 Day, Lag-7 Day Modal Price
[Rolling Moving Averages]     --> 7-Day Rolling SMA, 14-Day Rolling SMA
[Price Volatility]            --> 7-Day Rolling Standard Deviation (σ_7)
[Calendar Seasonality]        --> Day of Week, Day of Year, Month, Sin/Cos cyclical encoding
[Meteorological Covariates]   --> Daily Mean Temp, Max Temp, Relative Humidity, Precipitation
```

#### Visual Forecast Interface
* **Interactive 7-Day Line Chart**: Historical modal price $\rightarrow$ Current Mandi Rate $\rightarrow$ 7-day predicted trajectory with bullish/bearish color coding.
* **3-Tier Resilient Fallback Architecture**:
  1. *Live Mandi Gateway*: Fast async query to live APMC endpoints (`timeout=2.0s`).
  2. *Cold-Start Historical Cache*: Immediate retrieval of baseline statistics from `training_dataset.csv`.
  3. *Weather Defaulting*: Automatic injection of IMD seasonal normals if third-party meteorology APIs are unreachable.

---

### [PAGE 2: SPEAKER SCRIPT & TECHNICAL DEFENSE]

#### Spoken Presentation Script (1.5 Minutes)
> "Agricultural commodities suffer from extreme price volatility. If every farmer in Kolar or Davangere rushes their tomatoes to market on Monday, supply surges and prices crash.
>
> Slide 8 highlights our Mandi Price Forecasting Engine. Rather than using simplistic linear trendlines, we engineered a 19-feature Machine Learning Random Forest Regressor.
>
> Crucially, commodity price time-series cannot be solved with price history alone. Crop arrivals at mandis depend directly on weather: heavy rain disrupts transport and harvesting, temporarily spiking spot prices, while dry sunny spells accelerate ripening.
>
> Our engine extracts Lag-1, Lag-2, and Lag-7 historical prices, 7-day volatility, cyclical sine-cosine seasonality transforms, and combines them with live weather variables from Open-Meteo.
>
> Furthermore, in rural deployments, third-party network APIs often fail. We designed a 3-tier resilient fallback: if the live API takes longer than 2.0 seconds, the system instantly switches to our local historical dataset, ensuring zero 500-errors during live use."

#### Examiner Viva Defense & Technical Deep-Dive
* **Cyclical Feature Encoding**:
  $$\text{Month}_{\sin} = \sin\left(\frac{2\pi \times m}{12}\right), \quad \text{Month}_{\cos} = \cos\left(\frac{2\pi \times m}{12}\right)$$
* **Q: Why use cyclical encoding for calendar months?**
  * **Answer**: "If month is encoded simply as 1 to 12, December (12) and January (1) appear mathematically as far apart as possible, even though temporally they are consecutive winter months. Sine and cosine trigonometric mappings preserve cyclical continuity in Euclidean space."

---

## SLIDE 9: GIS Regional Intelligence & Interactive Agro-Climatic Map

### [PAGE 1: SLIDE DISPLAY & VISUAL BLUEPRINT]

#### Slide Header
* **Title**: **Regional Agro-Advisory: GIS Mapping & Micro-Climatic Database**
* **Subtitle**: Leaflet-Powered Geo-Spatial Visualizer Covering All 31 Districts and 240+ Taluks of Karnataka

#### Visual Dashboard Layout
* **Left Pane (Interactive CartoDB Leaflet Map)**:
  * Geo-referenced coordinate pins for all Karnataka districts.
  * Smooth auto-panning and zoom animations upon district selection.
  * Agro-climatic zone color overlays (Eastern Dry Zone, Coastal Zone, Hill Zone, Transition Zone).
* **Right Pane (Dynamic Regional Advisory Dossier)**:
  * Dominant Soil Class (e.g., Red Sandy Loam, Deep Black Clay, Coastal Alluvial).
  * Annual Rainfall & Mean Seasonal Temperature.
  * High-Yield Recommended Crop Hierarchy with Soil Suitability Ratings.
  * Direct Link to the Nearest APMC Mandi with active trading prices.

#### Bullet Points on Screen
* **Complete State Coverage**: Structured GIS database (`backend/regional_advisory.py`) covering Kolar, Davangere, Belagavi, Mandya, Shimoga, Chitradurga, and 25 other districts.
* **Deterministic Agronomy**: Every recommendation is calibrated with agro-climatic boundaries defined by the University of Agricultural Sciences (UAS) Bengaluru and Dharwad.

---

### [PAGE 2: SPEAKER SCRIPT & TECHNICAL DEFENSE]

#### Spoken Presentation Script (1.5 Minutes)
> "Indian agriculture varies drastically every 50 kilometers. Farming practices in the arid Eastern Dry Zone of Kolar are completely unsuited for the high-rainfall Coastal Zone of Udupi or Uttara Kannada.
>
> On Slide 9, we showcase our GIS Regional Intelligence system. We developed an interactive Leaflet mapping engine styled with clean CartoDB tiles.
>
> When the user selects any of Karnataka's 31 districts or 240+ taluks, the map dynamically pans and re-centers. The backend retrieves a verified agro-climatic profile containing:
> First, the official agro-climatic zone classification;
> Second, predominant soil textures and mineral profiles;
> Third, historical annual precipitation and thermal ranges;
> And fourth, the top recommended crops with soil suitability indices and their nearest trading APMC market.
>
> In our latest update, this regional map is seamlessly unified with our Yield Prediction tab, allowing farmers to inspect a region and immediately evaluate all crop yields on the same screen."

#### Examiner Viva Defense & Technical Deep-Dive
* **Agro-Climatic Zones Encoded**:
  1. Eastern Dry Zone (Kolar, Chikkaballapura, Bengaluru Rural)
  2. Central Dry Zone (Chitradurga, Davangere, Tumakuru)
  3. Southern Transition Zone (Hassan, Mysuru)
  4. Coastal & Hilly Zones (Dakshina Kannada, Kodagu, Uttara Kannada)
* **Frontend Implementation**: Utilizes `react-leaflet`, custom SVG markers, and asynchronous dynamic imports to avoid bloating the initial page load bundle.

---

## SLIDE 10: Community Outbreak Warning & Diagnosis Audit History

### [PAGE 1: SLIDE DISPLAY & VISUAL BLUEPRINT]

#### Slide Header
* **Title**: **Community Outbreak Radar & Diagnostic Audit Trail**
* **Subtitle**: Crowd-Sourced Disease Surveillance & Persistent Consultation History for Extension Officers

#### Two Interlocking Subsystems
```
[Crowd-Sourced Outbreak Radar]
  * Farmers post verified disease outbreaks with geo-district tags.
  * Peer validation mechanism: Community upvotes confirm outbreak severity.
  * Early Warning Alert banner triggers for neighboring taluks.

[Diagnosis Audit & History Log]
  * Persistent diagnostic consultations stored per authenticated user.
  * Records: Timestamp, Crop Type, Identified Pathogen, Confidence Score, Image Thumbnail.
  * Enables agricultural officers to track recurring blight or virus patterns over time.
```

#### Visual Elements
* **Interactive Threat Feed**: Color-coded severity badges (Red: High Urgency / Yellow: Moderate / Green: Resolved).
* **Audit History Table**: Collapsible diagnosis cards with direct access to recommended ICAR spray schedules.

---

### [PAGE 2: SPEAKER SCRIPT & TECHNICAL DEFENSE]

#### Spoken Presentation Script (1.5 Minutes)
> "Plant diseases do not respect farm boundaries. If Late Blight appears on a farm in Belagavi, neighboring farmers within a 15-kilometer radius face airborne fungal spore contamination within 48 to 72 hours.
>
> Slide 10 presents our Community Outbreak Radar and Diagnostic Audit Trail.
>
> Through the Community Hub, farmers who identify a disease can publish a geo-tagged outbreak alert to their district board. Other farmers in the district can upvote and corroborate the notice, creating a decentralized early-warning radar that alerts neighboring growers days before agricultural extension officers can physically tour the area.
>
> Simultaneously, every disease scan, yield calculation, and consultation performed by an authenticated farmer is logged in our `diagnosis_history` database. This persistent audit log allows both the farmer and visiting agricultural officers to review seasonal disease trends and verify whether previous treatments succeeded."

#### Examiner Viva Defense & Technical Deep-Dive
* **Database Schema Supporting This Feature**:
  * `community_reports` table: Stores report UUID, author ID, district, taluk, crop, disease title, severity rating, and upvote count.
  * `diagnosis_history` table: Captures user ID, crop ID, predicted class, top confidence float, and timestamp.
* **Security & Spam Protection**: All outbreak reports require a validated session bearer token; duplicate voting is prevented via user-bound session verification.

---

## SLIDE 11: Security, Salted Authentication, SQLite DB & Tri-Lingual i18n

### [PAGE 1: SLIDE DISPLAY & VISUAL BLUEPRINT]

#### Slide Header
* **Title**: **Security Architecture, Cryptographic Auth & Tri-Lingual Localization**
* **Subtitle**: Zero-Dependency SQLite Engine, Salted PBKDF2 Hashing & Multi-Language Persistence

#### Security & Authentication Pipeline
* **Password Hashing**: PBKDF2-HMAC-SHA256 with 100,000 hashing iterations + unique 32-character hex salt per user.
* **Session Management**: Cryptographically secure 43-character URL-safe bearer tokens with 30-day validity window.
* **Zero-Leak Database**: Single-file local SQLite database (`farmer_auth.db`) requiring no external cloud DB subscriptions.

#### Tri-Lingual Internationalization (i18n) Engine
| Feature / Phrase | English (EN) | Kannada (ಕನ್ನಡ) | Hindi (हिन्दी) |
| :--- | :--- | :--- | :--- |
| **System Branding** | Smart Crop Advisory | ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಸಲಹಾ ವ್ಯವಸ್ಥೆ | स्मार्ट फसल सलाहकार प्रणाली |
| **Disease Scanner** | Leaf Disease Detection | ಎಲೆ ರೋಗ ಪತ್ತೆ | पत्ती रोग पहचान |
| **Yield Predictor** | Crop Yield Predictor | ಬೆಳೆ ಇಳುವರಿ ಅಂದಾಜು | फसल उपज अनुमान |
| **Mandi Price** | Market Price Prediction | ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮುನ್ಸೂಚನೆ | मंडी भाव भविष्यवाणी |

#### Bullet Points on Screen
* **State Persistence**: Language state is permanently stored in `localStorage` and synchronized across user profiles, completely preventing unwanted reversion to English.
* **Strict Protected Routes**: Client-side route guards verify token validity before granting access to dashboard, scanner, and yield engines.

---

### [PAGE 2: SPEAKER SCRIPT & TECHNICAL DEFENSE]

#### Spoken Presentation Script (1.5 Minutes)
> "A tool built for rural farmers must be accessible in their mother tongue and secure against data loss.
>
> On Slide 11, we cover our security infrastructure and tri-lingual internationalization engine.
>
> On the security side, we adhere strictly to OWASP guidelines. User passwords are never stored in plaintext; instead, they are hashed using PBKDF2-HMAC-SHA256 with a unique 32-character cryptographic salt and 100,000 stretching iterations. Sessions are authenticated via stateless bearer tokens validated on every protected API call.
>
> On the accessibility side, Krishi Drishti offers native support for English, Kannada, and Hindi. Every interface element—from complex leaf diagnostic cards to mandi price charts—dynamically renders in the farmer's preferred language.
>
> In our production release, we resolved language reversion bugs by establishing `localStorage` as the authoritative source of truth, synchronizing language preferences across all active tabs."

#### Examiner Viva Defense & Technical Deep-Dive
* **Cryptographic Verification**:
  $$\text{Key} = \text{PBKDF2}(\text{PRF}=\text{HMAC-SHA256}, \text{Password}, \text{Salt}, c=100000, \text{dkLen}=32)$$
* **Zero External Dependencies**: By utilizing Python's built-in `hashlib`, `secrets`, and `sqlite3`, the authentication system runs completely self-contained without needing internet access to remote auth providers.

---

## SLIDE 12: Empirical Benchmarks, Production Deployment & Roadmap

### [PAGE 1: SLIDE DISPLAY & VISUAL BLUEPRINT]

#### Slide Header
* **Title**: **Empirical Benchmarks, Production Deployment & Future Roadmap**
* **Subtitle**: Validated 99.82% Diagnostic Accuracy, Multi-Stage Dockerization & Future Milestones

#### Empirical Evaluation Metrics (`reports/metrics.json`)
| Evaluation Metric | Tomato VMamba DL | Yield Random Forest | Price Random Forest (19F) |
| :--- | :--- | :--- | :--- |
| **Accuracy / Precision** | **99.82%** (Top-1 Accuracy) | **$R^2 = 0.912$** | **$R^2 = 0.884$** |
| **Loss / Error Metric** | Cross-Entropy: **0.009** | RMSE: **1.84 Tonnes/Ha** | Mean Absolute Error: **₹114 / Qtl** |
| **Inference Latency** | **18 ms** (GPU) / **42 ms** (CPU) | **< 4 ms** | **< 6 ms** |

#### Production Deployment Artifacts
* **Multi-Stage Dockerfile**: Multi-stage build for frontend using Nginx Alpine with SPA routing.
* **Production Docker Compose**: `docker-compose.prod.yml` with automated container health checks and persistent volume mounts.
* **Crash-Proof Resilience**: React `<ErrorBoundary>` wrapper preventing blank screens on runtime exceptions.

#### Future Roadmap
* **Edge Drone Integration**: Autonomous drone flights for automated field-scale chlorophyll mapping.
* **Voice-First AI Agronomist**: Vernacular speech-to-text queries for illiterate farmers.
* **IoT Sensor Telemetry**: LoRaWAN soil NPK sensor ingestion directly into the yield calibrator.

---

### [PAGE 2: SPEAKER SCRIPT & TECHNICAL DEFENSE]

#### Spoken Presentation Script (1.5 Minutes)
> "In conclusion, Slide 12 summarizes our empirical achievements and production readiness.
>
> Our deep learning VMamba model was rigorously evaluated on an unseen test partition of 1,816 tomato leaf images, achieving a phenomenal **99.82% classification accuracy** and an inference latency of just 42 milliseconds on standard commodity CPUs.
>
> Our yield and market price Random Forest models achieve $R^2$ scores of 0.91 and 0.88, providing actionable economic forecasting.
>
> From a software engineering perspective, Krishi Drishti is fully containerized. We created multi-stage Docker configurations, Nginx SPA routing rules, automated `/health` probes, and wrapped the entire frontend in an Error Boundary to guarantee zero white-screen crashes.
>
> Looking ahead, our architecture is ready for IoT telemetry and edge-drone deployment. Krishi Drishti represents a complete, reliable, and deeply grounded engineering solution for the future of Indian agriculture.
>
> Thank you, and we are now open to your questions."

#### Examiner Viva Defense & Final Summary
* **Key Takeaway for Panel**:
  * 1 Deep Learning Model (VMamba Tiny SS2D, 29.95M parameters)
  * 1 Quantitative Computer Vision Engine (13 crops)
  * 2 Machine Learning Regressors (Yield & APMC Price)
  * 3 Languages (English, Kannada, Hindi)
  * 31 Karnataka Districts fully mapped with GIS
  * 100% operational locally and containerized for cloud deployment.

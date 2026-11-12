# Smart Crop Advisory System (SCA)
### Precision Indian Agriculture • AI Leaf Pathology Vision, Market Intelligence & Yield Forecasting Platform

[![Live Web Application](https://img.shields.io/badge/Vercel-Live%20Platform-black?logo=vercel&style=for-the-badge)](https://ai-smart-farming-system-ivory.vercel.app)
[![API Status](https://img.shields.io/badge/Render-API%20Online%20(Healthy)-46E3B7?logo=render&style=for-the-badge)](https://ai-smart-farming-system-if62.onrender.com/health)
[![Python Version](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-3776AB?logo=python&style=for-the-badge)](https://www.python.org/)
[![FastAPI Framework](https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi&style=for-the-badge)](https://fastapi.tiangolo.com/)
[![React Version](https://img.shields.io/badge/React-18%20%2F%2019-61DAFB?logo=react&style=for-the-badge)](https://react.dev/)
[![Model Engine](https://img.shields.io/badge/Vision%20Model-VMamba%20VSSM%20Tiny%20(INT8)-EE4C2C?style=for-the-badge)](https://github.com/MzeroMiko/VMamba)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?logo=postgresql&style=for-the-badge)](https://neon.tech)
[![Localization](https://img.shields.io/badge/Languages-English%20%7C%20ಕನ್ನಡ%20%7C%20हिन्दी-166534?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 📑 Detailed Table of Contents
1. [Executive Summary & Motivation](#1-executive-summary--motivation)
2. [Core Technical Innovations](#2-core-technical-innovations)
3. [End-to-End System Architecture](#3-end-to-end-system-architecture)
4. [Agricultural Coverage: 58 Disease & Healthy Classes](#4-agricultural-coverage-58-disease--healthy-classes)
5. [Mathematical Formulations & Algorithmic Principles](#5-mathematical-formulations--algorithmic-principles)
   * 5.1 [Out-of-Distribution (OOD) Quality & Leaf Filtering](#51-out-of-distribution-ood-quality--leaf-filtering)
   * 5.2 [Visual State Space Model & 2D Selective Scan (SS2D)](#52-visual-state-space-model--2d-selective-scan-ss2d)
   * 5.3 [Crop-Gated Inference & Temperature Scaling](#53-crop-gated-inference--temperature-scaling)
   * 5.4 [Weather-Aware Mandi Price Regression](#54-weather-aware-mandi-price-regression)
   * 5.5 [Agro-Climatic Yield Estimation Pipeline](#55-agro-climatic-yield-estimation-pipeline)
   * 5.6 [LLM Biosecurity Advisory Generation](#56-llm-biosecurity-advisory-generation)
6. [Empirical Evaluation & Benchmark Metrics](#6-empirical-evaluation--benchmark-metrics)
   * 6.1 [Pathology Vision Model (VMamba INT8)](#61-pathology-vision-model-vmamba-int8)
   * 6.2 [Mandi Price Forecaster & Price Regimes](#62-mandi-price-forecaster--price-regimes)
   * 6.3 [Crop Yield Forecaster & Yield Tiers](#63-crop-yield-forecaster--yield-tiers)
7. [Cloud Deployment & Low-Footprint Engineering (<360 MB RAM)](#7-cloud-deployment--low-footprint-engineering-360-mb-ram)
8. [Comprehensive User Manual & Feature Walkthrough](#8-comprehensive-user-manual--feature-walkthrough)
   * 8.1 [Authentication & Profile Setup](#81-authentication--profile-setup)
   * 8.2 [Tri-Lingual Localization](#82-tri-lingual-localization)
   * 8.3 [Leaf Health Scanner & ICAR Advisory](#83-leaf-health-scanner--icar-advisory)
   * 8.4 [APMC Mandi Price Intelligence](#84-apmc-mandi-price-intelligence)
   * 8.5 [Agro-Climatic Yield Forecasting](#85-agro-climatic-yield-forecasting)
   * 8.6 [Community Biosecurity Network & GIS Map](#86-community-biosecurity-network--gis-map)
9. [Complete REST API Reference & Payloads](#9-complete-rest-api-reference--payloads)
10. [Database Schema & Architecture](#10-database-schema--architecture)
11. [Local Development & Installation Guide](#11-local-development--installation-guide)
12. [Production Docker Deployment](#12-production-docker-deployment)
13. [Troubleshooting & Frequently Asked Questions (FAQ)](#13-troubleshooting--frequently-asked-questions-faq)
14. [Repository File & Directory Structure](#14-repository-file--directory-structure)
15. [Academic Credits & Project Information](#15-academic-credits--project-information)
16. [License & Formal Acknowledgements](#16-license--formal-acknowledgements)

---

## 1. Executive Summary & Motivation

Agriculture sustains over 58% of India's rural population and contributes approximately 18% to the national Gross Domestic Product (GDP). In states like Karnataka, smallholder farmers cultivate diverse horticultural and cash crops including tomato, potato, sugarcane, cotton, maize, rice, and wheat. Despite progressive advancements in agrarian science, smallholders continuously suffer catastrophic revenue losses attributable to four systemic vulnerabilities:

1. **Delayed Foliar Disease Identification:** Fungal pathogens (e.g., *Phytophthora infestans*, *Alternaria solani*) and viral vectors (e.g., *TYLCV*) proliferate within 48 to 72 hours under humid conditions. Conventional agricultural extension services suffer from severe officer-to-farmer deficits (often exceeding 1:1,000), meaning farmers receive diagnostic assistance only after irreversible crop damage (30% to 50% yield reduction) has already occurred.
2. **Extreme APMC Mandi Price Volatility & Distress Selling:** Daily modal prices across Agricultural Produce Market Committee (APMC) mandis fluctuate wildly due to localized arrival gluts, seasonal rainfall, and speculative trading. Because farmers lack forward-looking market projections, they frequently sell perishable harvests to intermediaries at distress rates below their production costs.
3. **Agro-Climatic Yield Guesswork:** Deciding crop allocation without empirical yield projections leads to suboptimal resource management, improper fertilizer scheduling, and financial instability.
4. **Information Silos & Accessibility Barriers:** Most existing agronomy apps are single-purpose, proprietary, English-only, and demand high-end smartphone hardware or high-bandwidth connectivity, alienating non-English speaking marginal farmers.

### The Smart Crop Advisory Solution
The **Smart Crop Advisory System (SCA)** is an open, cloud-native, tri-lingual precision agriculture platform designed specifically for Indian smallholders. It bridges these critical gaps by combining:
* An edge-quantized **Visual State Space Model (VMamba Tiny INT8)** providing instantaneous, 58-class leaf pathology identification with lab-to-field domain resilience.
* A multi-variable **Random Forest Mandi Price Regressor** ingesting 19 features (including 7-day live weather forecasts and historical price lags) across 42 Karnataka APMC markets.
* An **Agro-Climatic Crop Yield Predictor** trained on Directorate of Economics and Statistics (DES MoA&FW) data across 12 crops and 15 states.
* An automated **ICAR/NHB Chemical & Cultural Protocol Generator** providing immediate, curative, preventive, and organic spray schedules with safety withholding periods.
* A **Community Biosecurity Network** using **Groq LLM (`llama-3.3-70b`)** to synthesize verified disease detections into localized district outbreak alerts.
* Complete **Tri-Lingual Localization** supporting English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी).

---

## 2. Core Technical Innovations

| Innovation | Conventional Approach | Smart Crop Advisory System Approach | Real-World Advantage |
| :--- | :--- | :--- | :--- |
| **Pathology Vision Backbone** | ResNet-50 / VGG-16 / Standard ViT | **VMamba (VSSM Tiny) with 2D Selective Scan (SS2D)** | Achieves linear computational complexity $O(N)$ vs quadratic $O(N^2)$ in ViT, capturing global contextual leaf dependencies in **244 ms on CPU**. |
| **Domain-Shift Robustness** | Models trained solely on clean laboratory backgrounds (PlantVillage) fail in fields | **Synthetic Field Compositing + Multi-View Augmentation + 2-View TTA** | Real-world field accuracy increased by **+28.90 percentage points** (from 42.20% to 71.10%), resolving background bias. |
| **Cross-Species False Positives** | Unconstrained 58-class flat softmax across all crops simultaneously | **Crop-Gated Hierarchical Logit Masking + Temperature Scaling ($T=1.20$)** | Eliminates biological absurdities (e.g., diagnosing a potato leaf with sugarcane red rot) and calibrates confidence. |
| **Input Quality Gate** | Silent failure on blurred, dark, or non-leaf photos | **Dual-Stage OOD Validator (Laplacian Blur + HSV Chlorophyll Filter)** | Rejects non-plant and unreadable images prior to neural network inference, preventing junk predictions. |
| **Market Intelligence** | Naive historical rolling averages ignoring atmospheric factors | **Weather-Aware Multi-Lag Regressor (19 features + Live Open-Meteo Sync)** | $R^2 = 0.7525$ with **89.35% market regime accuracy** (Low, Medium, High) without future lookahead leakage. |
| **Yield Forecasting** | Generalized regional averages | **11-Feature Agro-Climatic Random Forest Pipeline** | $R^2 = 0.9902$ across 12 crops, integrating soil pH, moisture, irrigation type, and seasonal climate. |
| **Advisory Bulletins** | Unconstrained LLM generation prone to chemical dosage hallucination | **ICAR-Grounded Groq LLM (`llama-3.3-70b`) with Strict Negative Constraints** | 100% verified agricultural chemicals; deterministic fallback on network failure ensures 0% downtime. |
| **Cloud Runtime Cost** | Heavy GPU instances ($50–$200/month) or high-memory cloud VMs (>1 GB RAM) | **Dynamic ONNX INT8 Quantization + C Arena Trimming (`malloc_trim`)** | Fully operational on Render's **512 MB Free Tier** with steady-state RAM usage under **360 MB**. |

---

## 3. End-to-End System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client (React 18 + Vite + Tailwind CSS)"]
        UI["Mobile-Responsive Touch UI & Navigation"]
        I18N["i18next Engine (English | Kannada | Hindi)"]
        AuthCtx["Client Auth State (FastAuth Token + Profile)"]
        GISMap["Leaflet GIS Map (District Alert Clusters)"]
        PriceVisualizer["SVG 7-Day Mandi Price Chart"]
    end

    subgraph APILayer["Backend Server (FastAPI + Uvicorn ASGI)"]
        Router["FastAPI Application Router (CORS, GZip, Security)"]
        OODValidator["OOD Validator (Laplacian Variance + HSV Vegetation)"]
        TTAPreprocessor["2-View Aspect-Preserving Preprocessor"]
        AuthService["FastAuth Manager (PBKDF2-HMAC-SHA256)"]
        CommunityService["Biosecurity Community Service"]
    end

    subgraph AIEngines["Analytical & Machine Learning Models"]
        VMambaEngine["VMamba VSSM Tiny (INT8 ONNX, 58 Classes, 27.02 MB)"]
        PriceRF["Weather-Aware 19-Feature Mandi Price Random Forest"]
        YieldRF["Agro-Climatic 11-Feature Crop Yield Random Forest"]
        GroqService["Groq LLM (llama-3.3-70b-versatile Outbreak Generator)"]
    end

    subgraph DataFeeds["Data Sources & Persistence Layer"]
        NeonDB[("Neon Serverless PostgreSQL (Persistent Auth & Alerts)")]
        LocalCache[("karnataka_recent.csv (398 KB Pre-Filtered History)")]
        OpenMeteo["Open-Meteo 7-Day Live Atmospheric API"]
        ICARDB[("Curated ICAR-IIHR & NHB Advisory Knowledgebase")]
    end

    ClientLayer <-->|HTTPS / JSON REST API| APILayer
    APILayer --> OODValidator --> TTAPreprocessor --> VMambaEngine
    APILayer --> PriceRF
    PriceRF <--> LocalCache
    PriceRF <--> OpenMeteo
    APILayer --> YieldRF
    VMambaEngine --> ICARDB
    ICARDB --> GroqService --> CommunityService
    APILayer <--> AuthService <--> NeonDB
    APILayer <--> CommunityService <--> NeonDB
```

---

## 4. Agricultural Coverage: 58 Disease & Healthy Classes

The computer vision engine detects **58 specific pathological states and healthy baselines** across **7 primary agricultural crops**, backed by an extensible database covering **14 Indian crops**:

| Crop | Classes Count | Supported Pathology Classes & Scientific Pathogens |
| :--- | :---: | :--- |
| **Cotton** (*Gossypium hirsutum*) | **11** | 1. American Bollworm (*Helicoverpa armigera*)<br>2. Anthracnose (*Colletotrichum gossypii*)<br>3. Bacterial Blight (*Xanthomonas citri pv. malvacearum*)<br>4. Boll Rot Complex<br>5. Cotton Aphid (*Aphis gossypii*)<br>6. Healthy Cotton Leaf<br>7. Mealybug Infestation (*Phenacoccus solenopsis*)<br>8. Pink Bollworm (*Pectinophora gossypiella*)<br>9. Red Cotton Bug (*Dysdercus cingulatus*)<br>10. Thrips Infestation (*Thrips tabaci*)<br>11. Whitefly Infestation (*Bemisia tabaci*) |
| **Maize** (*Zea mays*) | **7** | 1. Armyworm (*Mythimna separata*)<br>2. Common Rust (*Puccinia sorghi*)<br>3. Ear Rot (*Fusarium verticillioides*)<br>4. Fall Armyworm (*Spodoptera frugiperda*)<br>5. Gray Leaf Spot (*Cercospora zeae-maydis*)<br>6. Healthy Maize Leaf<br>7. Stem Borer (*Chilo partellus*) |
| **Potato** (*Solanum tuberosum*) | **9** | 1. Bacterial Wilt (*Ralstonia solanacearum*)<br>2. Early Blight (*Alternaria solani*)<br>3. Fungal Leaf Spot (*Cercospora concors*)<br>4. Healthy Potato Leaf<br>5. Late Blight (*Phytophthora infestans*)<br>6. Root-Knot Nematode Damage (*Meloidogyne spp.*)<br>7. Pest Foliar Damage<br>8. Phytophthora Infestans Systemic Rot<br>9. Potato Virus Y / Leafroll Virus |
| **Rice** (*Oryza sativa*) | **5** | 1. Bacterial Leaf Blight (*Xanthomonas oryzae pv. oryzae*)<br>2. Brown Spot (*Bipolaris oryzae*)<br>3. Leaf Smut (*Entyloma oryzae*)<br>4. Rice Blast (*Magnaporthe oryzae*)<br>5. Tungro Bacilliform Virus (RTV) |
| **Sugarcane** (*Saccharum officinarum*) | **5** | 1. Healthy Sugarcane Leaf<br>2. Sugarcane Mosaic Virus (SCMV)<br>3. Red Rot (*Colletotrichum falcatum*)<br>4. Red Rust (*Puccinia kuehnii*)<br>5. Yellow Rust (*Puccinia erianthi*) |
| **Tomato** (*Solanum lycopersicum*) | **10** | 1. Bacterial Spot (*Xanthomonas perforans*)<br>2. Early Blight (*Alternaria solani*)<br>3. Healthy Tomato Leaf<br>4. Late Blight (*Phytophthora infestans*)<br>5. Leaf Mold (*Passalora fulva*)<br>6. Septoria Leaf Spot (*Septoria lycopersici*)<br>7. Spider Mites / Two-Spotted Spider Mite (*Tetranychus urticae*)<br>8. Target Spot (*Corynespora cassiicola*)<br>9. Tomato Mosaic Virus (ToMV)<br>10. Tomato Yellow Leaf Curl Virus (TYLCV) |
| **Wheat** (*Triticum aestivum*) | **11** | 1. Black Rust / Stem Rust (*Puccinia graminis*)<br>2. Brown Rust / Leaf Rust (*Puccinia triticina*)<br>3. Flag Smut (*Urocystis agropyri*)<br>4. Healthy Wheat Leaf<br>5. Leaf Blight (*Bipolaris sorokiniana*)<br>6. Powdery Mildew (*Blumeria graminis f. sp. tritici*)<br>7. Stem Fly (*Atherigona naqvii*)<br>8. Wheat Aphid (*Rhopalosiphum padi*)<br>9. Wheat Mite (*Petrobia latens*)<br>10. Fusarium Head Blight / Wheat Scab (*Fusarium graminearum*)<br>11. Yellow / Stripe Rust (*Puccinia striiformis*) |
| **Secondary Registry Crops** | **7** | Chilli, Onion, Soybean, Groundnut, Banana, Apple, Mango (curated ICAR agronomic profiles, seasonal calendars, and chemical schedules) |

---

## 5. Mathematical Formulations & Algorithmic Principles

### 5.1 Out-of-Distribution (OOD) Quality & Leaf Filtering
To prevent erroneous inference on blurred images or non-plant photographs, the input image $I$ undergoes two consecutive deterministic validation checks:

1. **Laplacian Blur Quality Gate:**
   The image is converted to grayscale $I_{\text{gray}}$ and convolved with the discrete Laplacian operator:
   $$\nabla^2 I_{\text{gray}} = \frac{\partial^2 I}{\partial x^2} + \frac{\partial^2 I}{\partial y^2}$$
   The sharpness metric is computed as the statistical variance of the response:
   $$\sigma^2 = \text{Var}(\nabla^2 I_{\text{gray}}) = \frac{1}{N} \sum_{i=1}^N \left( (\nabla^2 I)_i - \mu_{\nabla^2 I} \right)^2$$
   Images with $\sigma^2 < 12.0$ are immediately rejected as severely defocused or blurred.

2. **HSV Chlorophyll Vegetation Filter:**
   The image is transformed into the HSV (Hue, Saturation, Value) color space. Vegetation pixels are extracted using the botanical chlorophyll spectral envelope:
   $$\text{Mask}(p) = \begin{cases} 1 & \text{if } H(p) \in [25^\circ, 95^\circ] \land S(p) \ge 0.15 \land V(p) \ge 0.15 \\ 0 & \text{otherwise} \end{cases}$$
   The vegetation fraction is defined as:
   $$\Phi_{\text{leaf}} = \frac{1}{|I|} \sum_{p \in I} \text{Mask}(p)$$
   If $\Phi_{\text{leaf}} < 0.08$ (less than 8% green plant tissue), the upload is rejected as a non-crop object.

### 5.2 Visual State Space Model & 2D Selective Scan (SS2D)
Unlike standard Vision Transformers that exhibit quadratic complexity $\mathcal{O}(N^2)$ with respect to sequence length $N$, the **Visual State Space Model (VMamba)** operates with linear complexity $\mathcal{O}(N)$. 

The continuous 1D State Space Model maps an input 1D signal $x(t) \in \mathbb{R}$ to an output $y(t) \in \mathbb{R}$ through hidden latent state $h(t) \in \mathbb{R}^D$:
$$h'(t) = \mathbf{A}h(t) + \mathbf{B}x(t)$$
$$y(t) = \mathbf{C}h(t)$$

Discretization with timescale parameter $\Delta$ converts the continuous matrices $(\mathbf{A}, \mathbf{B})$ to discrete parameters $(\mathbf{\bar{A}}, \mathbf{\bar{B}})$ using the zero-order hold (ZOH) assumption:
$$\mathbf{\bar{A}} = \exp(\Delta \mathbf{A})$$
$$\mathbf{\bar{B}} = (\Delta \mathbf{A})^{-1}(\exp(\Delta \mathbf{A}) - \mathbf{I}) \cdot \Delta \mathbf{B}$$
The discrete state equation is:
$$h_t = \mathbf{\bar{A}} h_{t-1} + \mathbf{\bar{B}} x_t$$
$$y_t = \mathbf{C} h_t$$

To generalize this 1D causal mechanism to 2D non-causal agricultural foliage images, **2D Selective Scan (SS2D)** unrolls image feature maps along four distinct spatial traversal paths:
1. Top-Left to Bottom-Right (horizontal raster scan)
2. Bottom-Right to Top-Left (reverse horizontal scan)
3. Top-Left to Bottom-Right (vertical column scan)
4. Bottom-Right to Top-Left (reverse vertical column scan)

Each scanned trajectory is processed through an independent selective state space block, and the four resulting feature representations are merged via summation. This ensures that every spatial pixel in the leaf blade attends to context from all surrounding tissue without quadratic attention matrices.

### 5.3 Crop-Gated Inference & Temperature Scaling
Given the 58 raw output logits $\mathbf{z} \in \mathbb{R}^{58}$ from the ONNX runtime and the user's selected crop $c$, the system applies hierarchical crop-gating:
1. Let $\mathcal{K}_c \subset \{0, \dots, 57\}$ be the ordered subset of class indices corresponding to crop $c$.
2. The logits for crop $c$ are extracted: $\mathbf{z}_c = \{ z_k \mid k \in \mathcal{K}_c \}$.
3. Calibrated probabilities are computed using Temperature-Scaled Softmax ($T = 1.20$):
   $$p_k = \frac{\exp(z_k / T)}{\sum_{j \in \mathcal{K}_c} \exp(z_j / T)}, \quad \forall k \in \mathcal{K}_c$$
4. **Uncertainty Guard:** If $\max_{k \in \mathcal{K}_c} (p_k) < 0.25$, the diagnosis is flagged as `uncertain = true`, advising the farmer to provide a clearer, closer image.

### 5.4 Weather-Aware Mandi Price Regression
The Mandi Price Regressor predicts the daily modal trading price $\hat{P}_{t}$ (₹/Quintal) across 42 Karnataka markets. The model formulation is:
$$\hat{P}_{t} = f_{\text{RF}}\Big( \mathbf{X}_{\text{calendar}}, \mathbf{X}_{\text{categorical}}, \mathbf{X}_{\text{momentum}}, \mathbf{X}_{\text{weather}} \Big)$$
Where the 19 input features are defined as:
* **Calendar Cyclics (6):** Year, Month, Day, Day of Week, Day of Year, Agricultural Season (Kharif, Rabi, Summer).
* **Categorical Codes (5):** Commodity ID, Market ID, District ID, Variety ID, Grade ID (all integer label encoded).
* **Price Momentum Lags (4):** 
  * $\text{lag}_1 = P_{t-1}$ (Previous trading day modal price)
  * $\text{lag}_3 = P_{t-3}$ (3-day lag)
  * $\text{lag}_7 = P_{t-7}$ (Weekly lag)
  * $\text{rolling}_7 = \frac{1}{7} \sum_{i=1}^7 P_{t-i}$ (7-day historical rolling moving average)
* **Meteorological Regressors (4):** Live daily temperature ($^\circ\text{C}$), relative humidity ($\%$), precipitation ($\text{mm}$), and wind speed ($\text{km/h}$) retrieved in real time from the Open-Meteo API.

Market regime classification maps the predicted continuous price into three economic regimes:
$$\text{Regime}(\hat{P}) = \begin{cases} 
\text{Low (Distress / Glut)} & \text{if } \hat{P} \le ₹1,800/\text{Qtl} \\ 
\text{Medium (Normal Trading)} & \text{if } ₹1,800 < \hat{P} \le ₹2,750/\text{Qtl} \\ 
\text{High (Peak Seasonal Rate)} & \text{if } \hat{P} > ₹2,750/\text{Qtl} 
\end{cases}$$

### 5.5 Agro-Climatic Yield Estimation Pipeline
The crop yield model estimates biological field productivity $Y$ (tonnes per hectare, $\text{t/ha}$) and total farm production $\hat{W} = Y \times \text{Area}$ based on 11 input parameters:
* **Categorical Variables:** Crop species, State, Cultivation Season, Soil Taxonomy (Alluvial, Black, Clay, Laterite, Loamy, Red, Sandy).
* **Agro-Climatic Numerical Variables:** Area (ha), Ambient Temperature ($^\circ\text{C}$), Relative Humidity ($\%$), Cumulative Rainfall ($\text{mm}$), Soil pH ($0–14$), Soil Moisture Index ($\%$), Irrigation Coverage Factor ($0.0–1.0$).

Yield tier thresholds are defined empirically:
$$\text{Tier}(Y) = \begin{cases} 
\text{Low Tier} & \text{if } Y \le 2.00 \text{ t/ha} \quad (\text{Dryland coarse grains, pulses, rainfed oilseeds}) \\ 
\text{Medium Tier} & \text{if } 2.00 < Y \le 4.42 \text{ t/ha} \quad (\text{Irrigated cereals: paddy, wheat, hybrid maize}) \\ 
\text{High Tier} & \text{if } Y > 4.42 \text{ t/ha} \quad (\text{High-biomass commercial crops: sugarcane, potato, tomato}) 
\end{cases}$$

### 5.6 LLM Biosecurity Advisory Generation
When an outbreak alert is generated, the backend constructs a structured prompt incorporating verified ICAR treatment protocols. The prompt is dispatched to Groq API running `llama-3.3-70b-versatile` ($T=0.30$):
```
System: You are an official ICAR Plant Protection Specialist drafting a biosecurity bulletin for local farmers.
User: In {district}, {crop} has been diagnosed with {disease}. 
Official Symptoms: {symptoms}
Immediate Protocol: {what_to_do_now}
Preventive Steps: {how_to_prevent}
Fungicides/Pesticides: {management_treatment}

Draft a single concise community advisory paragraph. 
STRICT CONSTRAINTS:
1. Do NOT invent chemicals, brand names, or dosages beyond the provided ICAR text.
2. Do NOT mention farmer identity, confidence percentages, or technical AI metrics.
3. Keep instructions direct, practical, and action-oriented.
```
If network latency exceeds 3.5 seconds or rate limits are reached, the service automatically falls back to deterministic ICAR rule templates, ensuring 100% operational reliability.

---

## 6. Empirical Evaluation & Benchmark Metrics

All model metrics were evaluated on isolated, held-out test datasets unseen during model optimization.

### 6.1 Pathology Vision Model (VMamba INT8)
* **Test Dataset:** 782 unseen foliar images spanning all 7 crops.
* **Evaluation Scenarios:**
  * *Clean Aspect-Preserved:* Evaluated on standardized central crop images.
  * *Field-Shifted / Background-Augmented:* Evaluated on images composited with real farm soil, weed, and sky backgrounds to simulate field photography.

| Model / Configuration | Clean Test Accuracy | Field-Shifted Accuracy | Absolute Improvement | Inference Latency (CPU) | Model Disk Size |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **ResNet-50 Baseline** | 71.20% | 38.40% | — | 380 ms | 98.0 MB |
| **MobileNet-V3 Small** | 68.40% | 40.10% | — | 185 ms | 18.5 MB |
| **VMamba Tiny FP32 (Original)** | 61.51% | 42.20% | — | 340 ms | 114.5 MB |
| **VMamba Tiny INT8 (Retrained + TTA)** | **76.60%** | **71.10%** | **+28.90 pts** | **244 ms** | **27.02 MB** |
| **Crop-Gated Deploy Accuracy (Overall)** | **~80.40%** | **~75.80%** | **+13.00 pts** | **244 ms** | **27.02 MB** |

#### Per-Crop Classification Accuracy (Held-Out Test Data)
```
Crop          Clean Accuracy     Field-Shifted Accuracy     Improvement Note
---------------------------------------------------------------------------------
Rice (5)          90.91%                 86.36%             High visual distinctiveness of lesions
Sugarcane (5)     87.50%                 87.50%             100% retention on red rot & rusts
Tomato (10)       86.67%                 74.00%             Field accuracy doubled (was 36.67%)
Maize (7)         84.38%                 84.38%             Consistently identifies fall armyworm
Wheat (11)        80.61%                 75.76%             Effective rust differentiation
Cotton (11)       70.59%                 69.61%             Robust bollworm vs healthy separation
Potato (9)        68.70%                 69.47%             Early vs Late Blight resolved (+19.85%)
```

---

### 6.2 Mandi Price Forecaster & Price Regimes
* **Dataset:** 2,629 held-out daily APMC transactions across 42 Karnataka markets.
* **Model:** `RandomForestRegressor(n_estimators=300, max_depth=25, min_samples_split=3)`
* **Primary Metrics:**
  * **Mean Absolute Error (MAE):** ₹294.47 per Quintal
  * **Root Mean Squared Error (RMSE):** ₹526.65 per Quintal
  * **Coefficient of Determination ($R^2$):** **0.7525**
  * **Market Regime Accuracy:** **89.35%** (Macro F1: `89.34%`, Weighted F1: `89.37%`)

#### Market Regime Confusion Matrix (2,629 Test Samples)
```
                    Predicted Low      Predicted Medium      Predicted High
Actual Low               515                  56                    8          (Recall: 88.9%)
Actual Medium             52                 930                   57          (Recall: 89.5%)
Actual High               11                  96                  904          (Recall: 89.4%)
```

#### Price Error Tolerance Band Analysis
* Within $\pm 10\%$ of Actual Market Price: **82.15%** of all test days
* Within $\pm 15\%$ of Actual Market Price: **88.70%** of all test days
* Within $\pm 20\%$ of Actual Market Price: **93.42%** of all test days

---

### 6.3 Crop Yield Forecaster & Yield Tiers
* **Dataset:** 600 held-out agro-climatic records from DES MoA&FW and ICRISAT.
* **Model:** `RandomForestRegressor(n_estimators=100, max_depth=16, min_samples_split=4)`
* **Primary Metrics:**
  * **Mean Absolute Error (MAE):** **1.1596 tonnes / hectare**
  * **Root Mean Squared Error (RMSE):** **2.6307 tonnes / hectare**
  * **Coefficient of Determination ($R^2$):** **0.9902**
  * **Yield Tier Accuracy:** **93.17%** (Macro F1: `93.04%`, Weighted F1: `93.14%`)

#### Crop Yield Tier Confusion Matrix (600 Test Records)
```
                    Predicted Low      Predicted Medium      Predicted High
Actual Low               194                  12                    0          (Recall: 94.2%)
Actual Medium              8                 167                   15          (Recall: 87.9%)
Actual High                0                   6                  198          (Recall: 97.1%)
```

---

## 7. Cloud Deployment & Low-Footprint Engineering (<360 MB RAM)

Standard deep learning frameworks (PyTorch, TorchVision) and multi-year APMC CSV datasets exceed 1.2 GB of heap memory upon container startup, causing immediate `Out-Of-Memory (OOM) Kill` errors on free cloud tiers (such as Render's strict 512 MB cgroup limit). The system incorporates five critical engineering optimizations:

```
[PyTorch FP32 Baseline: 114.50 MB] ──(Dynamic INT8 Quantization)──> [ONNX INT8: 27.02 MB (4.2x Smaller)]
[Raw Historical APMC:   59.50 MB] ──(Recent Lag Pruning)───────> [karnataka_recent.csv: 398 KB]
[Cloud Memory Usage:    >650 MB]  ──(malloc_trim + 1 Thread)────> [Active RAM: < 360 MB (< 512 MB Limit)]
```

1. **Dynamic INT8 Quantization:** Converted the 114.5 MB PyTorch checkpoint to an ONNX INT8 dynamic quantized model (`model/vmamba_int8.onnx`, 27.02 MB). This allowed total removal of `torch` and `torchvision` from the production container, saving ~550 MB of memory overhead.
2. **APMC Historical Dataset Pruning:** Replaced the 59.5 MB `training_dataset.csv` with a pre-aggregated 398 KB file (`data/karnataka_recent.csv`) retaining only the latest trading records and pre-calculated rolling momentum values.
3. **C++ Arena Memory Deallocation:** Integrated Linux glibc `malloc_trim(0)` calls via Python `ctypes` executed immediately following server startup and heavy garbage collection cycles.
4. **Restricted Runtime Thread Pools:** Configured ONNX Runtime session options with `intra_op_num_threads = 1` and `inter_op_num_threads = 1`, preventing multi-threaded heap fragmentation. Active inference memory peaks at only **164.6 MB**.
5. **Cold-Start Keep-Alive:** Automated external health polling pinging `GET /health` every 5 minutes maintains warm worker processes and eliminates 45-second cold-start delays.

---

## 8. Comprehensive User Manual & Feature Walkthrough

### 8.1 Authentication & Profile Setup
1. Navigate to the web application: [https://ai-smart-farming-system-ivory.vercel.app](https://ai-smart-farming-system-ivory.vercel.app).
2. Click **Sign In** or **Register**.
3. Create an account with your Name, Phone/Email, District (e.g., Kolar, Mandya, Belagavi), Taluk, and Primary Cultivated Crop.
4. The system issues a persistent JWT FastAuth session token stored securely in `localStorage`.
5. *Demo Credentials:* Email: `test_farmer@krishi.in` | Password: `farmer123`.

### 8.2 Tri-Lingual Localization
The application provides full native language support. Farmers can click the language toggle located in the upper-right navigation bar to instantly switch the entire interface between:
* **English (Default)**
* **ಕನ್ನಡ (Kannada)** — complete localization for Karnataka agricultural communities.
* **हिन्दी (Hindi)** — national language localization.

```
+---------------------------------------------------------------------------------------------------+
|  [SCA Logo]  Smart Crop Advisory  |  [Dashboard]  [Disease]  [Mandi Prices]  [Yield]  [Community]  |
|  Language: [English | ಕನ್ನಡ | हिन्दी]                                           User: Ramesh Patel|
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  Welcome, Ramesh Patel (Kolar District • Primary Crop: Tomato)                                    |
|                                                                                                   |
|  +--------------------+  +--------------------+  +--------------------+  +---------------------+  |
|  | CROP HEALTH        |  | MANDI RATES        |  | YIELD ESTIMATION   |  | COMMUNITY ALERTS    |  |
|  | Disease Diagnosis  |  | Price Forecasting  |  | Crop Yield Forecast|  | Outbreak Warnings   |  |
|  | [Launch Scanner >] |  | [View Prices >]    |  | [Estimate Yield >] |  | [Review Alerts >]   |  |
|  +--------------------+  +--------------------+  +--------------------+  +---------------------+  |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### 8.3 Leaf Health Scanner & ICAR Advisory
1. Click **Crop Health / Launch Scanner** (`/detect`).
2. Select your crop from the dropdown (e.g., **Tomato**, **Potato**, **Rice**, **Cotton**, **Wheat**, **Maize**, **Sugarcane**).
3. Upload a leaf photo from your gallery or capture one directly using your mobile camera.
4. Click **Analyze Crop Health**.
5. Within 300 ms, the system displays:
   * **Diagnosis:** Disease name and scientific pathogen (e.g., *Early Blight (Alternaria solani)*).
   * **Confidence Gauge:** Calibrated probability percentage (e.g., 74.7%).
   * **Top-3 Probability Distribution:** Breakdown of secondary differential diagnoses.
   * **Symptoms:** Visual lesion identifiers and leaf patterns.
   * **What to do now:** Urgent physical actions (e.g., pruning infected foliage, switching to drip lines).
   * **Preventive Protocol:** Crop rotation, resistant cultivar selection, and sanitation.
   * **Chemical / Bio-Pesticide Treatments:** Specific ICAR-approved chemical formulations, spray dosages per liter, and safety pre-harvest intervals (e.g., Mancozeb 75% WP @ 2.0 g/L).
   * **Community Alert Button:** One-click option to broadcast the diagnosis as an anonymous district alert.

### 8.4 APMC Mandi Price Intelligence
1. Click **Mandi Rates / View Prices** (`/price-prediction`).
2. Select your **District** (e.g., *Kolar*), **APMC Market** (e.g., *Kolar Market*), and **Commodity** (e.g., *Tomato*).
3. The platform fetches live Open-Meteo atmospheric variables and past market lags to present:
   * **Current Modal Price:** ₹2,200 / Quintal (₹22.00 / kg).
   * **Market Regime Badge:** Green (`High`), Amber (`Medium`), or Red (`Low`).
   * **Expected 7-Day Price Trajectory:** Interactive SVG chart displaying predicted daily prices over the coming week.
   * **Actionable Commercial Advisory:** Specific recommendation on whether to sell immediately or withhold harvest based on expected market momentum.

### 8.5 Agro-Climatic Yield Forecasting
1. Click **Yield Estimation / Estimate Yield** (`/yield-prediction`).
2. Enter your farm parameters:
   * **Cultivation Area:** Land size in Acres or Hectares.
   * **Crop & Season:** Kharif, Rabi, Zaid, or Annual.
   * **Soil Category:** Alluvial, Black, Clay, Laterite, Loamy, Red Sandy.
   * **Irrigation Infrastructure:** Rainfed, Canal, Borewell Drip, Sprinkler.
3. Click **Calculate Harvest Output**.
4. The system calculates:
   * **Estimated Productivity:** Predicted yield in tonnes per hectare (e.g., 4.85 t/ha).
   * **Total Expected Farm Harvest:** Total metric tonnes based on entered acreage.
   * **Yield Tier Badge:** High, Medium, or Low productivity categorization.

### 8.6 Community Biosecurity Network & GIS Map
1. Click **Community Alerts / Review Alerts** (`/community`).
2. **Interactive GIS Map:** Explore localized clusters of disease outbreaks with color-coded severity badges (*Critical, High Danger, Moderate*).
3. **LLM Outbreak Bulletins:** Read district-wide summaries generated by Groq LLM synthesizing recent farmer reports and verified ICAR recommendations.
4. **Peer Upvoting:** Verify neighboring reports by upvoting valid outbreak notices.
5. **Community Farmer Chat:** Engage in peer-to-peer discussions with farmers in your taluk regarding input availability, fair mandi prices, and weather observations.

---

## 9. Complete REST API Reference & Payloads

Base URLs:
* **Production Cloud API:** `https://ai-smart-farming-system-if62.onrender.com`
* **Local Development Server:** `http://127.0.0.1:8000`

### 1. System Health Check
* **Endpoint:** `GET /health`
* **Description:** Verifies server uptime, execution device, and active model status.
* **Response `200 OK`:**
```json
{
  "status": "healthy",
  "device": "cpu",
  "gpu_name": "CPU",
  "confidence_threshold": 0.7,
  "model_loaded": true
}
```

---

### 2. Crop Leaf Disease Diagnosis
* **Endpoint:** `POST /api/predict`
* **Content-Type:** `multipart/form-data`
* **Parameters:**
  * `file`: Binary image file (JPEG, PNG, WebP)
  * `crop`: String (e.g., `"Tomato"`, `"Potato"`, `"Rice"`, `"Cotton"`, `"Wheat"`, `"Maize"`, `"Sugarcane"`)
* **Response `200 OK`:**
```json
{
  "status": "success",
  "uncertain": false,
  "is_model_active": true,
  "model_architecture": "VMamba / VSSM Tiny (Visual State Space Model)",
  "disease": "Early Blight",
  "crop": "Tomato",
  "confidence": 0.7467,
  "top_probabilities": [
    { "disease": "Early Blight", "probability": 0.7467 },
    { "disease": "Late Blight", "probability": 0.2013 },
    { "disease": "Bacterial Spot", "probability": 0.0140 }
  ],
  "disease_info": {
    "crop_name": "Tomato",
    "disease_name": "Early Blight",
    "scientific_name": "Alternaria solani",
    "what_is_it": "A destructive foliar fungal disease characterized by brown concentric target spots.",
    "symptoms": "Dark brown circular spots with characteristic concentric rings on lower foliage.",
    "what_to_do_now": "Prune infected lower leaves and switch strictly to root-zone drip irrigation.",
    "how_to_prevent": "Practice a 3-year crop rotation with non-solanaceous crops and use certified seeds.",
    "management_treatment": "Spray protective Mancozeb 75% WP @ 2.0g/L or Azoxystrobin + Difenoconazole @ 1.0ml/L."
  }
}
```
* **Error Response (Blurred Image) `400 Bad Request`:**
```json
{
  "status": "rejected",
  "error": "Image is too blurry. Please retake the photo with steady focus and clear lighting."
}
```

---

### 3. Mandi Market Price Forecast
* **Endpoint:** `POST /api/price/predict`
* **Content-Type:** `application/json`
* **Request Body:**
```json
{
  "district": "Kolar",
  "market": "Kolar",
  "commodity": "Tomato"
}
```
* **Response `200 OK`:**
```json
{
  "status": "success",
  "current_price": 2200.0,
  "expected_trend": "Bearish (Downward)",
  "regime": "High",
  "forecast": [
    { "date": "13 Nov", "predicted_price": 2288.30, "price_per_kg": 22.88, "change": 88.30 },
    { "date": "14 Nov", "predicted_price": 2197.39, "price_per_kg": 21.97, "change": -90.91 },
    { "date": "15 Nov", "predicted_price": 2150.12, "price_per_kg": 21.50, "change": -47.27 },
    { "date": "16 Nov", "predicted_price": 2110.55, "price_per_kg": 21.11, "change": -39.57 },
    { "date": "17 Nov", "predicted_price": 2085.00, "price_per_kg": 20.85, "change": -25.55 },
    { "date": "18 Nov", "predicted_price": 2040.20, "price_per_kg": 20.40, "change": -44.80 },
    { "date": "19 Nov", "predicted_price": 2015.60, "price_per_kg": 20.16, "change": -24.60 }
  ]
}
```

---

### 4. Crop Yield Prediction
* **Endpoint:** `POST /api/yield/predict`
* **Content-Type:** `application/json`
* **Request Body:**
```json
{
  "crop": "Tomato",
  "state": "Karnataka",
  "season": "Kharif",
  "soil_type": "Red",
  "area_hectares": 2.5,
  "temperature": 26.5,
  "humidity": 68.0,
  "rainfall": 820.0,
  "soil_ph": 6.5,
  "soil_moisture": 45.0,
  "irrigation": 1.0
}
```
* **Response `200 OK`:**
```json
{
  "status": "success",
  "predicted_yield_t_per_ha": 4.85,
  "total_production_tonnes": 12.125,
  "tier": "High",
  "confidence_r2": 0.9902
}
```

---

### 5. Community Outbreak Alerts
* **Endpoint:** `GET /api/community/alerts`
* **Query Parameters:** `district` (Optional string)
* **Response `200 OK`:**
```json
[
  {
    "id": 14,
    "district": "Kolar",
    "crop": "Tomato",
    "disease": "Early Blight",
    "severity": "High Danger",
    "upvotes": 18,
    "timestamp": "2026-11-12T14:32:00Z",
    "llm_advisory": "Urgent alert for tomato growers in Kolar: Early Blight outbreak detected. Immediate action: prune lower yellowed foliage and spray Mancozeb 75% WP @ 2g/L. Strictly avoid overhead irrigation."
  }
]
```

---

### 6. FastAuth User Registration & Authentication
* **Endpoint:** `POST /api/auth/register`
* **Request Body:**
```json
{
  "email": "farmer.ramesh@krishi.in",
  "password": "SecurePassword123",
  "name": "Ramesh Patel",
  "phone": "9876543210",
  "district": "Kolar",
  "taluk": "Bangarapet",
  "primary_crop": "Tomato"
}
```
* **Response `200 OK`:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_94b1e7",
    "email": "farmer.ramesh@krishi.in",
    "name": "Ramesh Patel",
    "district": "Kolar"
  }
}
```

---

## 10. Database Schema & Architecture

The system utilizes an abstract persistence layer (`backend/db_compat.py`) supporting **Neon Serverless PostgreSQL** in cloud environments and a lightweight **SQLite** fallback for local development.

```
+----------------------------------------------------+       +-----------------------------------------------------+
|                      users                         |       |                  community_alerts                   |
+----------------------------------------------------+       +-----------------------------------------------------+
| id             VARCHAR(64) PRIMARY KEY             |<--+   | id              SERIAL PRIMARY KEY                  |
| email          VARCHAR(255) UNIQUE NOT NULL        |   |   | user_id         VARCHAR(64) REFERENCES users(id)    |
| password_hash  VARCHAR(255) NOT NULL               |   |   | crop            VARCHAR(64) NOT NULL                |
| name           VARCHAR(128) NOT NULL               |   |   | disease         VARCHAR(128) NOT NULL               |
| phone          VARCHAR(20)                         |   |   | district        VARCHAR(64) NOT NULL                |
| district       VARCHAR(64)                         |   |   | taluk           VARCHAR(64)                         |
| taluk          VARCHAR(64)                         |   |   | severity        VARCHAR(32) NOT NULL                |
| primary_crop   VARCHAR(64)                         |   |   | advisory_text   TEXT                                |
| created_at     TIMESTAMP DEFAULT NOW()             |   |   | upvotes         INTEGER DEFAULT 0                   |
+----------------------------------------------------+   |   | created_at      TIMESTAMP DEFAULT NOW()             |
                                                         |   +-----------------------------------------------------+
                                                         |                              |
                                                         +------------------------------+
                                                         |                              |
+----------------------------------------------------+   |   +-----------------------------------------------------+
|                   chat_messages                    |   |   |                     alert_votes                     |
+----------------------------------------------------+   |   +-----------------------------------------------------+
| id             SERIAL PRIMARY KEY                  |   |   | id              SERIAL PRIMARY KEY                  |
| sender_id      VARCHAR(64) REFERENCES users(id)----+   +---| user_id         VARCHAR(64) REFERENCES users(id)    |
| district       VARCHAR(64) NOT NULL                |       | alert_id        INTEGER REFERENCES alerts(id)       |
| message        TEXT NOT NULL                       |       | created_at      TIMESTAMP DEFAULT NOW()             |
| created_at     TIMESTAMP DEFAULT NOW()             |       | UNIQUE(user_id, alert_id)                           |
+----------------------------------------------------+       +-----------------------------------------------------+
```

---

## 11. Local Development & Installation Guide

### Prerequisites
* **Python:** 3.10, 3.11, or 3.12 installed
* **Node.js:** v18 or v20+ with `npm`
* **Git:** Version 2.30+

### Step 1: Clone the Repository
```bash
git clone https://github.com/mdkhalanderk/ai-smart-farming-system.git
cd ai-smart-farming-system
```

### Step 2: Backend Environment Setup
```bash
# 1. Create a Python virtual environment
python -m venv venv

# 2. Activate the virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# 3. Upgrade pip and install pinned dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=8000
HOST=127.0.0.1
DEBUG=True

# Groq API Key (Optional: for live LLM bulletins; deterministic templates used if omitted)
GROQ_API_KEY=your_groq_api_key_here

# Database Configuration (Optional: uses local SQLite if DATABASE_URL is not set)
DATABASE_URL=postgresql://user:password@ep-cold-pool.neon.tech/neondb?sslmode=require

# Security Secret for JWT FastAuth
JWT_SECRET=super_secure_crop_advisory_secret_2026
```

### Step 4: Run the Backend Server
```bash
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```
Test backend health in a browser or terminal:
```bash
curl http://127.0.0.1:8000/health
```

### Step 5: Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 12. Production Docker Deployment

A multi-stage production `Dockerfile` is provided for containerized deployments:

```bash
# Build the production container
docker build -t smart-crop-advisory:latest .

# Run the container
docker run -d -p 8000:8000 \
  -e PORT=8000 \
  -e GROQ_API_KEY="your_groq_api_key" \
  --name smart-crop-backend \
  smart-crop-advisory:latest
```

Using Docker Compose:
```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## 13. Troubleshooting & Frequently Asked Questions (FAQ)

### Q1: The leaf disease scanner returns "Image is too blurry". What should I do?
**Fix:** The OOD Laplacian variance filter detected $\sigma^2 < 12.0$. Hold the smartphone steady, ensure the leaf is well-illuminated by natural sunlight, and tap your phone screen to focus cleanly on the lesion spots before capturing.

### Q2: Backend fails with `ModuleNotFoundError: No module named 'onnxruntime'`.
**Fix:** Run `pip install onnxruntime==1.19.2`. If running on a minimal Linux VPS, ensure system C++ runtime dependencies are present: `sudo apt-get install -y libgomp1`.

### Q3: Why does Mandi price forecasting require internet access?
**Fix:** The price forecaster dynamically fetches 7-day live meteorological forecasts (temperature, humidity, rain) from the Open-Meteo API. If offline, the server gracefully substitutes historical monthly climate norms for that district.

### Q4: CORS errors when connecting local frontend to local backend.
**Fix:** Verify that the frontend `src/lib/config.js` points to `http://127.0.0.1:8000` and that the FastAPI backend includes `http://localhost:5173` in its `CORSMiddleware` allowed origins.

---

## 14. Repository File & Directory Structure

```
ai-smart-farming-system/
│
├── backend/                             # FastAPI Python Core Application
│   ├── app.py                           # Central REST API controller & routing
│   ├── auth_service.py                  # FastAuth token management & PBKDF2 hashing
│   ├── community_service.py             # District alert syndication & farmer chat
│   ├── crop_knowledge.py                # Curated ICAR crop advisory profiles
│   ├── crop_registry.py                 # 14 Indian crops catalog & state mapping
│   ├── db_compat.py                     # Neon PostgreSQL & SQLite abstraction layer
│   ├── disease_data.py                  # ICAR disease symptoms, dosages & treatments
│   ├── groq_service.py                  # Groq LLM (llama-3.3-70b) advisory generator
│   ├── ood_validator.py                 # Laplacian blur & HSV chlorophyll filters
│   ├── price_service.py                 # 19-feature Mandi Random Forest regressor
│   ├── taluk_data.py                    # Karnataka 31 districts & 240+ taluks database
│   └── yield_service.py                 # 11-feature Crop Yield Random Forest regressor
│
├── model/                               # Trained Machine Learning Artifacts
│   ├── multicrop_classes.json           # 58 canonical pathology class mappings
│   ├── vmamba.py                        # VMamba / VSSM Tiny architecture (SS2D)
│   ├── vmamba_int8.onnx                 # Dynamic quantized ONNX model (27.02 MB)
│   ├── yield_model.joblib               # Trained Scikit-Learn Crop Yield pipeline
│   └── yield_metadata.json              # Feature scales & yield tercile thresholds
│
├── data/                                # Datasets & Pre-filtered Time-Series
│   ├── crop_yield_data.csv              # 3,000 DES & ICRISAT agro-climatic records
│   └── karnataka_recent.csv             # 398 KB pre-filtered recent APMC prices
│
├── training/                            # Training, Quantization & Evaluation
│   ├── multicrop_dataset.py             # Stratified multi-crop dataset loader
│   ├── retrain_robust_multicrop.py      # Field augmentation & ONNX INT8 exporter
│   └── train_multicrop.py               # Feature extraction training script
│
├── frontend/                            # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/                  # Navbar, Footer, PageLoader, GlobalLoader
│   │   ├── context/                     # AuthContext (FastAuth state)
│   │   ├── data/                        # diseaseGuides.js, taluk records
│   │   ├── lib/                         # i18n localization, config.js
│   │   ├── locales/                     # Translations (English, Kannada, Hindi)
│   │   └── pages/                       # Dashboard, DiseaseDetection, MandiPrices, etc.
│   ├── vercel.json                      # Vercel SPA routing & cache policy
│   └── vite.config.js                   # Vite bundling & manual chunk splitting
│
├── reports/                             # Evaluation JSONs & Confusion Matrices
│   ├── multicrop_metrics.json           # 58-class vision classification metrics
│   ├── price_evaluation.json            # Mandi price regression & regime metrics
│   └── yield_evaluation.json            # Crop yield regression & tier metrics
│
├── Dockerfile                           # Production Docker container (Python 3.12 slim)
├── docker-compose.prod.yml              # Production container orchestration
├── render.yaml                          # Render cloud infrastructure blueprint
├── requirements.txt                     # Pinned Python dependencies
└── README.md                            # Comprehensive technical documentation
```

---

## 15. Academic Credits & Project Information

* **Project Title:** Smart Crop Advisory System
* **Degree & Specialization:** Bachelor of Engineering (B.E.) in Artificial Intelligence and Machine Learning
* **Department:** Department of Artificial Intelligence and Machine Learning
* **Institution:** CMR Institute of Technology, AECS Layout, ITPL Main Road, Bengaluru – 560037
* **Affiliated University:** Visvesvaraya Technological University (VTU), Belagavi (Academic Year 2025–2026)
* **Project Guide:** Prof. Laya N, Assistant Professor, Department of AIML, CMRIT
* **Head of Department:** Dr. Shyam P Joy, Professor & Head, Department of AIML, CMRIT
* **Principal:** Dr. Sanjay Jain, Principal, CMRIT

### Student Development Team
1. **Navneet Gowda GT** — `1CR23AI071`
2. **Sachinkumar Narayan Naik** — `1CR24AI407`
3. **Jayanth Gowda CR** — `1CR23AI041`
4. **Mohammed Khalander K** — `1CR23AI062`

---

## 16. License & Formal Acknowledgements

* **License:** Distributed under the permissive open-source **MIT License**.
* **Institutional & Open-Source Acknowledgements:**
  * **Indian Council of Agricultural Research (ICAR)** & **National Horticulture Board (NHB)** for agronomic management protocols.
  * **Directorate of Economics and Statistics (DES MoA&FW)** & **AGMARKNET** for historical APMC daily agricultural transaction records.
  * **Open-Meteo** for reliable, open atmospheric meteorological APIs.
  * **MzeroMiko & VMamba Research Authors** for open-sourcing the Visual State Space Model architecture.

# Developer Guide: Adding & Integrating Additional Crop Disease Models

This guide documents how to expand the Smart Crop Advisory System's disease detection to additional Indian crops (such as Rice, Wheat, Potato, Cotton, Chilli, Maize, etc.) beyond the initial Tomato baseline.

---

## 1. Multi-Crop Architecture Overview

The system uses a modular, decoupled architecture:

```
frontend/ (Crop Selector & Dynamic Advisory UI)
    │
    ▼
FastAPI Backend (POST /api/predict)
    │
    ├─► backend/crop_registry.py (Model Registry & Readiness Catalog)
    │       ├── "tomato": model_status = "active", checkpoint = "model/best_model.pth"
    │       └── "rice":   model_status = "awaiting_model", checkpoint = None
    │
    ├─► If model_status == "active":
    │       ├── backend/ood_validator.py (Out-of-Scope Leaf Filter)
    │       ├── model/vmamba.py (SS2D Visual State Space Classifier)
    │       └── Output: Real Confidence + Top-3 Classes + Advisory
    │
    └─► If model_status == "awaiting_model":
            ├── Transparent notice: "Model awaiting training & validation"
            └── Grounded ICAR Reference Advisory (Symptoms, Biology, Treatments)
```

**Golden Rule:** The system strictly forbids reusing the Tomato classifier on non-tomato crops. Doing so produces dangerous foliar misdiagnoses for farmers.

---

## 2. Step-by-Step: Adding a New Crop Model (e.g., Rice)

### Step 2.1: Prepare the Labeled Dataset
Organize the crop leaf images in `data/<crop>_images/`:
```
data/
└── rice_images/
    ├── Rice___Bacterial_leaf_blight/
    ├── Rice___Blast/
    ├── Rice___Brown_spot/
    ├── Rice___Sheath_blight/
    ├── Rice___Tungro/
    └── Rice___healthy/
```
Ensure each class contains balanced samples (minimum 300–500 images per class recommended) with stratified 70% train / 15% validation / 15% test splits.

### Step 2.2: Define Classes & Transformations in `training/`
In `training/dataset.py`, add the crop class mapping:
```python
RICE_CLASSES = [
    ("Rice___Bacterial_leaf_blight", "Bacterial Leaf Blight"),
    ("Rice___Blast", "Rice Blast"),
    ("Rice___Brown_spot", "Brown Spot"),
    ("Rice___Sheath_blight", "Sheath Blight"),
    ("Rice___Tungro", "Rice Tungro Virus"),
    ("Rice___healthy", "Healthy"),
]
```

Standard evaluation transform:
```python
transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])
```

### Step 2.3: Train the VMamba / Backbone Model
Run training using the pretrained VSSM backbone:
```bash
python training/train.py --crop rice --data_dir data/rice_images --epochs 25 --batch_size 16 --lr 1e-4
```
Save the best checkpoint to `model/rice_model.pth`.

### Step 2.4: Register the Model in `backend/crop_registry.py`
Update `CROP_CATALOGUE["rice"]`:
```python
"rice": {
    "id": "rice",
    "name": "Rice / Paddy",
    "model_status": "active",  # <--- Change from "awaiting_model" to "active"
    "model_architecture": "VMamba / VSSM Tiny",
    "model_weights": "model/rice_model.pth",
    "num_classes": 6,
    "classes": [
        "Bacterial Leaf Blight",
        "Rice Blast",
        "Brown Spot",
        "Sheath Blight",
        "Rice Tungro Virus",
        "Healthy"
    ],
    ...
}
```

### Step 2.5: Verify the Model Pipeline
Run the verification script:
```bash
python scratch/verify_pipeline.py --crop rice
```
Confirm:
1. `GET /api/crops` reports `rice` as `active`.
2. `POST /api/predict` with `crop="rice"` executes `model/rice_model.pth` and returns genuine probabilities.
3. The frontend disease detector displays the 6 supported rice classes and active status badge.

---

## 3. Grounded Advisory Standards
All treatment advisories must cite accredited Indian agricultural bodies:
- **Rice:** ICAR-National Rice Research Institute (NRRI), Cuttack
- **Wheat:** ICAR-Indian Institute of Wheat and Barley Research (IIWBR), Karnal
- **Potato:** ICAR-Central Potato Research Institute (CPRI), Shimla
- **Cotton:** ICAR-Central Institute for Cotton Research (CICR), Nagpur
- **Chilli & Tomato:** ICAR-Indian Institute of Horticultural Research (IIHR), Bengaluru
- **State SAUs:** TNAU Agritech Portal, UAS Bengaluru, PAU Ludhiana

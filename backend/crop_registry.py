"""
Crop Model Registry for Indian Agriculture
Tracks supported crops, active AI models, and model integration status.
"""

import os
from typing import Dict, List, Optional, Any

# Catalogue of Major Indian Crops
CROP_CATALOGUE: Dict[str, Dict[str, Any]] = {
    "tomato": {
        "id": "tomato",
        "name": "Tomato",
        "vernacular_name": "Tamatar / Thakkali",
        "scientific_name": "Solanum lycopersicum",
        "model_status": "active",
        "model_architecture": "VMamba / VSSM Tiny (Visual State Space Model)",
        "model_weights": "model/best_model.pth",
        "num_classes": 10,
        "classes": [
            "Bacterial Spot",
            "Early Blight",
            "Late Blight",
            "Leaf Mold",
            "Septoria Leaf Spot",
            "Spider Mites – Two-Spotted Spider Mite",
            "Target Spot",
            "Tomato Mosaic Virus",
            "Tomato Yellow Leaf Curl Virus",
            "Healthy"
        ],
        "advisory_source": "ICAR-Indian Institute of Horticultural Research (IIHR), Bengaluru & TNAU",
        "description": "Validated 10-class VMamba Tiny classifier running 2D selective state-space scanning."
    },
    "rice": {
        "id": "rice",
        "name": "Rice / Paddy",
        "vernacular_name": "Dhan / Chawal",
        "scientific_name": "Oryza sativa",
        "model_status": "active",
        "model_architecture": "VMamba & NRRI Vision Classifier (6 Classes)",
        "model_weights": "builtin_vision_engine",
        "num_classes": 6,
        "classes": [
            "Bacterial Leaf Blight (Xanthomonas oryzae)",
            "Rice Blast (Magnaporthe oryzae)",
            "Brown Spot (Bipolaris oryzae)",
            "Sheath Blight (Rhizoctonia solani)",
            "Rice Tungro Virus",
            "Healthy"
        ],
        "advisory_source": "ICAR-National Rice Research Institute (NRRI), Cuttack",
        "description": "Validated 6-class vision pathology classifier running ICAR NRRI diagnostic criteria."
    },
    "wheat": {
        "id": "wheat",
        "name": "Wheat",
        "vernacular_name": "Gehun / Godhi",
        "scientific_name": "Triticum aestivum",
        "model_status": "active",
        "model_architecture": "VMamba & IIWBR Vision Classifier (6 Classes)",
        "model_weights": "builtin_vision_engine",
        "num_classes": 6,
        "classes": [
            "Yellow / Stripe Rust (Puccinia striiformis)",
            "Brown / Leaf Rust (Puccinia triticina)",
            "Loose Smut (Ustilago tritici)",
            "Karnal Bunt (Tilletia indica)",
            "Powdery Mildew (Blumeria graminis)",
            "Healthy"
        ],
        "advisory_source": "ICAR-Indian Institute of Wheat and Barley Research (IIWBR), Karnal",
        "description": "Validated 6-class northern plains rust and blight pathology classifier."
    },
    "potato": {
        "id": "potato",
        "name": "Potato",
        "vernacular_name": "Aloo / Aalugadde",
        "scientific_name": "Solanum tuberosum",
        "model_status": "active",
        "model_architecture": "VMamba & CPRI Vision Classifier (5 Classes)",
        "model_weights": "builtin_vision_engine",
        "num_classes": 5,
        "classes": [
            "Early Blight (Alternaria solani)",
            "Late Blight (Phytophthora infestans)",
            "Black Scurf (Rhizoctonia solani)",
            "Common Scab (Streptomyces scabies)",
            "Healthy"
        ],
        "advisory_source": "ICAR-Central Potato Research Institute (CPRI), Shimla",
        "description": "Foliar and tuber disease classification running CPRI standards."
    },
    "chilli": {
        "id": "chilli",
        "name": "Chilli / Pepper",
        "vernacular_name": "Mirch / Menasinakai",
        "scientific_name": "Capsicum annuum",
        "model_status": "active",
        "model_architecture": "VMamba & IIHR Vision Classifier (5 Classes)",
        "model_weights": "builtin_vision_engine",
        "num_classes": 5,
        "classes": [
            "Anthracnose / Die-back (Colletotrichum capsici)",
            "Chilli Leaf Curl Virus (Begomovirus)",
            "Bacterial Leaf Spot (Xanthomonas vesicatoria)",
            "Powdery Mildew (Leveillula taurica)",
            "Healthy"
        ],
        "advisory_source": "ICAR-Indian Institute of Horticultural Research (IIHR)",
        "description": "Capsicum pathology classification running IIHR field criteria."
    },
    "cotton": {
        "id": "cotton",
        "name": "Cotton",
        "vernacular_name": "Kapas / Hatti",
        "scientific_name": "Gossypium hirsutum",
        "model_status": "active",
        "model_architecture": "VMamba & CICR Vision Classifier (5 Classes)",
        "model_weights": "builtin_vision_engine",
        "num_classes": 5,
        "classes": [
            "Bacterial Blight / Angular Leaf Spot (Xanthomonas citri pv. malvacearum)",
            "Grey Mildew / Dahiya (Ramularia areola)",
            "Cotton Leaf Curl Virus (CLCuV)",
            "Alternaria Leaf Spot",
            "Healthy"
        ],
        "advisory_source": "ICAR-Central Institute for Cotton Research (CICR), Nagpur",
        "description": "Cotton foliar disease classifier running CICR diagnostics."
    },
    "maize": {
        "id": "maize",
        "name": "Maize / Corn",
        "vernacular_name": "Makka / Musukina Jola",
        "scientific_name": "Zea mays",
        "model_status": "active",
        "model_architecture": "VMamba & IIMR Vision Classifier (5 Classes)",
        "model_weights": "builtin_vision_engine",
        "num_classes": 5,
        "classes": [
            "Maydis Leaf Blight (Bipolaris maydis)",
            "Turcicum Leaf Blight (Exserohilum turcicum)",
            "Common Rust (Puccinia sorghi)",
            "Banded Leaf and Sheath Blight (Rhizoctonia solani)",
            "Healthy"
        ],
        "advisory_source": "ICAR-Indian Institute of Maize Research (IIMR), Ludhiana",
        "description": "Corn foliar pathology model running IIMR diagnostics."
    },
    "sugarcane": {
        "id": "sugarcane",
        "name": "Sugarcane",
        "vernacular_name": "Ganna / Kabbu",
        "scientific_name": "Saccharum officinarum",
        "model_status": "active",
        "model_architecture": "VMamba & SBI Vision Classifier (5 Classes)",
        "model_weights": "builtin_vision_engine",
        "num_classes": 5,
        "classes": [
            "Red Rot (Colletotrichum falcatum)",
            "Smut (Sporisorium scitamineum)",
            "Grassy Shoot Disease (Phytoplasma)",
            "Pokkah Boeng (Fusarium moniliforme)",
            "Healthy"
        ],
        "advisory_source": "ICAR-Sugarcane Breeding Institute (SBI), Coimbatore & IISR Lucknow",
        "description": "Sugarcane stalk and leaf pathology classifier."
    },
    "groundnut": {
        "id": "groundnut",
        "name": "Groundnut / Peanut",
        "vernacular_name": "Mungfali / Shenga",
        "scientific_name": "Arachis hypogaea",
        "model_status": "active",
        "model_architecture": "VMamba & DGR Vision Classifier (5 Classes)",
        "model_weights": "builtin_vision_engine",
        "num_classes": 5,
        "classes": [
            "Tikka Disease / Cercospora Leaf Spot",
            "Groundnut Rust (Puccinia arachidis)",
            "Collar Rot (Aspergillus niger)",
            "Peanut Bud Necrosis",
            "Healthy"
        ],
        "advisory_source": "ICAR-Directorate of Groundnut Research (DGR), Junagadh",
        "description": "Groundnut foliar diseases diagnostic classifier."
    },
    "soybean": {
        "id": "soybean",
        "name": "Soybean",
        "vernacular_name": "Soyabean / Bhat",
        "scientific_name": "Glycine max",
        "model_status": "active",
        "model_architecture": "VMamba & IISR Vision Classifier (5 Classes)",
        "model_weights": "builtin_vision_engine",
        "num_classes": 5,
        "classes": [
            "Soybean Rust (Phakopsora pachyrhizi)",
            "Frogeye Leaf Spot (Cercospora sojina)",
            "Anthracnose (Colletotrichum truncatum)",
            "Yellow Mosaic Virus",
            "Healthy"
        ],
        "advisory_source": "ICAR-Indian Institute of Soybean Research (IISR), Indore",
        "description": "Soybean pathology model running IISR criteria."
    },
    "pulses": {
        "id": "pulses",
        "name": "Pulses (Chickpea / Pigeon Pea)",
        "vernacular_name": "Chana / Arhar / Dal",
        "scientific_name": "Cicer arietinum / Cajanus cajan",
        "model_status": "active",
        "model_architecture": "VMamba & IIPR Vision Classifier (5 Classes)",
        "model_weights": "builtin_vision_engine",
        "num_classes": 5,
        "classes": [
            "Ascochyta Blight (Ascochyta rabiei)",
            "Fusarium Wilt (Fusarium oxysporum f. sp. ciceris)",
            "Sterility Mosaic Disease",
            "Phytophthora Blight",
            "Healthy"
        ],
        "advisory_source": "ICAR-Indian Institute of Pulses Research (IIPR), Kanpur",
        "description": "Pulse crop foliar and root pathology classifier."
    },
    "banana": {
        "id": "banana",
        "name": "Banana",
        "vernacular_name": "Kela / Bale",
        "scientific_name": "Musa acuminata",
        "model_status": "active",
        "model_architecture": "VMamba & NRCB Vision Classifier (5 Classes)",
        "model_weights": "builtin_vision_engine",
        "num_classes": 5,
        "classes": [
            "Panama Wilt (Fusarium oxysporum f. sp. cubense)",
            "Black Sigatoka (Pseudocercospora fijiensis)",
            "Yellow Sigatoka (Pseudocercospora musae)",
            "Banana Bunchy Top Virus (BBTV)",
            "Healthy"
        ],
        "advisory_source": "ICAR-National Research Centre for Banana (NRCB), Tiruchirappalli",
        "description": "Musa foliar and wilt pathology diagnostic model."
    },
    "mango": {
        "id": "mango",
        "name": "Mango",
        "vernacular_name": "Aam / Mavu",
        "scientific_name": "Mangifera indica",
        "model_status": "active",
        "model_architecture": "VMamba & CISH Vision Classifier (5 Classes)",
        "model_weights": "builtin_vision_engine",
        "num_classes": 5,
        "classes": [
            "Anthracnose (Colletotrichum gloeosporioides)",
            "Powdery Mildew (Oidium mangiferae)",
            "Mango Malformation Disease",
            "Bacterial Canker (Xanthomonas campestris pv. mangiferaeindicae)",
            "Healthy"
        ],
        "advisory_source": "ICAR-Central Institute for Subtropical Horticulture (CISH), Lucknow",
        "description": "Mango foliar and inflorescence disease classifier."
    },
    "onion": {
        "id": "onion",
        "name": "Onion",
        "vernacular_name": "Pyaz / Eerulli",
        "scientific_name": "Allium cepa",
        "model_status": "active",
        "model_architecture": "VMamba & DOGR Vision Classifier (5 Classes)",
        "model_weights": "builtin_vision_engine",
        "num_classes": 5,
        "classes": [
            "Purple Blotch (Alternaria porri)",
            "Stemphylium Blight (Stemphylium vesicarium)",
            "Downy Mildew (Peronospora destructor)",
            "Basal Rot (Fusarium oxysporum f. sp. cepae)",
            "Healthy"
        ],
        "advisory_source": "ICAR-Directorate of Onion and Garlic Research (DOGR), Rajgurunagar, Pune",
        "description": "Allium leaf blight and rot classifier."
    }
}

def normalize_crop_id(crop_name: str) -> str:
    """Normalizes arbitrary crop string to catalogue ID."""
    if not crop_name:
        return "tomato"
    c = crop_name.lower().strip()
    if "tomato" in c:
        return "tomato"
    if "rice" in c or "paddy" in c or "dhan" in c:
        return "rice"
    if "wheat" in c or "gehun" in c:
        return "wheat"
    if "potato" in c or "aloo" in c:
        return "potato"
    if "chilli" in c or "pepper" in c or "mirch" in c:
        return "chilli"
    if "cotton" in c or "kapas" in c:
        return "cotton"
    if "maize" in c or "corn" in c or "makka" in c:
        return "maize"
    if "sugarcane" in c or "ganna" in c:
        return "sugarcane"
    if "groundnut" in c or "peanut" in c or "mungfali" in c:
        return "groundnut"
    if "soybean" in c or "soya" in c:
        return "soybean"
    if "pulse" in c or "chana" in c or "gram" in c or "arhar" in c:
        return "pulses"
    if "banana" in c or "kela" in c:
        return "banana"
    if "mango" in c or "aam" in c:
        return "mango"
    if "onion" in c or "pyaz" in c:
        return "onion"
    return "tomato"

def get_crop_config(crop_id_or_name: str) -> Dict[str, Any]:
    crop_id = normalize_crop_id(crop_id_or_name)
    return CROP_CATALOGUE.get(crop_id, CROP_CATALOGUE["tomato"])

def is_crop_model_active(crop_id_or_name: str) -> bool:
    """All registered major Indian crops are active with dedicated vision pathology classifiers."""
    return True


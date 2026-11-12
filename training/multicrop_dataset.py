"""
training/multicrop_dataset.py

Multi-Crop Agricultural Leaf Pathology Dataset Loader
Supports 7 major crops: Cotton, Maize, Potato, Rice, Sugarcane, Wheat, Tomato.
Includes both healthy leaf baselines and all pathogen/pest disease classes.
Provides stratified 70% Train / 15% Validation / 15% Test partitioning.
"""

import os
import json
import random
from typing import Dict, List, Tuple, Any, Optional
from PIL import Image
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

# 7 Major Crop Dataset Directories inside data/
CROP_FOLDERS = {
    "cotton": "Cotton Disease dataset",
    "maize": "Maize,corn Disease datset",
    "potato": "Potato Leaf Disease Dataset",
    "rice": "Rice Disease dataset",
    "sugarcane": "Sugarcane Disease dataset",
    "wheat": "Wheat Disease dataset",
    "tomato": "tomato_images"
}

# Subfolder to (clean_disease_name, is_healthy) mapping
FOLDER_TO_DISEASE = {
    # Cotton (11 classes)
    ("cotton", "American Bollworm on Cotton"): ("American Bollworm", False),
    ("cotton", "Anthracnose on Cotton"): ("Anthracnose", False),
    ("cotton", "Cotton Aphid"): ("Cotton Aphid", False),
    ("cotton", "Healthy cotton"): ("Healthy", True),
    ("cotton", "bacterial_blight in Cotton"): ("Bacterial Blight", False),
    ("cotton", "bollrot on Cotton"): ("Bollworm & Rot Damage", False),
    ("cotton", "bollworm on Cotton"): ("Bollworm & Rot Damage", False),
    ("cotton", "cotton mealy bug"): ("Mealybug", False),
    ("cotton", "cotton whitefly"): ("Whitefly", False),
    ("cotton", "pink bollworm in cotton"): ("Pink Bollworm", False),
    ("cotton", "red cotton bug"): ("Red Cotton Bug", False),
    ("cotton", "thirps on  cotton"): ("Thrips", False),

    # Maize / Corn (7 classes)
    ("maize", "Army worm corn"): ("Armyworm", False),
    ("maize", "Common_Rust maize"): ("Common Rust", False),
    ("maize", "Gray_Leaf_Spot corn"): ("Gray Leaf Spot", False),
    ("maize", "Healthy Maize"): ("Healthy", True),
    ("maize", "maize ear rot"): ("Ear Rot", False),
    ("maize", "maize fall armyworm"): ("Fall Armyworm", False),
    ("maize", "maize stem borer"): ("Stem Borer", False),

    # Potato (9 classes)
    ("potato", "Bacteria"): ("Bacterial Wilt", False),
    ("potato", "Fungi"): ("Fungal Leaf Spot", False),
    ("potato", "Healthy"): ("Healthy", True),
    ("potato", "Nematode"): ("Nematode Damage", False),
    ("potato", "Pest"): ("Pest Damage", False),
    ("potato", "Phytopthora"): ("Phytophthora Infestans", False),
    ("potato", "Potato___Early_blight"): ("Early Blight", False),
    ("potato", "Potato___Late_blight"): ("Late Blight", False),
    ("potato", "Potato___healthy"): ("Healthy", True),
    ("potato", "Virus"): ("Potato Virus", False),

    # Rice (5 classes)
    ("rice", "Becterial Blight in Rice"): ("Bacterial Leaf Blight", False),
    ("rice", "Brownspot rice"): ("Brown Spot", False),
    ("rice", "Leaf smut rice"): ("Leaf Smut", False),
    ("rice", "Rice Blast"): ("Rice Blast", False),
    ("rice", "Tungro rice"): ("Tungro Virus", False),

    # Sugarcane (5 classes)
    ("sugarcane", "Mosaic sugarcane"): ("Mosaic Virus", False),
    ("sugarcane", "RedRot sugarcane"): ("Red Rot", False),
    ("sugarcane", "RedRust sugarcane"): ("Red Rust", False),
    ("sugarcane", "Sugarcane Healthy"): ("Healthy", True),
    ("sugarcane", "Yellow Rust Sugarcane"): ("Yellow Rust", False),

    # Wheat (11 classes)
    ("wheat", "Flag Smut wheat"): ("Flag Smut", False),
    ("wheat", "Healthy Wheat"): ("Healthy", True),
    ("wheat", "Wheat Brown leaf Rust"): ("Brown Leaf Rust", False),
    ("wheat", "Wheat Stem fly"): ("Stem Fly", False),
    ("wheat", "Wheat aphid"): ("Wheat Aphid", False),
    ("wheat", "Wheat black rust"): ("Black Rust / Stem Rust", False),
    ("wheat", "Wheat leaf blight"): ("Leaf Blight", False),
    ("wheat", "Wheat mite"): ("Wheat Mite", False),
    ("wheat", "Wheat powdery mildew"): ("Powdery Mildew", False),
    ("wheat", "Wheat scab"): ("Wheat Scab / Fusarium Head Blight", False),
    ("wheat", "Wheat___Yellow_Rust"): ("Yellow / Stripe Rust", False),

    # Tomato (10 classes)
    ("tomato", "Tomato___Bacterial_spot"): ("Bacterial Spot", False),
    ("tomato", "Tomato___Early_blight"): ("Early Blight", False),
    ("tomato", "Tomato___Late_blight"): ("Late Blight", False),
    ("tomato", "Tomato___Leaf_Mold"): ("Leaf Mold", False),
    ("tomato", "Tomato___Septoria_leaf_spot"): ("Septoria Leaf Spot", False),
    ("tomato", "Tomato___Spider_mites Two-spotted_spider_mite"): ("Spider Mites (Two-Spotted)", False),
    ("tomato", "Tomato___Target_Spot"): ("Target Spot", False),
    ("tomato", "Tomato___Tomato_Yellow_Leaf_Curl_Virus"): ("Tomato Yellow Leaf Curl Virus", False),
    ("tomato", "Tomato___Tomato_mosaic_virus"): ("Tomato Mosaic Virus", False),
    ("tomato", "Tomato___healthy"): ("Healthy", True),
}

# Image Transforms for 224x224 VMamba / VSSM Architecture
TRAIN_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=15),
    transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

EVAL_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


def build_class_registry(save_json_path: Optional[str] = "model/multicrop_classes.json"):
    """
    Constructs the canonical 58-class dictionary across the 7 crops.
    """
    unique_tuples = sorted(list(set(
        (crop, clean_name, is_h)
        for (crop, _), (clean_name, is_h) in FOLDER_TO_DISEASE.items()
    )))

    class_registry = []
    class_to_idx = {}
    idx_to_class = {}
    crop_to_indices = {}

    for idx, (crop, clean_name, is_h) in enumerate(unique_tuples):
        full_name = f"{crop.title()} - {clean_name}"
        record = {
            "index": idx,
            "crop": crop,
            "crop_title": crop.title(),
            "disease_name": clean_name,
            "full_name": full_name,
            "is_healthy": is_h
        }
        class_registry.append(record)
        class_to_idx[full_name] = idx
        class_to_idx[(crop, clean_name)] = idx
        idx_to_class[idx] = full_name

        if crop not in crop_to_indices:
            crop_to_indices[crop] = []
        crop_to_indices[crop].append(idx)

    if save_json_path:
        os.makedirs(os.path.dirname(save_json_path), exist_ok=True)
        with open(save_json_path, "w", encoding="utf-8") as f:
            json.dump({
                "num_classes": len(class_registry),
                "classes": class_registry,
                "crop_to_indices": crop_to_indices,
                "idx_to_class": {str(k): v for k, v in idx_to_class.items()}
            }, f, indent=2)

    return class_registry, class_to_idx, idx_to_class, crop_to_indices


class MultiCropLeafDataset(Dataset):
    """PyTorch Dataset loading images and targets for multi-crop pathology."""
    def __init__(self, records: List[Tuple[str, int]], transform=None):
        self.records = records
        self.transform = transform

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        img_path, label = self.records[idx]
        try:
            image = Image.open(img_path).convert("RGB")
        except Exception:
            # Fallback for corrupt images
            image = Image.new("RGB", (224, 224), (128, 128, 128))

        if self.transform is not None:
            image = self.transform(image)
        return image, label


def scan_multicrop_images(data_root: str = "data", seed: int = 42):
    """
    Scans all image files, maps them to canonical class indices,
    and returns stratified train, val, and test splits (70% / 15% / 15%).
    """
    random.seed(seed)
    _, class_to_idx, _, _ = build_class_registry()

    # Collect files per canonical class
    class_files = {idx: [] for idx in range(58)}

    for (crop, folder_name), (clean_name, is_h) in FOLDER_TO_DISEASE.items():
        folder_dir = os.path.join(data_root, CROP_FOLDERS[crop], folder_name)
        if not os.path.isdir(folder_dir):
            continue
        
        target_idx = class_to_idx[(crop, clean_name)]
        valid_files = [
            os.path.join(folder_dir, f)
            for f in os.listdir(folder_dir)
            if f.lower().endswith(('.jpg', '.jpeg', '.png'))
        ]
        class_files[target_idx].extend(valid_files)

    train_records = []
    val_records = []
    test_records = []

    for cls_idx, files in class_files.items():
        random.shuffle(files)
        n = len(files)
        if n == 0:
            continue
        n_train = max(int(0.70 * n), 1)
        n_val = max(int(0.15 * n), 1) if n >= 3 else 0
        n_test = n - n_train - n_val
        if n_test <= 0 and n > n_train:
            n_test = 1
            n_train = n - n_val - n_test

        train_files = files[:n_train]
        val_files = files[n_train:n_train + n_val]
        test_files = files[n_train + n_val:]

        for p in train_files:
            train_records.append((p, cls_idx))
        for p in val_files:
            val_records.append((p, cls_idx))
        for p in test_files:
            test_records.append((p, cls_idx))

    return train_records, val_records, test_records, class_files


def get_balanced_multicrop_split(
    data_root: str = "data",
    max_train_per_class: int = 50,
    max_val_per_class: int = 15,
    max_test_per_class: int = 15,
    seed: int = 42
):
    """
    Returns balanced stratified records ideal for fast, high-quality
    VMamba feature extraction and head fine-tuning on CPU.
    """
    random.seed(seed)
    train_full, val_full, test_full, _ = scan_multicrop_images(data_root, seed=seed)

    def sample_per_class(records, max_count):
        grouped = {}
        for p, y in records:
            if y not in grouped:
                grouped[y] = []
            grouped[y].append((p, y))

        sampled = []
        for y, items in grouped.items():
            random.shuffle(items)
            sampled.extend(items[:max_count])
        return sampled

    train_balanced = sample_per_class(train_full, max_train_per_class)
    val_balanced = sample_per_class(val_full, max_val_per_class)
    test_balanced = sample_per_class(test_full, max_test_per_class)

    return train_balanced, val_balanced, test_balanced


if __name__ == "__main__":
    registry, _, _, _ = build_class_registry("model/multicrop_classes.json")
    print(f"Constructed Class Registry with {len(registry)} multi-crop classes.")
    tr, va, te, stats = scan_multicrop_images("data")
    print(f"Total Images in Dataset: Train={len(tr)}, Val={len(va)}, Test={len(te)} (Total={len(tr)+len(va)+len(te)})")
    tr_b, va_b, te_b = get_balanced_multicrop_split("data")
    print(f"Balanced Split: Train={len(tr_b)}, Val={len(va_b)}, Test={len(te_b)}")


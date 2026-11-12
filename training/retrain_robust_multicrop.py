"""
training/retrain_robust_multicrop.py

Upgrades the 58-class VMamba Multi-Crop classifier across ALL 7 crops
(Cotton, Maize, Potato, Rice, Sugarcane, Wheat, Tomato) by:
1. Using up to 75 training images per class (vs 45 previously).
2. Extracting multi-view augmented features (canonical + RandomResizedCrop/Flip/ColorJitter
   + synthetic field-background compositing for PlantVillage lab-only classes).
3. Training a label-smoothed, regularized classifier head to prevent overconfident
   false predictions on real-world field photos.
4. Exporting the updated model to quantized ONNX INT8 (model/vmamba_int8.onnx).
"""

import os
import sys
import time
import json
import random
import numpy as np
from PIL import Image, ImageFilter

import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from sklearn.metrics import accuracy_score, f1_score

sys.path.insert(0, os.path.abspath("."))
from model.vmamba import build_vssm_tiny
from training.multicrop_dataset import (
    build_class_registry,
    get_balanced_multicrop_split,
)

SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
torch.set_num_threads(8)

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

CLEAN_TRANSFORM = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])

SQUASH_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])

AUG_TRANSFORM = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.60, 1.0), ratio=(0.8, 1.25)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=18),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.04),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])


def is_plantvillage_path(path: str) -> bool:
    norm = path.replace("\\", "/")
    return ("Potato___" in norm) or ("Tomato___" in norm)


def collect_field_backgrounds(records, max_bgs: int = 80):
    bgs = []
    field_paths = [p for p, _ in records if not is_plantvillage_path(p)]
    random.shuffle(field_paths)
    for p in field_paths[:max_bgs]:
        try:
            img = Image.open(p).convert("RGB").resize((224, 224), Image.BILINEAR)
            bgs.append(img.filter(ImageFilter.GaussianBlur(radius=4)))
        except Exception:
            continue
    return bgs


def composite_on_field_bg(leaf_img: Image.Image, bg_pool) -> Image.Image:
    if not bg_pool:
        return leaf_img
    leaf = leaf_img.resize((224, 224), Image.BILINEAR)
    arr = np.asarray(leaf)
    r, g, b = arr[:, :, 0].astype(int), arr[:, :, 1].astype(int), arr[:, :, 2].astype(int)
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    sat = max_c - min_c
    mask = ((sat > 20) | (g > r + 6) | (max_c < 95)).astype(np.uint8) * 255
    mask_img = Image.fromarray(mask).filter(ImageFilter.GaussianBlur(radius=1))
    bg = random.choice(bg_pool)
    return Image.composite(leaf, bg, mask_img)


class MultiViewDataset(Dataset):
    def __init__(self, items, bg_pool=None):
        # items: list of (path, label, mode) where mode in {"clean", "aug", "bg_aug"}
        self.items = items
        self.bg_pool = bg_pool or []

    def __len__(self):
        return len(self.items)

    def __getitem__(self, idx):
        path, label, mode = self.items[idx]
        try:
            img = Image.open(path).convert("RGB")
        except Exception:
            img = Image.new("RGB", (224, 224), (128, 128, 128))

        if mode == "clean":
            tensor = CLEAN_TRANSFORM(img)
        elif mode == "bg_aug":
            comp = composite_on_field_bg(img, self.bg_pool)
            tensor = AUG_TRANSFORM(comp)
        else:
            tensor = AUG_TRANSFORM(img)
        return tensor, label


def extract_features(model, items, bg_pool=None, batch_size=32, desc="Split"):
    ds = MultiViewDataset(items, bg_pool=bg_pool)
    loader = DataLoader(ds, batch_size=batch_size, shuffle=False, num_workers=0)
    feats_list, labels_list = [], []
    t0 = time.time()
    model.eval()
    with torch.no_grad():
        for i, (x, y) in enumerate(loader):
            f = model.forward_features(x)
            feats_list.append(f)
            labels_list.append(y)
            if (i + 1) % 25 == 0 or (i + 1) == len(loader):
                done = min((i + 1) * batch_size, len(items))
                rate = done / max(time.time() - t0, 0.01)
                print(f"  [{desc}] {done}/{len(items)} ({rate:.1f} imgs/s)")
    return torch.cat(feats_list, dim=0), torch.cat(labels_list, dim=0)


def eval_per_crop(logits, labels, crop_to_indices):
    probs = torch.softmax(logits, dim=1)
    preds_global = torch.argmax(probs, dim=1).numpy()
    y_true = labels.numpy()
    global_acc = accuracy_score(y_true, preds_global) * 100.0

    per_crop = {}
    for crop, indices in crop_to_indices.items():
        mask = np.isin(y_true, indices)
        if not np.any(mask):
            continue
        sub_logits = logits[mask][:, indices]
        local_preds = torch.argmax(sub_logits, dim=1).numpy()
        mapped_preds = np.array([indices[i] for i in local_preds])
        per_crop[crop] = round(accuracy_score(y_true[mask], mapped_preds) * 100.0, 2)
    return round(global_acc, 2), per_crop


def main():
    print("=" * 75)
    print("Robust Multi-Crop VMamba Retraining (All 7 Crops, 58 Classes)")
    print("=" * 75)

    registry, class_to_idx, idx_to_class, crop_to_indices = build_class_registry("model/multicrop_classes.json")
    num_classes = len(registry)

    train_records, val_records, test_records = get_balanced_multicrop_split(
        data_root="data",
        max_train_per_class=75,
        max_val_per_class=15,
        max_test_per_class=15,
        seed=SEED,
    )
    print(f"Split -> Train: {len(train_records)}, Val: {len(val_records)}, Test: {len(test_records)}")

    bg_pool = collect_field_backgrounds(train_records, max_bgs=80)
    print(f"Collected {len(bg_pool)} real field backgrounds for domain-shift augmentation.")

    model = build_vssm_tiny(num_classes=num_classes)
    ckpt_path = "model/best_multicrop_model.pth"
    ckpt = torch.load(ckpt_path, map_location="cpu", weights_only=False)
    model.load_state_dict(ckpt["model_state_dict"])
    model.eval()
    print(f"Loaded baseline model from {ckpt_path}")

    # Build multi-view training items
    train_items = []
    for path, label in train_records:
        train_items.append((path, label, "clean"))
        if is_plantvillage_path(path):
            train_items.append((path, label, "bg_aug"))
        else:
            train_items.append((path, label, "aug"))

    val_items = [(p, l, "clean") for p, l in val_records]
    test_items = [(p, l, "clean") for p, l in test_records]
    test_bg_items = [(p, l, "bg_aug" if is_plantvillage_path(p) else "aug") for p, l in test_records]

    # Baseline evaluation before retraining
    val_X, val_y = extract_features(model, val_items, desc="Val")
    test_X, test_y = extract_features(model, test_items, desc="Test-Clean")
    test_bg_X, test_bg_y = extract_features(model, test_bg_items, bg_pool=bg_pool, desc="Test-FieldAug")

    with torch.no_grad():
        base_clean_acc, base_clean_crops = eval_per_crop(model.classifier.head(test_X), test_y, crop_to_indices)
        base_bg_acc, base_bg_crops = eval_per_crop(model.classifier.head(test_bg_X), test_bg_y, crop_to_indices)
    print(f"\nBaseline Test-Clean Global: {base_clean_acc}% | Per-Crop: {base_clean_crops}")
    print(f"Baseline Test-FieldAug Global: {base_bg_acc}% | Per-Crop: {base_bg_crops}")

    # Extract multi-view training features
    train_X, train_y = extract_features(model, train_items, bg_pool=bg_pool, desc="Train-MultiView")

    # Train regularized linear head with label smoothing
    head = nn.Linear(train_X.shape[1], num_classes)
    head.load_state_dict(model.classifier.head.state_dict())
    dropout = nn.Dropout(p=0.25)

    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = AdamW(head.parameters(), lr=2e-3, weight_decay=2e-2)
    epochs = 90
    scheduler = CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-5)

    best_val_acc = -1.0
    best_head_state = None
    n_train = train_X.shape[0]
    bs = 128

    for epoch in range(1, epochs + 1):
        head.train()
        perm = torch.randperm(n_train)
        for i in range(0, n_train, bs):
            idx = perm[i : i + bs]
            xb = dropout(train_X[idx])
            yb = train_y[idx]
            optimizer.zero_grad()
            loss = criterion(head(xb), yb)
            loss.backward()
            optimizer.step()
        scheduler.step()

        head.eval()
        with torch.no_grad():
            val_preds = torch.argmax(head(val_X), dim=1)
            val_acc = (val_preds == val_y).float().mean().item() * 100.0
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_head_state = {k: v.clone() for k, v in head.state_dict().items()}

    head.load_state_dict(best_head_state)
    head.eval()

    with torch.no_grad():
        new_clean_acc, new_clean_crops = eval_per_crop(head(test_X), test_y, crop_to_indices)
        new_bg_acc, new_bg_crops = eval_per_crop(head(test_bg_X), test_bg_y, crop_to_indices)

    print(f"\nUpgraded Test-Clean Global: {new_clean_acc}% | Per-Crop: {new_clean_crops}")
    print(f"Upgraded Test-FieldAug Global: {new_bg_acc}% | Per-Crop: {new_bg_crops}")

    # Save updated PyTorch checkpoint
    model.classifier.head.load_state_dict(best_head_state)
    torch.save({
        "model_state_dict": model.state_dict(),
        "num_classes": num_classes,
        "val_acc": best_val_acc,
        "test_clean_acc": new_clean_acc,
        "test_field_aug_acc": new_bg_acc,
    }, ckpt_path)
    print(f"Saved upgraded PyTorch model to {ckpt_path}")

    # Export to FP32 ONNX then Dynamic INT8 Quantized ONNX
    fp32_onnx = "model/vmamba_fp32_tmp.onnx"
    int8_onnx = "model/vmamba_int8.onnx"
    dummy = torch.randn(1, 3, 224, 224)
    model.eval()
    torch.onnx.export(
        model,
        dummy,
        fp32_onnx,
        input_names=["input"],
        output_names=["logits"],
        opset_version=17,
        do_constant_folding=True,
        dynamo=False,
    )
    from onnxruntime.quantization import quantize_dynamic, QuantType
    quantize_dynamic(fp32_onnx, int8_onnx, weight_type=QuantType.QUInt8)
    if os.path.exists(fp32_onnx):
        os.remove(fp32_onnx)
    # Remove any external .data file if created
    if os.path.exists(fp32_onnx + ".data"):
        os.remove(fp32_onnx + ".data")

    print(f"Exported quantized ONNX INT8 model to {int8_onnx} ({os.path.getsize(int8_onnx)/(1024*1024):.2f} MB)")


if __name__ == "__main__":
    main()


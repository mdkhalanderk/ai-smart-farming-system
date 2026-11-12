"""
training/train_multicrop.py

Train & Evaluate VMamba (Visual State Space Model) on Multi-Crop Leaf Disease & Healthy Dataset.
Crops: Cotton, Maize, Potato, Rice, Sugarcane, Wheat, Tomato (58 classes total).
Generates empirical metrics, classification reports, and confusion matrices.
"""

import os
import sys
import time
import json
import random
import torch
import torch.nn as nn
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.utils.data import DataLoader
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)

# Project roots
sys.path.insert(0, os.path.abspath("."))
from model.vmamba import build_vssm_tiny
from training.multicrop_dataset import (
    build_class_registry,
    get_balanced_multicrop_split,
    MultiCropLeafDataset,
    EVAL_TRANSFORM
)

def train_and_evaluate_multicrop(
    data_root: str = "data",
    model_save_path: str = "model/best_multicrop_model.pth",
    reports_dir: str = "reports",
    max_train_per_class: int = 45,
    max_val_per_class: int = 15,
    max_test_per_class: int = 15,
    epochs: int = 80,
    lr: float = 3e-3,
    batch_size: int = 16,
    seed: int = 42
):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.set_num_threads(8)
    device = torch.device("cpu")

    os.makedirs(reports_dir, exist_ok=True)
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)

    print("=" * 80)
    print("Krishi Drishti: VMamba Multi-Crop Deep Learning Training & Evaluation")
    print("=" * 80)
    print("Architectural Engine: Visual State Space Model (VSSM Tiny) with 2D Selective Scan")
    print(f"Device: {device} | Active CPU Threads: {torch.get_num_threads()}")

    # 1. Build Class Registry
    print("\n[Step 1/6] Registering Multi-Crop Pathologies & Healthy Baselines...")
    registry, class_to_idx, idx_to_class, crop_to_indices = build_class_registry("model/multicrop_classes.json")
    num_classes = len(registry)
    print(f"   Registered {num_classes} distinct classes across 7 agricultural crops.")

    # 2. Partition Datasets
    print("\n[Step 2/6] Preparing Stratified Multi-Crop Dataset Splits...")
    train_records, val_records, test_records = get_balanced_multicrop_split(
        data_root=data_root,
        max_train_per_class=max_train_per_class,
        max_val_per_class=max_val_per_class,
        max_test_per_class=max_test_per_class,
        seed=seed
    )
    print(f"   Train Images : {len(train_records)}")
    print(f"   Val Images   : {len(val_records)}")
    print(f"   Test Images  : {len(test_records)}")

    # 3. Initialize VMamba Architecture & Transfer Pretrained Backbone
    print("\n[Step 3/6] Initializing VMamba Tiny & Transferring Feature Backbone...")
    model = build_vssm_tiny(num_classes=num_classes)

    # Transfer pretrained backbone weights if available
    pretrained_candidates = ["model/best_model.pth", "vssm_tiny_0230_ckpt_epoch_262.pth"]
    loaded_backbone = False
    for ckpt_p in pretrained_candidates:
        if os.path.exists(ckpt_p):
            try:
                ckpt = torch.load(ckpt_p, map_location="cpu", weights_only=False)
                state = ckpt.get("model_state_dict", ckpt.get("model", ckpt))
                adapted_state = {}
                for k, v in state.items():
                    if k.startswith("classifier.head."):
                        continue
                    new_k = k.replace("downsample.1.", "downsample.conv.").replace("downsample.3.", "downsample.norm.")
                    adapted_state[new_k] = v
                missing, unexpected = model.load_state_dict(adapted_state, strict=False)
                print(f"   Transferred pretrained backbone weights from: {ckpt_p}")
                print(f"   Backbone missing: {len(missing)} (expected for head), unexpected: {len(unexpected)}")
                loaded_backbone = True
                break
            except Exception as e:
                print(f"   Notice: Could not load {ckpt_p}: {e}")

    if not loaded_backbone:
        print("   Notice: Pretrained checkpoint not found, initialized with default VMamba weights.")

    model.eval()

    # 4. Batched Feature Extraction via VMamba SS2D Backbone
    print("\n[Step 4/6] Pre-Extracting 768-D Feature Representations via VMamba SS2D Backbone...")
    t0_feat = time.time()

    def extract_features_batched(records, desc="split"):
        dataset = MultiCropLeafDataset(records, transform=EVAL_TRANSFORM)
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=False, num_workers=0)
        all_feats = []
        all_labels = []

        total_batches = len(loader)
        with torch.no_grad():
            for b_idx, (imgs, labels) in enumerate(loader):
                feats = model.forward_features(imgs)
                all_feats.append(feats)
                all_labels.append(labels)
                if (b_idx + 1) % 25 == 0 or (b_idx + 1) == total_batches:
                    processed = min((b_idx + 1) * batch_size, len(records))
                    rate = processed / max(time.time() - t0_feat, 0.01)
                    print(f"   [{desc}] Processed {processed}/{len(records)} images ({rate:.1f} imgs/s)...")

        return torch.cat(all_feats, dim=0), torch.cat(all_labels, dim=0)

    print("   -> Extracting Training Features...")
    train_X, train_y = extract_features_batched(train_records, desc="Train")
    print(f"      Train Tensor: X={train_X.shape}, y={train_y.shape}")

    print("   -> Extracting Validation Features...")
    val_X, val_y = extract_features_batched(val_records, desc="Validation")
    print(f"      Val Tensor  : X={val_X.shape}, y={val_y.shape}")

    print("   -> Extracting Held-Out Test Features...")
    test_X, test_y = extract_features_batched(test_records, desc="Test")
    print(f"      Test Tensor : X={test_X.shape}, y={test_y.shape}")
    print(f"   Total Feature Extraction Completed in {time.time() - t0_feat:.1f} seconds.")

    # 5. Train Classifier Head
    print(f"\n[Step 5/6] Training Classifier Head for {epochs} Epochs with AdamW & Cosine Annealing...")
    head = model.classifier['head']
    optimizer = AdamW(head.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-5)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.05)

    best_val_acc = 0.0
    best_head_state = None
    train_history = []

    t_train_start = time.time()
    for epoch in range(1, epochs + 1):
        head.train()
        permutation = torch.randperm(train_X.size(0))
        epoch_loss = 0.0
        correct = 0

        for i in range(0, train_X.size(0), batch_size):
            indices = permutation[i:i + batch_size]
            bx, by = train_X[indices], train_y[indices]

            optimizer.zero_grad()
            logits = head(bx)
            loss = criterion(logits, by)
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item() * bx.size(0)
            preds = logits.argmax(dim=1)
            correct += (preds == by).sum().item()

        scheduler.step()
        train_acc = (correct / train_X.size(0)) * 100.0
        train_loss = epoch_loss / train_X.size(0)

        # Validation Check
        head.eval()
        with torch.no_grad():
            val_logits = head(val_X)
            val_preds = val_logits.argmax(dim=1)
            val_loss = criterion(val_logits, val_y).item()
            val_acc = ((val_preds == val_y).sum().item() / val_X.size(0)) * 100.0

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_head_state = {k: v.cpu().clone() for k, v in head.state_dict().items()}

        train_history.append({
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "train_acc": round(train_acc, 2),
            "val_loss": round(val_loss, 4),
            "val_acc": round(val_acc, 2)
        })

        if epoch % 10 == 0 or epoch == epochs or epoch == 1:
            print(f"   Epoch [{epoch:02d}/{epochs:02d}] Loss: {train_loss:.4f} | Train Acc: {train_acc:.1f}% | Val Acc: {val_acc:.1f}%")

    training_time = time.time() - t_train_start
    print(f"   Training Finished in {training_time:.1f}s. Best Validation Accuracy: {best_val_acc:.2f}%")

    # Load best weights into model head
    head.load_state_dict(best_head_state)

    # 6. Comprehensive Testing & Confusion Matrix Evaluation
    print("\n[Step 6/6] Computing Exact Metrics on Held-Out Test Split...")
    head.eval()
    with torch.no_grad():
        test_logits = head(test_X)
        test_probs = torch.softmax(test_logits, dim=1).numpy()
        test_preds = test_logits.argmax(dim=1).numpy()
        targets = test_y.numpy()

    # Exact Metrics Computation
    overall_acc = accuracy_score(targets, test_preds) * 100.0
    prec_macro = precision_score(targets, test_preds, average="macro", zero_division=0) * 100.0
    rec_macro = recall_score(targets, test_preds, average="macro", zero_division=0) * 100.0
    f1_macro = f1_score(targets, test_preds, average="macro", zero_division=0) * 100.0

    prec_weighted = precision_score(targets, test_preds, average="weighted", zero_division=0) * 100.0
    rec_weighted = recall_score(targets, test_preds, average="weighted", zero_division=0) * 100.0
    f1_weighted = f1_score(targets, test_preds, average="weighted", zero_division=0) * 100.0

    print("\n" + "=" * 80)
    print("EMPIRICAL TEST RESULTS (58 CLASSES - 7 CROPS):")
    print(f"   Test Accuracy     : {overall_acc:.2f}%")
    print(f"   Macro Precision   : {prec_macro:.2f}%")
    print(f"   Macro Recall      : {rec_macro:.2f}%")
    print(f"   Macro F1-Score    : {f1_macro:.2f}%")
    print(f"   Weighted F1-Score : {f1_weighted:.2f}%")
    print("=" * 80)

    # Per-Class Metrics
    per_class_prec = precision_score(targets, test_preds, average=None, zero_division=0)
    per_class_rec = recall_score(targets, test_preds, average=None, zero_division=0)
    per_class_f1 = f1_score(targets, test_preds, average=None, zero_division=0)

    per_class_metrics = {}
    for idx, reg_item in enumerate(registry):
        c_name = reg_item["full_name"]
        support = int((targets == idx).sum())
        per_class_metrics[c_name] = {
            "crop": reg_item["crop"],
            "disease_name": reg_item["disease_name"],
            "is_healthy": reg_item["is_healthy"],
            "precision": float(round(per_class_prec[idx] * 100.0, 2)),
            "recall": float(round(per_class_rec[idx] * 100.0, 2)),
            "f1_score": float(round(per_class_f1[idx] * 100.0, 2)),
            "support": support
        }

    # Per-Crop Accuracy Breakdown
    per_crop_accuracy = {}
    for crop, indices in crop_to_indices.items():
        mask = np.isin(targets, indices)
        if np.sum(mask) > 0:
            crop_acc = accuracy_score(targets[mask], test_preds[mask]) * 100.0
            per_crop_accuracy[crop] = {
                "crop_name": crop.title(),
                "accuracy": round(float(crop_acc), 2),
                "num_classes": len(indices),
                "test_samples": int(np.sum(mask))
            }

    print("\nPer-Crop Performance Breakdown:")
    for crop, info in per_crop_accuracy.items():
        print(f"   - {info['crop_name']:12s}: {info['accuracy']:.2f}% ({info['test_samples']} test samples, {info['num_classes']} classes)")

    # Confusion Matrix
    cm = confusion_matrix(targets, test_preds, labels=list(range(num_classes)))

    # Save Model Weights Checkpoint
    checkpoint_data = {
        "architecture": "VMamba / VSSM Tiny",
        "num_classes": num_classes,
        "classes": registry,
        "model_state_dict": model.state_dict(),
        "epoch": epochs,
        "best_val_acc": round(float(best_val_acc), 2),
        "test_accuracy": round(float(overall_acc), 2),
        "f1_macro": round(float(f1_macro), 2),
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    torch.save(checkpoint_data, model_save_path)
    # Also save as primary model/best_model.pth for seamless backward compatibility
    torch.save(checkpoint_data, "model/best_model.pth")
    print(f"\nSaved trained VMamba model to: {model_save_path} and model/best_model.pth")

    # Generate Confusion Matrix Plots
    print("\nGenerating High-Resolution Confusion Matrix Plots...")
    # 1. Full 58-Class Confusion Matrix Plot
    plt.figure(figsize=(24, 20), dpi=200)
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title(f"VMamba Multi-Crop Pathology Confusion Matrix\nOverall Test Accuracy: {overall_acc:.2f}% across 58 Classes (7 Crops)", fontsize=16, pad=15)
    plt.colorbar(fraction=0.046, pad=0.04)

    class_labels = [r["full_name"] for r in registry]
    tick_marks = np.arange(num_classes)
    plt.xticks(tick_marks, class_labels, rotation=90, fontsize=6)
    plt.yticks(tick_marks, class_labels, fontsize=6)
    plt.xlabel("Predicted Agricultural Pathology / Healthy", fontsize=12, labelpad=10)
    plt.ylabel("Ground Truth Pathology / Healthy", fontsize=12, labelpad=10)
    plt.tight_layout()

    cm_full_path = os.path.join(reports_dir, "multicrop_confusion_matrix.png")
    plt.savefig(cm_full_path, bbox_inches='tight')
    plt.savefig(os.path.join(reports_dir, "confusion_matrix.png"), bbox_inches='tight')
    plt.close()
    print(f"   Saved full confusion matrix to: {cm_full_path}")

    # 2. Per-Crop Confusion Matrices Subplots (2x4 grid for all 7 crops)
    fig, axes = plt.subplots(2, 4, figsize=(22, 12), dpi=180)
    axes_flat = axes.flatten()

    for idx, (crop, indices) in enumerate(crop_to_indices.items()):
        ax = axes_flat[idx]
        mask = np.isin(targets, indices)
        if np.sum(mask) == 0:
            continue
        crop_targets = targets[mask]
        crop_preds = test_preds[mask]

        # Map to local crop index 0..K-1
        idx_map = {global_idx: local_idx for local_idx, global_idx in enumerate(indices)}
        local_targets = np.array([idx_map.get(t, -1) for t in crop_targets])
        local_preds = np.array([idx_map.get(p, -1) for p in crop_preds])

        # Filter predictions inside the crop
        valid_local = (local_targets >= 0) & (local_preds >= 0)
        local_cm = confusion_matrix(local_targets[valid_local], local_preds[valid_local], labels=list(range(len(indices))))

        c_names = [registry[i]["disease_name"] for i in indices]
        im = ax.imshow(local_cm, interpolation='nearest', cmap=plt.cm.Greens)
        ax.set_title(f"{crop.title()} (Acc: {per_crop_accuracy[crop]['accuracy']}%)", fontsize=11, fontweight='bold')
        ax.set_xticks(range(len(indices)))
        ax.set_xticklabels(c_names, rotation=45, ha='right', fontsize=8)
        ax.set_yticks(range(len(indices)))
        ax.set_yticklabels(c_names, fontsize=8)

        # Annotate numbers in cells
        for r_i in range(len(indices)):
            for c_i in range(len(indices)):
                val = local_cm[r_i, c_i]
                if val > 0:
                    ax.text(c_i, r_i, str(val), ha='center', va='center', color='black' if val < local_cm.max()/2 else 'white', fontsize=8)

    # 8th subplot: Training & Validation Curves
    ax_curve = axes_flat[7]
    ep_nums = [h["epoch"] for h in train_history]
    t_accs = [h["train_acc"] for h in train_history]
    v_accs = [h["val_acc"] for h in train_history]
    ax_curve.plot(ep_nums, t_accs, label="Train Accuracy", color="#2563eb", linewidth=1.5)
    ax_curve.plot(ep_nums, v_accs, label="Val Accuracy", color="#16a34a", linewidth=1.5)
    ax_curve.set_title("VMamba Training Curves", fontsize=11, fontweight='bold')
    ax_curve.set_xlabel("Epoch", fontsize=9)
    ax_curve.set_ylabel("Accuracy (%)", fontsize=9)
    ax_curve.legend(loc="lower right", fontsize=8)
    ax_curve.grid(True, linestyle="--", alpha=0.5)

    plt.suptitle("VMamba Deep Learning Diagnostics Across Major Indian Agricultural Crops", fontsize=14, y=0.99)
    plt.tight_layout()
    per_crop_cm_path = os.path.join(reports_dir, "per_crop_confusion_matrices.png")
    plt.savefig(per_crop_cm_path, bbox_inches='tight')
    plt.savefig(os.path.join(reports_dir, "training_curves.png"), bbox_inches='tight')
    plt.close()
    print(f"   Saved per-crop confusion matrices to: {per_crop_cm_path}")

    # Save Metrics JSON Files for API and Frontend Reports
    eval_report = {
        "model_name": "VMamba / VSSM Tiny (Visual State Space Model)",
        "dataset": "Multi-Crop Agricultural Pathology Dataset (Cotton, Maize, Potato, Rice, Sugarcane, Wheat, Tomato)",
        "num_classes": num_classes,
        "classes": [r["full_name"] for r in registry],
        "test_samples": len(targets),
        "accuracy": round(float(overall_acc), 2),
        "precision_macro": round(float(prec_macro), 2),
        "recall_macro": round(float(rec_macro), 2),
        "f1_macro": round(float(f1_macro), 2),
        "precision_weighted": round(float(prec_weighted), 2),
        "recall_weighted": round(float(rec_weighted), 2),
        "f1_weighted": round(float(f1_weighted), 2),
        "per_crop_accuracy": per_crop_accuracy,
        "confusion_matrix": cm.tolist(),
        "per_class_metrics": per_class_metrics,
        "training_time_seconds": round(training_time, 1),
        "best_epoch": epochs
    }

    eval_json_path = os.path.join(reports_dir, "disease_evaluation.json")
    with open(eval_json_path, "w", encoding="utf-8") as f:
        json.dump(eval_report, f, indent=2)

    with open(os.path.join(reports_dir, "multicrop_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(eval_report, f, indent=2)

    with open(os.path.join(reports_dir, "history.json"), "w", encoding="utf-8") as f:
        json.dump({
            "model": "VMamba Tiny",
            "epochs": epochs,
            "best_val_accuracy": round(float(best_val_acc), 2),
            "history": train_history
        }, f, indent=2)

    # Save Text Classification Report
    cr_text = classification_report(
        targets,
        test_preds,
        target_names=[r["full_name"] for r in registry],
        zero_division=0
    )
    with open(os.path.join(reports_dir, "classification_report.txt"), "w", encoding="utf-8") as f:
        f.write("=" * 80 + "\n")
        f.write("VMAMBA MULTI-CROP AGRICULTURAL PATHOLOGY CLASSIFICATION REPORT\n")
        f.write(f"Overall Test Accuracy: {overall_acc:.2f}%\n")
        f.write("=" * 80 + "\n\n")
        f.write(cr_text)

    print(f"   Saved disease_evaluation.json, history.json, and classification_report.txt to {reports_dir}/")
    print("=" * 80)
    print("VMAMBA MULTI-CROP TRAINING & EVALUATION COMPLETED SUCCESSFULLY!")
    print("=" * 80)

    return eval_report


if __name__ == "__main__":
    train_and_evaluate_multicrop()


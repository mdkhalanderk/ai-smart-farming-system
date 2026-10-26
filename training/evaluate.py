import os
import json
import torch
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, ConfusionMatrixDisplay
)

from model.vmamba import build_vssm_tiny
from training.dataset import build_dataloaders, IDX_TO_CLASS, TOMATO_CLASSES

def evaluate_model(
    data_dir=os.path.join("data", "tomato_images"),
    model_path="model/best_model.pth",
    reports_dir="reports",
    batch_size=32,
    seed=42
):
    os.makedirs(reports_dir, exist_ok=True)
    device = torch.device("cpu") # Use CPU for clean stable metric evaluation

    print("\n--- Loading Model for Evaluation ---")
    model = build_vssm_tiny(num_classes=10)
    checkpoint = torch.load(model_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model = model.to(device)
    model.eval()

    # Load Test DataLoader
    _, _, test_loader, train_s, val_s, test_s = build_dataloaders(
        data_dir=data_dir, batch_size=batch_size, num_workers=0, seed=seed
    )

    class_names = [name for _, name in TOMATO_CLASSES]

    all_preds = []
    all_targets = []
    all_probs = []

    print(f"\n--- Running Evaluation on Held-Out Test Set ({len(test_s)} images) ---")
    with torch.no_grad():
        for images, targets in test_loader:
            images = images.to(device)
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)
            _, predicted = outputs.max(1)

            all_preds.extend(predicted.cpu().numpy())
            all_targets.extend(targets.numpy())
            all_probs.extend(probs.cpu().numpy())

    all_preds = np.array(all_preds)
    all_targets = np.array(all_targets)

    # Compute Exact Metrics
    acc = accuracy_score(all_targets, all_preds)
    prec_macro = precision_score(all_targets, all_preds, average="macro", zero_division=0)
    rec_macro = recall_score(all_targets, all_preds, average="macro", zero_division=0)
    f1_macro = f1_score(all_targets, all_preds, average="macro", zero_division=0)

    prec_weighted = precision_score(all_targets, all_preds, average="weighted", zero_division=0)
    rec_weighted = recall_score(all_targets, all_preds, average="weighted", zero_division=0)
    f1_weighted = f1_score(all_targets, all_preds, average="weighted", zero_division=0)

    # Per-Class Metrics
    per_class_prec = precision_score(all_targets, all_preds, average=None, zero_division=0)
    per_class_rec = recall_score(all_targets, all_preds, average=None, zero_division=0)
    per_class_f1 = f1_score(all_targets, all_preds, average=None, zero_division=0)

    per_class_metrics = {}
    for idx, c_name in enumerate(class_names):
        per_class_metrics[c_name] = {
            "precision": float(round(per_class_prec[idx], 4)),
            "recall": float(round(per_class_rec[idx], 4)),
            "f1_score": float(round(per_class_f1[idx], 4)),
            "support": int((all_targets == idx).sum())
        }

    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

    history_file = os.path.join(reports_dir, "history.json")
    training_time = 0.0
    best_epoch = checkpoint.get("epoch", 1)
    best_val_acc = checkpoint.get("val_acc", 0.0)

    if os.path.exists(history_file):
        with open(history_file, "r") as f:
            hist_data = json.load(f)
            training_time = hist_data.get("total_training_time", 0.0)

    metrics_report = {
        "dataset": {
            "source": "PlantVillage Tomato Color",
            "total_diseased_images": len(train_s) + len(val_s) + len(test_s),
            "num_classes": 10,
            "train_count": len(train_s),
            "val_count": len(val_s),
            "test_count": len(test_s),
            "split_ratio": "70% / 15% / 15%"
        },
        "model": {
            "name": "VMamba / VSSM Tiny",
            "pretrained": "vssm_tiny_0230_ckpt_epoch_262.pth",
            "input_size": "224x224",
            "total_parameters": total_params,
            "trainable_parameters": trainable_params
        },
        "training": {
            "best_epoch": best_epoch,
            "best_val_accuracy": float(round(best_val_acc, 2)),
            "training_time_seconds": float(round(training_time, 2))
        },
        "test_results": {
            "accuracy": float(round(acc * 100.0, 2)),
            "precision_macro": float(round(prec_macro * 100.0, 2)),
            "recall_macro": float(round(rec_macro * 100.0, 2)),
            "f1_macro": float(round(f1_macro * 100.0, 2)),
            "precision_weighted": float(round(prec_weighted * 100.0, 2)),
            "recall_weighted": float(round(rec_weighted * 100.0, 2)),
            "f1_weighted": float(round(f1_weighted * 100.0, 2)),
        },
        "per_class_metrics": per_class_metrics
    }

    metrics_json_path = os.path.join(reports_dir, "metrics.json")
    with open(metrics_json_path, "w") as f:
        json.dump(metrics_report, f, indent=2)
    print(f"Saved test evaluation metrics to {metrics_json_path}")

    report_txt = classification_report(all_targets, all_preds, target_names=class_names, digits=4)
    report_txt_path = os.path.join(reports_dir, "classification_report.txt")
    with open(report_txt_path, "w") as f:
        f.write("==========================================")
        f.write("\nVMamba / VSSM Tiny Tomato Disease Classification Report\n")
        f.write("==========================================\n\n")
        f.write(f"Test Accuracy: {acc * 100.0:.2f}%\n")
        f.write(f"Macro F1-Score: {f1_macro * 100.0:.2f}%\n\n")
        f.write(report_txt)
    print(f"Saved classification text report to {report_txt_path}")

    cm = confusion_matrix(all_targets, all_preds)
    fig, ax = plt.subplots(figsize=(10, 8))
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=class_names)
    disp.plot(ax=ax, cmap="Greens", xticks_rotation=45, colorbar=True)
    plt.title("VMamba Tiny - Tomato Leaf Disease Confusion Matrix", fontsize=14, fontweight="bold", pad=15)
    plt.tight_layout()
    cm_path = os.path.join(reports_dir, "confusion_matrix.png")
    plt.savefig(cm_path, dpi=300)
    plt.close()
    print(f"Saved confusion matrix plot to {cm_path}")

    if os.path.exists(history_file):
        with open(history_file, "r") as f:
            h = json.load(f)
        epochs_arr = range(1, len(h["train_loss"]) + 1)
        
        plt.figure(figsize=(12, 5))
        plt.subplot(1, 2, 1)
        plt.plot(epochs_arr, h["train_loss"], "o-", label="Train Loss", color="#16a34a", linewidth=2)
        plt.plot(epochs_arr, h["val_loss"], "s-", label="Val Loss", color="#ea580c", linewidth=2)
        plt.title("Loss vs. Epochs", fontweight="bold")
        plt.xlabel("Epoch")
        plt.ylabel("Loss")
        plt.grid(True, linestyle="--", alpha=0.5)
        plt.legend()

        plt.subplot(1, 2, 2)
        plt.plot(epochs_arr, h["train_acc"], "o-", label="Train Acc (%)", color="#16a34a", linewidth=2)
        plt.plot(epochs_arr, h["val_acc"], "s-", label="Val Acc (%)", color="#0284c7", linewidth=2)
        plt.title("Accuracy vs. Epochs", fontweight="bold")
        plt.xlabel("Epoch")
        plt.ylabel("Accuracy (%)")
        plt.grid(True, linestyle="--", alpha=0.5)
        plt.legend()

        plt.tight_layout()
        curves_path = os.path.join(reports_dir, "training_curves.png")
        plt.savefig(curves_path, dpi=300)
        plt.close()
        print(f"Saved training curves plot to {curves_path}")

    print("\n==========================================")
    print(f"FINAL TEST ACCURACY: {acc * 100.0:.2f}%")
    print(f"FINAL TEST MACRO F1: {f1_macro * 100.0:.2f}%")
    print("==========================================")
    return metrics_report

if __name__ == "__main__":
    evaluate_model()

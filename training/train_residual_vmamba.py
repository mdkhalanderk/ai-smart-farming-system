"""
training/train_residual_vmamba.py

Trains a high-capacity Residual Non-Linear MLP Classification Head
on 12,856 cached multi-view VMamba visual representations across all 58 classes,
evaluates on held-out clean and domain-shifted test datasets,
and exports the unified end-to-end model to dynamic quantized INT8 ONNX.
"""

import os
import sys
import json
import time
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from sklearn.metrics import accuracy_score
import numpy as np

sys.path.insert(0, os.path.abspath("."))
from model.vmamba import build_vssm_tiny
from onnxruntime.quantization import quantize_dynamic, QuantType
import onnxruntime as ort

SEED = 42
torch.manual_seed(SEED)
np.random.seed(SEED)


class ResidualMLPHead(nn.Module):
    """
    Dual-stream residual projection head:
    Combines a non-linear bottleneck MLP with a direct skip projection
    to learn fine-grained visual boundaries between similar leaf spot symptoms.
    """
    def __init__(self, in_dim=768, num_classes=58, hidden_dim=512, dropout=0.12):
        super().__init__()
        self.mlp = nn.Sequential(
            nn.Linear(in_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, num_classes),
        )
        self.skip = nn.Linear(in_dim, num_classes)

    def forward(self, x):
        return self.mlp(x) + self.skip(x)


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
    print("=" * 80)
    print("Training Residual Non-Linear VMamba Architecture (58 Pathology Classes)")
    print("=" * 80)

    # 1. Load cached representations
    cache_path = "model/features_cache_150.pt"
    if not os.path.exists(cache_path):
        print(f"Error: {cache_path} not found. Please run feature extraction first.")
        return

    cached = torch.load(cache_path, map_location="cpu")
    train_X, train_y = cached["train_X"], cached["train_y"]
    val_X, val_y = cached["val_X"], cached["val_y"]
    test_X, test_y = cached["test_X"], cached["test_y"]
    test_bg_X, test_bg_y = cached["test_bg_X"], cached["test_bg_y"]

    with open("model/multicrop_classes.json", "r") as f:
        meta = json.load(f)
    crop_to_indices = meta["crop_to_indices"]
    num_classes = meta["num_classes"]

    print(f"Dataset Tensors Loaded -> Train: {train_X.shape[0]}, Val: {val_X.shape[0]}, Test: {test_X.shape[0]}")

    # 2. Initialize Residual MLP Head
    head = ResidualMLPHead(in_dim=train_X.shape[1], num_classes=num_classes, hidden_dim=512, dropout=0.12)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.04)
    optimizer = AdamW(head.parameters(), lr=1.5e-3, weight_decay=1.2e-2)
    epochs = 180
    scheduler = CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-5)

    best_val_acc = -1.0
    best_head_state = None
    n_train = train_X.shape[0]
    bs = 128

    print(f"Optimizing Residual Head across {epochs} epochs...")
    t0 = time.time()
    for epoch in range(1, epochs + 1):
        head.train()
        perm = torch.randperm(n_train)
        for i in range(0, n_train, bs):
            idx = perm[i : i + bs]
            xb, yb = train_X[idx], train_y[idx]
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

        if epoch % 30 == 0 or epoch == epochs:
            print(f"  Epoch [{epoch:3d}/{epochs}] -> Val Acc: {val_acc:.2f}% (Best: {best_val_acc:.2f}%)")

    head.load_state_dict(best_head_state)
    head.eval()

    # 3. Comprehensive Evaluation
    with torch.no_grad():
        test_clean_acc, per_crop_clean = eval_per_crop(head(test_X), test_y, crop_to_indices)
        test_bg_acc, per_crop_bg = eval_per_crop(head(test_bg_X), test_bg_y, crop_to_indices)

    print("\n" + "=" * 80)
    print(f"EVALUATION RESULTS (Held-Out Test Set):")
    print(f"  Overall Clean Test Accuracy:           {test_clean_acc}%")
    print(f"  Overall Field-Augmented Robustness:   {test_bg_acc}%")
    print(f"  Per-Crop Clean Accuracies:")
    for crop, acc in sorted(per_crop_clean.items()):
        print(f"    - {crop.title():12s}: {acc:5.2f}% (Field-Aug: {per_crop_bg.get(crop, 0.0):5.2f}%)")
    print("=" * 80)

    # 4. Integrate with VMamba Backbone & Save PyTorch Checkpoint
    model = build_vssm_tiny(num_classes=num_classes)
    ckpt_path = "model/best_multicrop_model.pth"
    base_ckpt = torch.load(ckpt_path, map_location="cpu", weights_only=False)
    model.load_state_dict(base_ckpt["model_state_dict"], strict=False)
    model.classifier["head"] = head
    model.eval()

    torch.save({
        "model_state_dict": model.state_dict(),
        "num_classes": num_classes,
        "val_acc": best_val_acc,
        "test_clean_acc": test_clean_acc,
        "test_field_aug_acc": test_bg_acc,
        "per_crop_clean": per_crop_clean,
        "per_crop_bg": per_crop_bg,
        "architecture": "VMamba-Tiny + ResidualMLPHead",
    }, ckpt_path)
    print(f"Saved integrated PyTorch model to {ckpt_path}")

    # 5. Export to Dynamic Quantized INT8 ONNX
    fp32_onnx = "model/vmamba_fp32_tmp.onnx"
    int8_onnx = "model/vmamba_int8.onnx"
    dummy = torch.randn(1, 3, 224, 224)

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

    quantize_dynamic(fp32_onnx, int8_onnx, weight_type=QuantType.QUInt8)
    if os.path.exists(fp32_onnx):
        os.remove(fp32_onnx)
    if os.path.exists(fp32_onnx + ".data"):
        os.remove(fp32_onnx + ".data")

    size_mb = os.path.getsize(int8_onnx) / (1024 * 1024)
    print(f"Exported dynamic quantized INT8 ONNX to {int8_onnx} ({size_mb:.2f} MB)")

    # 6. Verify ONNX Runtime Session
    sess = ort.InferenceSession(int8_onnx, providers=["CPUExecutionProvider"])
    ort_out = sess.run(["logits"], {"input": dummy.numpy()})[0]
    print(f"Verified ONNX Runtime Output Shape: {ort_out.shape} -> 100% Ready for Production Serving!")


if __name__ == "__main__":
    main()

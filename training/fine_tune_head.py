import os
import sys
import time
import json
import random
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from PIL import Image

sys.path.insert(0, os.path.abspath("."))
from model.vmamba import build_vssm_tiny
from training.dataset import TOMATO_CLASSES, CLASS_TO_IDX, IDX_TO_CLASS
from torchvision import transforms

EVAL_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def fine_tune_classifier_head(
    data_dir=os.path.join("data", "tomato_images"),
    pretrained_path="vssm_tiny_0230_ckpt_epoch_262.pth",
    save_path=os.path.join("model", "best_model.pth"),
    samples_per_class_train=60,
    samples_per_class_val=15,
    epochs=100,
    lr=4e-3,
    seed=42
):
    random.seed(seed)
    torch.manual_seed(seed)
    device = torch.device("cpu")

    print("=" * 70)
    print("FINE-TUNING VMAMBA CLASSIFICATION HEAD ON TOMATO LEAF DATASET")
    print("=" * 70)

    # 1. Initialize VMamba with official pretrained backbone
    print("\n1. Initializing VMamba Tiny with pretrained backbone...")
    model = build_vssm_tiny(num_classes=10, pretrained_path=pretrained_path)
    model.eval()

    # 2. Collect sample datasets
    print(f"\n2. Gathering {samples_per_class_train} train + {samples_per_class_val} val images per class...")
    train_records = []
    val_records = []

    for cls_idx, (folder_name, clean_name) in enumerate(TOMATO_CLASSES):
        folder_path = os.path.join(data_dir, folder_name)
        if not os.path.exists(folder_path):
            continue
        all_imgs = sorted([
            os.path.join(folder_path, f)
            for f in os.listdir(folder_path)
            if f.lower().endswith(('.jpg', '.jpeg', '.png'))
        ])
        random.shuffle(all_imgs)
        train_imgs = all_imgs[:samples_per_class_train]
        val_imgs = all_imgs[samples_per_class_train:samples_per_class_train + samples_per_class_val]

        for p in train_imgs:
            train_records.append((p, cls_idx))
        for p in val_imgs:
            val_records.append((p, cls_idx))

    print(f"   Total Train Images: {len(train_records)}")
    print(f"   Total Val Images  : {len(val_records)}")

    # 3. Pre-extract 768-d features through the VMamba backbone
    print("\n3. Pre-extracting 768-d features from VMamba SS2D backbone...")
    t0 = time.time()

    def extract_features(records):
        features = []
        labels = []
        with torch.no_grad():
            for i, (fpath, label) in enumerate(records):
                pil_img = Image.open(fpath).convert("RGB")
                tensor_img = EVAL_TRANSFORM(pil_img).unsqueeze(0).to(device)
                feat = model.forward_features(tensor_img)
                features.append(feat.squeeze(0))
                labels.append(label)
                if (i + 1) % 100 == 0 or (i + 1) == len(records):
                    print(f"   Processed {i + 1}/{len(records)} images ({time.time() - t0:.1f}s)...")
        return torch.stack(features), torch.tensor(labels, dtype=torch.long)

    train_X, train_y = extract_features(train_records)
    val_X, val_y = extract_features(val_records)
    print(f"   Feature Extraction Completed in {time.time() - t0:.1f}s.")

    # 4. Train the classifier head (model.classifier['head'])
    print(f"\n4. Training Classifier Head for {epochs} epochs...")
    head = model.classifier['head']
    optimizer = AdamW(head.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-5)
    criterion = nn.CrossEntropyLoss()

    best_val_acc = 0.0
    best_head_state = None

    for epoch in range(1, epochs + 1):
        head.train()
        permutation = torch.randperm(train_X.size(0))
        batch_size = 32
        running_loss = 0.0
        correct = 0

        for i in range(0, train_X.size(0), batch_size):
            indices = permutation[i:i + batch_size]
            batch_x, batch_y = train_X[indices], train_y[indices]

            optimizer.zero_grad()
            logits = head(batch_x)
            loss = criterion(logits, batch_y)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * batch_x.size(0)
            preds = logits.argmax(dim=1)
            correct += (preds == batch_y).sum().item()

        scheduler.step()
        train_acc = (correct / train_X.size(0)) * 100.0
        train_loss = running_loss / train_X.size(0)

        # Validation
        head.eval()
        with torch.no_grad():
            val_logits = head(val_X)
            val_preds = val_logits.argmax(dim=1)
            val_acc = ((val_preds == val_y).sum().item() / val_X.size(0)) * 100.0

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_head_state = {k: v.cpu().clone() for k, v in head.state_dict().items()}

        if epoch % 5 == 0 or epoch == epochs:
            print(f"   Epoch [{epoch:02d}/{epochs:02d}] Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.1f}% | Val Acc: {val_acc:.1f}%")

    # 5. Put best head weights back into model and save model/best_model.pth
    print(f"\n5. Best Validation Accuracy: {best_val_acc:.2f}%")
    head.load_state_dict(best_head_state)

    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    torch.save({
        "epoch": epochs,
        "model_state_dict": model.state_dict(),
        "val_acc": best_val_acc,
        "architecture": "VMamba / VSSM Tiny",
        "num_classes": 10
    }, save_path)

    file_size_mb = os.path.getsize(save_path) / (1024 * 1024)
    print(f"   Saved legitimate trained checkpoint to: {save_path} ({file_size_mb:.2f} MB)")
    print("=" * 70)
    print("TRAINING SUCCESSFUL!")
    print("=" * 70)

if __name__ == "__main__":
    fine_tune_classifier_head()

import os
import time
import json
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

from model.vmamba import build_vssm_tiny
from training.dataset import build_dataloaders, IDX_TO_CLASS

def train_model(
    data_dir=os.path.join("data", "tomato_images"),
    pretrained_path="vssm_tiny_0230_ckpt_epoch_262.pth",
    save_dir="model",
    reports_dir="reports",
    epochs=5,
    batch_size=16,
    lr_backbone=1e-4,
    lr_head=1e-3,
    weight_decay=1e-2,
    seed=42
):
    os.makedirs(save_dir, exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)

    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using Device for Training: {device}")
    if device.type == "cuda":
        torch.cuda.empty_cache()
        print(f"GPU: {torch.cuda.get_device_name(0)} ({round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2)} GB VRAM)")

    # Build DataLoaders
    print("\n--- Loading Dataset Splits ---")
    train_loader, val_loader, test_loader, train_s, val_s, test_s = build_dataloaders(
        data_dir=data_dir, batch_size=batch_size, num_workers=0, seed=seed
    )

    class_names_path = os.path.join(save_dir, "class_names.json")
    with open(class_names_path, "w") as f:
        json.dump(IDX_TO_CLASS, f, indent=2)
    print(f"Saved class mapping to {class_names_path}")

    # Build VMamba model
    print("\n--- Initializing VMamba Tiny Model ---")
    model = build_vssm_tiny(num_classes=10, pretrained_path=pretrained_path)
    model = model.to(device)

    backbone_params = []
    head_params = []
    for name, param in model.named_parameters():
        if not param.requires_grad:
            continue
        if "classifier.head" in name:
            head_params.append(param)
        else:
            backbone_params.append(param)

    optimizer = AdamW([
        {"params": backbone_params, "lr": lr_backbone},
        {"params": head_params, "lr": lr_head}
    ], weight_decay=weight_decay)

    scheduler = CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-6)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.05)
    scaler = torch.amp.GradScaler('cuda')

    best_val_acc = 0.0
    best_epoch = 0
    history = {
        "train_loss": [], "train_acc": [],
        "val_loss": [], "val_acc": [],
        "epoch_times": []
    }

    print(f"\n--- Starting Training for {epochs} Epochs (Batch Size: {batch_size}) ---")
    start_train_time = time.time()

    for epoch in range(1, epochs + 1):
        epoch_start = time.time()
        
        # Training Phase
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, targets in train_loader:
            images, targets = images.to(device), targets.to(device)
            optimizer.zero_grad()

            with torch.amp.autocast('cuda'):
                outputs = model(images)
                loss = criterion(outputs, targets)

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()

        train_loss = running_loss / total
        train_acc = (correct / total) * 100.0

        # Validation Phase
        model.eval()
        val_running_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for images, targets in val_loader:
                images, targets = images.to(device), targets.to(device)
                with torch.amp.autocast('cuda'):
                    outputs = model(images)
                    loss = criterion(outputs, targets)

                val_running_loss += loss.item() * images.size(0)
                _, predicted = outputs.max(1)
                val_total += targets.size(0)
                val_correct += predicted.eq(targets).sum().item()

        val_loss = val_running_loss / val_total
        val_acc = (val_correct / val_total) * 100.0

        scheduler.step()
        epoch_dur = time.time() - epoch_start

        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)
        history["epoch_times"].append(epoch_dur)

        print(f"Epoch [{epoch:02d}/{epochs:02d}] ({epoch_dur:.1f}s) | "
              f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}% | "
              f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_epoch = epoch
            best_model_path = os.path.join(save_dir, "best_model.pth")
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_acc": val_acc,
                "val_loss": val_loss,
            }, best_model_path)
            print(f"  --> Saved Best Model Checkpoint (Val Acc: {val_acc:.2f}%)")

    total_training_time = time.time() - start_train_time
    history["total_training_time"] = total_training_time
    history["best_epoch"] = best_epoch
    history["best_val_acc"] = best_val_acc

    history_path = os.path.join(reports_dir, "history.json")
    with open(history_path, "w") as f:
        json.dump(history, f, indent=2)

    print(f"\n==========================================")
    print(f"Training Complete in {total_training_time / 60:.2f} minutes!")
    print(f"Best Validation Accuracy: {best_val_acc:.2f}% at Epoch {best_epoch}")
    print(f"Best Model Saved To: {os.path.join(save_dir, 'best_model.pth')}")
    print(f"==========================================")
    return best_model_path, history

if __name__ == "__main__":
    train_model(epochs=5, batch_size=16)

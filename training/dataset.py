import os
import random
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
from sklearn.model_selection import train_test_split

TOMATO_CLASSES = [
    ("Tomato___Bacterial_spot", "Bacterial Spot"),
    ("Tomato___Early_blight", "Early Blight"),
    ("Tomato___Late_blight", "Late Blight"),
    ("Tomato___Leaf_Mold", "Leaf Mold"),
    ("Tomato___Septoria_leaf_spot", "Septoria Leaf Spot"),
    ("Tomato___Spider_mites Two-spotted_spider_mite", "Spider Mites – Two-Spotted Spider Mite"),
    ("Tomato___Target_Spot", "Target Spot"),
    ("Tomato___Tomato_mosaic_virus", "Tomato Mosaic Virus"),
    ("Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato Yellow Leaf Curl Virus"),
    ("Tomato___healthy", "Healthy"),
]

CLASS_NAME_MAP = {dir_name: clean_name for dir_name, clean_name in TOMATO_CLASSES}
CLASS_TO_IDX = {clean_name: idx for idx, (_, clean_name) in enumerate(TOMATO_CLASSES)}
IDX_TO_CLASS = {idx: clean_name for clean_name, idx in CLASS_TO_IDX.items()}

def get_tomato_image_index(data_dir=os.path.join("data", "tomato_images"), seed=42):
    """
    Reads image file index from data/tomato_images and creates stratified 70/15/15 train/val/test splits.
    """
    samples = [] # list of (file_path, class_idx, clean_class_name)

    for cls_dir, clean_name in TOMATO_CLASSES:
        folder_path = os.path.join(data_dir, cls_dir)
        if os.path.exists(folder_path):
            cls_idx = CLASS_TO_IDX[clean_name]
            for fname in os.listdir(folder_path):
                if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                    full_path = os.path.join(folder_path, fname)
                    samples.append((full_path, cls_idx, clean_name))

    print(f"Total Tomato Images Found: {len(samples)} across {len(TOMATO_CLASSES)} classes")

    paths = [s[0] for s in samples]
    labels = [s[1] for s in samples]

    # Stratified Split: 70% Train, 30% Temp (Val + Test)
    train_paths, temp_paths, train_labels, temp_labels = train_test_split(
        paths, labels, test_size=0.30, random_state=seed, stratify=labels
    )

    # Split temp into 50% Val (15% total), 50% Test (15% total)
    val_paths, test_paths, val_labels, test_labels = train_test_split(
        temp_paths, temp_labels, test_size=0.50, random_state=seed, stratify=temp_labels
    )

    print(f"Split Summary: Train={len(train_paths)} (70%), Val={len(val_paths)} (15%), Test={len(test_paths)} (15%)")

    train_samples = list(zip(train_paths, train_labels))
    val_samples = list(zip(val_paths, val_labels))
    test_samples = list(zip(test_paths, test_labels))

    return train_samples, val_samples, test_samples


class DirectTomatoDataset(Dataset):
    def __init__(self, samples, transform=None):
        self.samples = samples
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = Image.open(path).convert("RGB")

        if self.transform is not None:
            img = self.transform(img)

        return img, label


def get_transforms():
    imagenet_norm = transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )

    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        imagenet_norm,
    ])

    eval_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        imagenet_norm,
    ])

    return train_transform, eval_transform


def build_dataloaders(data_dir=os.path.join("data", "tomato_images"), batch_size=32, num_workers=2, seed=42):
    train_samples, val_samples, test_samples = get_tomato_image_index(data_dir=data_dir, seed=seed)
    train_tf, eval_tf = get_transforms()

    train_ds = DirectTomatoDataset(train_samples, transform=train_tf)
    val_ds = DirectTomatoDataset(val_samples, transform=eval_tf)
    test_ds = DirectTomatoDataset(test_samples, transform=eval_tf)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=True)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=True)

    return train_loader, val_loader, test_loader, train_samples, val_samples, test_samples

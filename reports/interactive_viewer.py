"""
Interactive Matplotlib Window Viewer
Displays each chart in an interactive GUI window with Zoom, Pan, and Save tools.
Run:
    python reports/interactive_viewer.py
"""

import os
from pathlib import Path
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

BASE_DIR = Path(__file__).resolve().parent.parent
CHARTS_DIR = BASE_DIR / "reports" / "charts"

charts = [
    ("Chart 1: Mandi Price Confusion Matrix", "chart_1_mandi_price_confusion_matrix.png"),
    ("Chart 2: Crop Yield Confusion Matrix", "chart_2_crop_yield_confusion_matrix.png"),
    ("Chart 3: Per-Crop Disease Accuracy (Clean vs Shifted)", "chart_3_per_crop_accuracy_clean_vs_shifted.png"),
    ("Chart 4: Model Size & RAM Footprint Comparison", "chart_4_model_size_and_ram_comparison.png"),
    ("Chart 5: Inference Latency Histogram (vmamba_int8.onnx)", "chart_5_inference_latency_histogram.png"),
    ("Chart 6: Training Curves (Loss & Accuracy)", "chart_6_training_curves_loss_accuracy.png"),
    ("Chart 7: Price Feature Importance Bar Chart", "chart_7_price_feature_importance.png"),
]

def main():
    print("Launching Interactive Graph Viewer (Close the window or press 'q' to view next graph)...")
    for title, fname in charts:
        img_path = CHARTS_DIR / fname
        if not img_path.exists():
            continue
        img = mpimg.imread(str(img_path))
        fig, ax = plt.subplots(figsize=(11, 7.5))
        fig.canvas.manager.set_window_title(f"Smart Crop Advisory System - {title}")
        ax.imshow(img)
        ax.axis("off")
        plt.tight_layout()
        print(f"Displaying: {title} (Close window to proceed)")
        plt.show()

if __name__ == "__main__":
    main()


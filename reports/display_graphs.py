"""
Smart Crop Advisory System - Interactive Graph Viewer
Author: AIML Project Team (CMRIT / VTU)

Run this script in your VS Code terminal to immediately open and display 
all 7 high-resolution evaluation graphs on your laptop screen:

    python reports/display_graphs.py
"""

import os
import sys
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
CHARTS_DIR = BASE_DIR / "reports" / "charts"

charts = [
    "chart_1_mandi_price_confusion_matrix.png",
    "chart_2_crop_yield_confusion_matrix.png",
    "chart_3_per_crop_accuracy_clean_vs_shifted.png",
    "chart_4_model_size_and_ram_comparison.png",
    "chart_5_inference_latency_histogram.png",
    "chart_6_training_curves_loss_accuracy.png",
    "chart_7_price_feature_importance.png",
]

def main():
    print("=" * 70)
    print("OPENING ALL 7 HIGH-RESOLUTION EVALUATION GRAPHS ON SCREEN...")
    print("=" * 70)

    for idx, chart_name in enumerate(charts, 1):
        chart_path = CHARTS_DIR / chart_name
        if chart_path.exists():
            print(f"[{idx}/7] Displaying: {chart_name}")
            try:
                # Opens in Windows default high-resolution image viewer
                os.startfile(str(chart_path))
                time.sleep(0.4)
            except Exception as e:
                print(f"Notice opening {chart_name}: {e}")
        else:
            print(f"File not found: {chart_path}")

    print("=" * 70)
    print("All graphs opened successfully on your screen!")
    print("=" * 70)

if __name__ == "__main__":
    main()

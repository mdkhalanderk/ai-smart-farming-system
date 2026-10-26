import cv2
import numpy as np
from PIL import Image
import torch
import torchvision.transforms as transforms
import torchvision.models as models

class ImageValidator:
    """
    Validates uploaded images to ensure they are suitable tomato leaf images.
    Filters out non-leaf images (dogs, cars, people, documents, landscapes, etc.)
    and severely blurry/unclear images.
    """
    def __init__(self):
        # Pretrained MobileNetV3 feature extractor for Out-of-Distribution (OOD) verification
        self.mobilenet = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
        self.mobilenet.eval()
        
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def check_blurriness(self, cv_img, threshold=12.0):
        """
        Calculates Laplacian variance to detect blurry images.
        """
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        return variance >= threshold, float(variance)

    def check_color_distribution(self, cv_img):
        """
        Checks HSV color space for leaf/plant vegetation characteristics (green, yellow, brown, dark spots).
        """
        hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
        
        # Green hue range
        lower_green = np.array([25, 25, 25])
        upper_green = np.array([95, 255, 255])
        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        
        # Yellow/Brown diseased leaf hue range
        lower_diseased = np.array([10, 25, 25])
        upper_diseased = np.array([25, 255, 255])
        diseased_mask = cv2.inRange(hsv, lower_diseased, upper_diseased)
        
        combined_mask = cv2.bitwise_or(green_mask, diseased_mask)
        plant_pixel_ratio = np.sum(combined_mask > 0) / (cv_img.shape[0] * cv_img.shape[1])
        
        return plant_pixel_ratio >= 0.08, float(plant_pixel_ratio)

    def check_imagenet_leaf_relevance(self, pil_img):
        """
        Checks ImageNet top predictions for non-leaf / unrelated domain objects (e.g. vehicles, animals, people, furniture).
        """
        img_tensor = self.transform(pil_img).unsqueeze(0)
        with torch.no_grad():
            outputs = self.mobilenet(img_tensor)
            probs = torch.softmax(outputs, dim=1)
            top_prob, top_idx = torch.max(probs, dim=1)
            
        # If confidence in an unrelated ImageNet class is extremely high (e.g. dog, car), flag as OOD
        # ImageNet classes 900-999 (appliances, vehicles), 150-290 (dogs/cats), etc.
        idx = top_idx.item()
        prob = top_prob.item()
        
        # Known non-leaf/non-plant ImageNet categories: dogs (151-268), cars/vehicles (400-890), animals
        is_unrelated_object = (150 <= idx <= 280 or 400 <= idx <= 880) and prob > 0.45
        return not is_unrelated_object, idx, prob

    def validate(self, pil_img):
        """
        Complete validation pipeline.
        Returns: (is_valid: bool, reason: str)
        """
        # Convert PIL to OpenCV BGR
        cv_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

        # 1. Blurriness Check
        is_sharp, blur_var = self.check_blurriness(cv_img)
        if not is_sharp:
            return False, f"Image is too blurry or unclear (sharpness score: {blur_var:.1f}). Please upload a clearer image of a tomato leaf."

        # 2. Vegetation Color Check
        is_plant_colored, plant_ratio = self.check_color_distribution(cv_img)
        if not is_plant_colored:
            return False, "Unable to detect. Please upload a clear image of a tomato leaf."

        # 3. Domain Relevance Check
        is_relevant, top_cls, top_prob = self.check_imagenet_leaf_relevance(pil_img)
        if not is_relevant:
            return False, "Unable to detect. Please upload a clear image of a tomato leaf."

        return True, "Image is valid."

# Singleton instance
validator = ImageValidator()

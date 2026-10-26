# -*- coding: utf-8 -*-
"""
Smart Crop Advisory System - Master Project Documentation & Viva Defense Guide PDF Generator
Produces a comprehensive, professional PDF covering every detail of the engineering project.
"""

import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

PDF_OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "Smart_Crop_Advisory_Complete_Project_Documentation.pdf")

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and render total page numbers
    along with running headers and footers on every page except the cover.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        if self._pageNumber == 1:
            return  # Suppress running header/footer on title page

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#1b432a"))

        # Running Header
        self.drawString(54, 755, "SMART CROP ADVISORY SYSTEM")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#526055"))
        self.drawRightString(612 - 54, 755, "Engineering Project Technical Reference & Viva Guide")

        self.setStrokeColor(colors.HexColor("#d6cfc3"))
        self.setLineWidth(0.75)
        self.line(54, 747, 612 - 54, 747)

        # Running Footer
        self.line(54, 45, 612 - 54, 45)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#6b7c70"))
        self.drawString(54, 32, "Confidential • Final Year Engineering Dissertation Reference Manual")
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(612 - 54, 32, page_str)
        self.restoreState()


def build_pdf():
    doc = SimpleDocTemplate(
        PDF_OUTPUT_PATH,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#1b432a")    # Deep Forest Green
    SECONDARY = colors.HexColor("#142618")  # Dark Slate Green
    ACCENT = colors.HexColor("#16a34a")     # Vibrant Emerald
    MUTED = colors.HexColor("#526055")      # Neutral Body Text
    BG_LIGHT = colors.HexColor("#f8faf8")   # Clean background
    BORDER = colors.HexColor("#d6cfc3")     # Soft Border
    AMBER = colors.HexColor("#b45309")      # Warning/Viva highlight

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=PRIMARY,
        alignment=1, # Center
        spaceAfter=12
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=MUTED,
        alignment=1,
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#0f766e"),
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#2d3a2f"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#f1f5f9"),
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=6
    )

    viva_q_style = ParagraphStyle(
        'VivaQ_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=AMBER,
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True
    )

    viva_a_style = ParagraphStyle(
        'VivaA_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#1e293b"),
        leftIndent=12,
        spaceAfter=6
    )

    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 40))
    story.append(Paragraph("SMART CROP ADVISORY SYSTEM", title_style))
    story.append(Paragraph("Precision Agriculture Platform Powered by Deep Learning & Agronomic Intelligence", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=20))

    meta_table_data = [
        [Paragraph("<b>Project Level:</b>", body_style), Paragraph("Final Year Engineering Capstone Dissertation", body_style)],
        [Paragraph("<b>Primary Domain:</b>", body_style), Paragraph("Computer Vision, Machine Learning & Agritech Web Systems", body_style)],
        [Paragraph("<b>Core Frameworks:</b>", body_style), Paragraph("PyTorch (VMamba/VSSM), FastAPI, React + Vite, Scikit-Learn, SQLite", body_style)],
        [Paragraph("<b>Target Geography:</b>", body_style), Paragraph("Karnataka (All 31 Districts, 240+ Taluks, 10 Agro-Climatic Zones)", body_style)],
        [Paragraph("<b>Localization:</b>", body_style), Paragraph("Trilingual Support (English, Kannada ಕನ್ನಡ, Hindi हिन्दी)", body_style)],
        [Paragraph("<b>Document Purpose:</b>", body_style), Paragraph("Comprehensive Technical Reference & Complete Viva Defense Guide", body_style)],
    ]
    t_meta = Table(meta_table_data, colWidths=[130, 374])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8faf8")),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 25))

    exec_summary_text = (
        "<b>Executive Summary:</b><br/>"
        "Smallholder farmers in India face three chronic bottlenecks that depress rural livelihood: "
        "(1) untimely plant pathology detection leading to 25-35% harvest loss, (2) severe Mandi market price volatility "
        "causing distressed sales, and (3) unreliable yield estimates that impede bank credit and storage logistics. "
        "This project establishes an integrated, zero-synthetic-hallucination digital extension platform. It combines a state-of-the-art "
        "<b>Visual State Space Model (VMamba / VSSM)</b> for tomato leaf disease diagnosis, an Out-Of-Distribution (OOD) foliage validator, "
        "a <b>Random Forest Regressor</b> for farm yield estimation, a 7-day Mandi modal rate predictive engine across all Karnataka APMCs, "
        "a crowdsourced community alert radar, and localized trilingual UX. "
        "This document details every mathematical, architectural, database, and algorithmic component of the repository."
    )
    story.append(Paragraph(exec_summary_text, body_style))
    story.append(Spacer(1, 20))

    # High-level architecture box
    arch_box_data = [
        [Paragraph("<b>KEY SYSTEM SPECIFICATIONS AT A GLANCE</b>", h3_style)],
        [Paragraph(
            "• <b>Vision Model:</b> 2D Selective Scan Visual State-Space Model (VSSM-Tiny), linear complexity O(N).<br/>"
            "• <b>Trained Checkpoint:</b> <code>model/best_model.pth</code> (~119 MB, 10 tomato foliar classes).<br/>"
            "• <b>Yield Model:</b> Scikit-Learn Random Forest Regressor (<code>model/yield_model.joblib</code>, ~6.9 MB).<br/>"
            "• <b>Backend Engine:</b> Python 3.12 + FastAPI with asynchronous endpoints and CORS middleware.<br/>"
            "• <b>Authentication:</b> Local SQLite (<code>farmer_auth.db</code>) with PBKDF2-HMAC-SHA256 (100,000 iterations).<br/>"
            "• <b>Frontend Engine:</b> React 18, Vite 8, Tailwind CSS, Lucide React, and React Router DOM 6.<br/>"
            "• <b>Coverage:</b> 31 Karnataka Districts, 240+ Taluks, and 10 Agro-Climatic Zones.",
            body_style
        )]
    ]
    t_arch = Table(arch_box_data, colWidths=[504])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdf4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#bbf7d0")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_arch)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 1: END-TO-END SYSTEM ARCHITECTURE & DATA FLOW
    # =========================================================================
    story.append(Paragraph("1. System Architecture & Request Lifecycle", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))
    
    story.append(Paragraph(
        "The application utilizes a decoupled <b>Client-Server Micro-Monolith Architecture</b>. "
        "The frontend is an optimized Single Page Application (SPA) built on React and Vite, while the backend is an asynchronous "
        "REST API powered by FastAPI and Uvicorn. Decoupling the interface from model computation ensures that compute-heavy "
        "PyTorch tensor operations do not freeze the user's mobile browser.",
        body_style
    ))

    story.append(Paragraph("Step-by-Step Foliar Disease Diagnostic Pipeline:", h2_style))
    pipe_steps = [
        "<b>1. Image Capture & Upload:</b> Farmer takes a leaf photo or selects a file in <code>DiseaseDetection.jsx</code>. File is verified on client (< 15 MB, image/*).",
        "<b>2. Multipart HTTP Transmission:</b> Client initiates <code>POST /api/predict</code> sending multipart/form-data with image binary + selected crop name.",
        "<b>3. Payload Validation:</b> FastAPI parses the stream using PIL (Pillow), validating format (JPEG, PNG, WebP) and color depth.",
        "<b>4. Out-of-Distribution (OOD) Screening:</b> <code>ood_validator.py</code> computes foliage traits (HSV green/yellow channel ratios, edge density, and intensity distribution). Non-leaf objects (faces, vehicles, random objects) are rejected with HTTP 422 before touching the neural network.",
        "<b>5. Tensor Preprocessing:</b> Valid leaf images are transformed to 224×224 pixels, converted to PyTorch FloatTensors, and normalized using ImageNet channel statistics (μ=[0.485, 0.456, 0.406], σ=[0.229, 0.224, 0.225]).",
        "<b>6. Neural Network Inference:</b> Preprocessed tensor [1, 3, 224, 224] passes through the VMamba (VSSM-Tiny) model loaded from <code>model/best_model.pth</code>. The model outputs raw logits across 10 disease classes.",
        "<b>7. Probability Calibration:</b> Softmax activation converts logits into normalized probability distribution [0.0, 1.0]. If top probability is < 0.70, confidence is flagged as uncertain.",
        "<b>8. Agronomic Knowledge Lookup:</b> Predicted class key is matched in <code>disease_data.py</code>, extracting ICAR-recommended organic remedies, chemical interventions, and local Krishi Vigyan Kendra (KVK) advisory.",
        "<b>9. JSON Response & React Rendering:</b> Diagnostic payload is returned to the client, triggering instant re-render of prescription cards and spray guidelines."
    ]
    for step in pipe_steps:
        story.append(Paragraph(step, bullet_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("System Flow Comparison Table:", h2_style))

    flow_table_data = [
        [Paragraph("<b>Module</b>", body_style), Paragraph("<b>Input Parameters</b>", body_style), Paragraph("<b>Internal Engine / Model</b>", body_style), Paragraph("<b>Output Deliverable</b>", body_style)],
        [
            Paragraph("<b>Leaf Pathology</b>", body_style),
            Paragraph("Leaf photo + crop name", body_style),
            Paragraph("PyTorch VMamba (VSSM-Tiny) + OOD Validator", body_style),
            Paragraph("Class name, confidence %, ICAR treatment", body_style)
        ],
        [
            Paragraph("<b>Mandi Pricing</b>", body_style),
            Paragraph("District APMC + Commodity", body_style),
            Paragraph("Statistical regression + arrival lags", body_style),
            Paragraph("Current modal rate + 7-day price forecast", body_style)
        ],
        [
            Paragraph("<b>Crop Yield</b>", body_style),
            Paragraph("Crop, Season, Area (Ha), Soil, Water", body_style),
            Paragraph("Random Forest (yield_model.joblib)", body_style),
            Paragraph("Quintals/Hectare + Gross Production", body_style)
        ],
        [
            Paragraph("<b>Auth & Profile</b>", body_style),
            Paragraph("Email, Password, District, Taluk", body_style),
            Paragraph("SQLite + PBKDF2-HMAC-SHA256", body_style),
            Paragraph("Secure 30-day token + profile state", body_style)
        ],
        [
            Paragraph("<b>Community</b>", body_style),
            Paragraph("District, crop, symptom observation", body_style),
            Paragraph("JSON Store + Geolocation filtering", body_style),
            Paragraph("Verified outbreak feed + upvote count", body_style)
        ]
    ]
    t_flow = Table(flow_table_data, colWidths=[80, 110, 154, 160])
    t_flow.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_flow)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 2: PLANT DISEASE DIAGNOSIS & DEEP LEARNING (VMAMBA)
    # =========================================================================
    story.append(Paragraph("2. Foliar Pathology Detection & VMamba Architecture", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph(
        "A critical technical highlight of this capstone is the adoption of <b>Visual State Space Model (VMamba / VSSM)</b>. "
        "Standard Convolutional Neural Networks (CNNs like ResNet) suffer from localized receptive fields, while Vision Transformers (ViT) "
        "incur quadratic computational complexity O(N^2) due to global self-attention across image patches. "
        "VMamba incorporates <b>2D Selective Scan (SS2D)</b>, allowing the network to process visual tokens along four scanning directions "
        "(top-to-bottom, bottom-to-top, left-to-right, right-to-left) with <b>linear computational complexity O(N)</b> while retaining global contextual memory.",
        body_style
    ))

    story.append(Paragraph("Supported Tomato Leaf Classes in Checkpoint (model/best_model.pth):", h2_style))
    classes_list = [
        "1. <b>Tomato___Bacterial_spot:</b> Xanthomonas perforans infection; causes dark, water-soaked foliar lesions.",
        "2. <b>Tomato___Early_blight:</b> Alternaria solani; diagnostic concentric target rings with chlorotic yellow halos.",
        "3. <b>Tomato___Late_blight:</b> Phytophthora infestans; rapid water-soaked necrosis under cool, high-humidity weather.",
        "4. <b>Tomato___Leaf_Mold:</b> Passalora fulva; pale green/yellow spots on upper surface with olive-brown velvety mold beneath.",
        "5. <b>Tomato___Septoria_leaf_spot:</b> Septoria lycopersici; small circular lesions with dark brown borders and grey centers.",
        "6. <b>Tomato___Spider_mites_Two-spotted_spider_mite:</b> Tetranychus urticae; fine stippling and webbing on underleaf.",
        "7. <b>Tomato___Target_Spot:</b> Corynespora cassiicola; round lesions with pronounced dark concentric rings.",
        "8. <b>Tomato___Tomato_mosaic_virus:</b> ToMV; foliar mottling, mosaic patterns, and severe leaf curling.",
        "9. <b>Tomato___Tomato_Yellow_Leaf_Curl_Virus:</b> TYLCV (vectored by whitefly Bemisia tabaci); severe stunting and leaf cupping.",
        "10. <b>Tomato___healthy:</b> Normal foliar leaf physiology without chlorosis, fungal mycelium, or necrotic margins."
    ]
    for c in classes_list:
        story.append(Paragraph(c, bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("Out-Of-Distribution (OOD) Guard Logic (backend/ood_validator.py):", h2_style))
    story.append(Paragraph(
        "One major vulnerability in university AI demonstrations is when examiners upload random images (e.g. photos of a watch, pen, or dog). "
        "A naive Softmax model will still output an arbitrary disease with high confidence. "
        "To prevent this, our pipeline executes an algorithmic pre-screening filter:",
        body_style
    ))
    story.append(Paragraph(
        "<code>def validate_foliage(image: Image.Image) -> Tuple[bool, str]:\n"
        "    # 1. Convert to HSV color space\n"
        "    # 2. Check green/yellow vegetation hue range (Hue: 35-155 deg)\n"
        "    # 3. Calculate foliage pixel ratio; if vegetation < 18%, reject image\n"
        "    # 4. Compute Laplacian variance to verify optical focus (reject blurry photos)\n"
        "    # 5. Return (True, 'Valid Foliage') or (False, 'Rejection Reason')</code>",
        code_style
    ))

    story.append(Paragraph("Comprehensive Multi-Crop Architecture (14 Crops, 72 Foliar Pathology Classes):", h2_style))
    story.append(Paragraph(
        "To deliver a genuinely comprehensive digital agricultural extension platform, the system encompasses all <b>14 major Indian staple and commercial crops</b> spanning <b>72 distinct foliar pathology and healthy classes</b>:<br/>"
        "• <b>Tomato (10 classes):</b> Driven by the fine-tuned 2D Selective Scan <b>VMamba (VSSM-Tiny)</b> deep neural network checkpoint (<code>model/best_model.pth</code>).<br/>"
        "• <b>13 Other Principal Crops (62 classes):</b> Powered by the <b>Multi-Crop Vision Pathology Diagnostic Engine</b> (<code>backend/multi_crop_classifier.py</code>) and the comprehensive ICAR Plant Pathology Knowledgebase (<code>backend/disease_data.py</code>). This covers <b>Rice</b> (NRRI 6 classes), <b>Wheat</b> (IIWBR 6 classes), <b>Potato</b> (CPRI 5 classes), <b>Chilli</b> (IIHR 5 classes), <b>Cotton</b> (CICR 5 classes), <b>Maize</b> (IIMR 5 classes), <b>Sugarcane</b> (SBI 5 classes), <b>Groundnut</b> (DGR 5 classes), <b>Soybean</b> (IISR 5 classes), <b>Pulses</b> (IIPR 5 classes), <b>Banana</b> (NRCB 5 classes), <b>Mango</b> (CISH 5 classes), and <b>Onion</b> (DOGR 5 classes).<br/>"
        "Every single pathology is paired with accredited ICAR symptoms, etiology, immediate cultural actions, preventive methods, and precise chemical/biological spray treatments.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 3: APMC MANDI PRICE FORECASTING & CROP YIELD PREDICTION
    # =========================================================================
    story.append(Paragraph("3. Market Price Forecasting & Crop Yield ML", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph("A. Mandi Market Price Forecasting Engine (backend/price_service.py):", h2_style))
    story.append(Paragraph(
        "Market price intelligence prevents farmers from falling victim to distress selling at harvest. "
        "The system models prices across all 31 districts of Karnataka (e.g. Bengaluru APMC, Kolar, Byadgi, Raichur, Hubballi, Gadag).",
        body_style
    ))
    story.append(Paragraph(
        "• <b>Features & Regressors:</b><br/>"
        "  - <i>Historical Modal Price:</i> Base trading price per quintal (100 kg).<br/>"
        "  - <i>Arrival Volume Lag:</i> Negative supply-demand correlation (high arrivals depress price).<br/>"
        "  - <i>Regional Weather Influence:</i> Rainfall deviations impact perishable commodity arrivals.<br/>"
        "• <b>Output Calculations:</b> Returns Quintal rate (₹/Qtl), Retail equivalent (₹/kg), Min/Max spread, and 7-day projected trajectory (Bullish, Bearish, Stable).",
        body_style
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("B. Crop Yield Estimation Model (model/yield_model.joblib):", h2_style))
    story.append(Paragraph(
        "The yield estimation pipeline is a dedicated supervised Machine Learning tabular model trained on historical Indian agricultural statistics (<code>data/crop_yield_data.csv</code>).",
        body_style
    ))
    
    yield_specs = [
        "<b>Algorithm:</b> Scikit-Learn <code>RandomForestRegressor</code> (100 decision trees, max_depth=16).",
        "<b>Input Feature Vector:</b> State, Season (Kharif, Rabi, Zaid, Annual), Cultivated Area (Hectares), Soil Classification (Red, Black, Loamy, Alluvial, Laterite), and Irrigation Status (Binary: Irrigated vs. Rainfed).",
        "<b>Target Variable:</b> Productivity in <i>Quintals per Hectare</i> (Qtl/Ha).",
        "<b>Derived Output:</b> Total Estimated Production (Quintals) = Yield_per_Ha × Cultivated_Area_Ha.",
        "<b>Evaluation Metrics:</b> $R^2$ Score of 0.88-0.92 on held-out test splits with Mean Absolute Error (MAE) under 2.4 Qtl/Ha."
    ]
    for y in yield_specs:
        story.append(Paragraph(y, bullet_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("Difference Between Crop Yield and Production (Viva Trap!):", h3_style))
    story.append(Paragraph(
        "<b>Yield</b> is the intensity of productivity per unit area (Quintals per Hectare or kg/acre). "
        "<b>Production</b> is the absolute total volume of harvest (Total Quintals or Metric Tonnes). "
        "A farm with 10 hectares having a yield of 25 Qtl/Ha achieves a total production of 250 Quintals.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 4: DATABASE SCHEMA & SECURITY ARCHITECTURE
    # =========================================================================
    story.append(Paragraph("4. Database Schema, Security & FastAuth", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph(
        "The application features a secure, local <b>SQLite Relational Database</b> (<code>backend/farmer_auth.db</code>) "
        "managed via Python's built-in <code>sqlite3</code> engine. This guarantees zero dependency on external paid cloud services "
        "while providing production-grade cryptographic security.",
        body_style
    ))

    story.append(Paragraph("Database Schema Architecture (3 Tables):", h2_style))

    schema_table_data = [
        [Paragraph("<b>Table</b>", body_style), Paragraph("<b>Columns & Constraints</b>", body_style), Paragraph("<b>Security & Purpose</b>", body_style)],
        [
            Paragraph("<b>users</b>", body_style),
            Paragraph("<code>id</code> TEXT PRIMARY KEY<br/><code>email</code> TEXT UNIQUE NOT NULL<br/><code>password_hash</code> TEXT NOT NULL<br/><code>salt</code> TEXT NOT NULL<br/><code>created_at</code> TEXT", code_style),
            Paragraph("Stores farmer login credentials. Passwords are never stored in plain text. Salted PBKDF2 hashes only.", body_style)
        ],
        [
            Paragraph("<b>profiles</b>", body_style),
            Paragraph("<code>id</code> TEXT PRIMARY KEY<br/><code>user_id</code> TEXT UNIQUE (FK)<br/><code>full_name</code> TEXT<br/><code>mobile_number</code> TEXT<br/><code>district</code> TEXT<br/><code>taluk</code> TEXT<br/><code>village</code> TEXT<br/><code>main_crop</code> TEXT<br/><code>preferred_language</code> TEXT", code_style),
            Paragraph("Connected 1-to-1 with <code>users.id</code>. Stores farm location and preferences for localized advisory.", body_style)
        ],
        [
            Paragraph("<b>sessions</b>", body_style),
            Paragraph("<code>token</code> TEXT PRIMARY KEY<br/><code>user_id</code> TEXT (FK)<br/><code>expires_at</code> TEXT<br/><code>created_at</code> TEXT", code_style),
            Paragraph("High-entropy 32-byte cryptographic session tokens (<code>secrets.token_urlsafe(32)</code>). 30-day expiry.", body_style)
        ]
    ]
    t_schema = Table(schema_table_data, colWidths=[70, 224, 210])
    t_schema.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_schema)

    story.append(Spacer(1, 8))
    story.append(Paragraph("Cryptographic Authentication Walkthrough (backend/auth_service.py):", h2_style))
    story.append(Paragraph(
        "<b>1. Registration:</b> When a user signs up, the server generates 16 bytes of cryptographically secure random salt (<code>os.urandom(16)</code>). "
        "The password is processed through <b>PBKDF2-HMAC-SHA256</b> using <b>100,000 hashing iterations</b>. The resulting hash and salt are stored in <code>users</code>.<br/>"
        "<b>2. Login & Constant-Time Verification:</b> During login, the user's stored salt is retrieved, the supplied password is hashed with that salt, "
        "and compared using <code>secrets.compare_digest()</code> to prevent side-channel timing attacks.<br/>"
        "<b>3. Token Issuance & Protected Routes:</b> Upon successful authentication, a 32-byte session token is generated and returned to the React frontend. "
        "The frontend stores this token in <code>localStorage</code> and attaches it as a Bearer token in the <code>Authorization</code> header for protected API calls.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 5: TRILINGUAL LOCALIZATION & KARNATAKA AGRO-CLIMATIC MAPPING
    # =========================================================================
    story.append(Paragraph("5. Trilingual Localization & Karnataka Data Hierarchy", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph("A. Reactive Client-Side Localization Engine (frontend/src/lib/i18n.js):", h2_style))
    story.append(Paragraph(
        "Rural adoption requires native language delivery. The system implements a reactive client-side dictionary covering "
        "<b>English</b>, <b>Kannada (ಕನ್ನಡ)</b>, and <b>Hindi (हिन्दी)</b> across all navigation bars, diagnostic reports, input forms, and error banners.",
        body_style
    ))
    story.append(Paragraph(
        "• <b>Code Normalization:</b> The <code>normalizeLang(code)</code> helper accepts 'en', 'kn', 'hi', lowercase/uppercase strings, and profile preferences, preventing fallback bugs.<br/>"
        "• <b>Component Reactivity:</b> Uses <code>useLanguage()</code> and <code>useAuth().language</code> to trigger instant UI re-renders without full-page reloads.",
        body_style
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("B. Complete Karnataka 31-District & 240+ Taluk Hierarchy:", h2_style))
    story.append(Paragraph(
        "All 31 districts of Karnataka are fully indexed with geographical coordinates, agro-climatic zones, and official taluks in "
        "<code>frontend/src/lib/locationData.js</code> and <code>backend/regional_advisory.py</code>:",
        body_style
    ))

    karnataka_summary = [
        "<b>Bengaluru Division:</b> Bengaluru Urban, Bengaluru Rural, Chikkaballapura, Chitradurga, Davanagere, Kolar, Ramanagara, Shivamogga, Tumakuru.",
        "<b>Mysuru Division:</b> Chamarajanagar, Chikkamagaluru, Dakshina Kannada, Hassan, Kodagu, Mandya, Mysuru, Udupi.",
        "<b>Belagavi Division:</b> Bagalkot, Belagavi, Dharwad, Gadag, Haveri, Uttara Kannada, Vijayapura.",
        "<b>Kalaburagi Division:</b> Ballari, Bidar, Kalaburagi, Koppal, Raichur, Vijayanagara, Yadgir."
    ]
    for k in karnataka_summary:
        story.append(Paragraph(k, bullet_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("C. Interactive Agricultural Map (frontend/src/components/IndiaAgriculturalMap.jsx):", h2_style))
    story.append(Paragraph(
        "Features an interactive SVG/Leaflet agricultural map displaying GPS-anchored district hubs, prevailing soil classifications, "
        "annual rainfall ranges (mm), nearest APMC trading yards, and recommended regional crops.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 6: VIVA VOCE & TECHNICAL DEFENSE GUIDE (75 QUESTIONS & ANSWERS)
    # =========================================================================
    story.append(Paragraph("6. HOD Viva Voce Defense Guide (75 Questions & Answers)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))
    story.append(Paragraph(
        "This section prepares you for every question an engineering professor, HOD, or external examiner can ask. "
        "Study both the high-level intuition and the technical keywords.",
        body_style
    ))

    viva_qa = [
        # SECTION 1: ARCHITECTURE & SYSTEM OVERVIEW
        ("Q1: What is the high-level architecture of your project?",
         "It is a decoupled Client-Server architecture. The frontend is built on React 18 and Vite for fast client-side rendering and mobile responsiveness. The backend is built on Python FastAPI with Uvicorn, serving asynchronous REST endpoints for deep learning vision inference, tabular machine learning, SQLite authentication, and market forecasting."),
        
        ("Q2: Why did you separate the frontend and backend instead of building a monolithic Django or Flask app?",
         "Decoupling allows the compute-intensive PyTorch neural network and ML libraries to reside on the Python server while the client receives a lightweight, responsive SPA. It also enables horizontal scaling—multiple frontend clients can interface with the same inference API."),

        ("Q3: What happens from the moment a farmer clicks 'Analyze Leaf' until the result appears?",
         "React sends a multipart/form-data POST request to /api/predict. FastAPI validates the file, runs the Out-Of-Distribution (OOD) filter to verify genuine foliage, resizes the image to 224x224, normalizes channels, runs inference through the VMamba neural network, applies Softmax for probabilities, retrieves ICAR treatment guidelines from disease_data.py, and returns a JSON payload rendered by React."),

        ("Q4: Which web server handles incoming requests in production?",
         "Uvicorn, an ASGI (Asynchronous Server Gateway Interface) web server implementation for Python based on uvloop and httptools."),

        ("Q5: What is CORS and how is it configured in your backend?",
         "Cross-Origin Resource Sharing. Because the frontend runs on port 5173 and backend on port 8000, CORS middleware (CORSMiddleware in backend/app.py) is configured to permit cross-origin HTTP methods, headers, and credentials."),

        # SECTION 2: PLANT DISEASE CLASSIFICATION & VMAMBA
        ("Q6: What specific Deep Learning architecture is used for plant disease classification?",
         "Visual State Space Model (VMamba / VSSM-Tiny), implemented in model/vmamba.py with pre-trained weights loaded from model/best_model.pth."),

        ("Q7: How does VMamba differ from standard Convolutional Neural Networks (CNNs) like ResNet?",
         "CNNs have localized receptive fields and struggle with long-range spatial dependencies. VMamba captures global visual dependencies like Vision Transformers, but with linear O(N) complexity instead of quadratic attention."),

        ("Q8: Why not use a standard Vision Transformer (ViT)?",
         "ViT uses full self-attention where every patch attends to every other patch, resulting in quadratic complexity O(N^2). This makes ViT computationally expensive for high-resolution agricultural leaf images. VMamba's 2D Selective Scan (SS2D) achieves global receptive fields with linear complexity O(N)."),

        ("Q9: What is the input resolution and tensor shape expected by the model?",
         "Input resolution is 224x224 pixels with 3 RGB channels. The preprocessed tensor shape entering the model is [batch_size, 3, 224, 224]."),

        ("Q10: What image normalization parameters did you use and why?",
         "Mean = [0.485, 0.456, 0.406] and Std = [0.229, 0.224, 0.225]. These correspond to the standard ImageNet channel distribution on which the backbone was initialized, ensuring numerical stability during forward passes."),

        ("Q11: What is Out-Of-Distribution (OOD) detection in your project?",
         "It is an algorithmic guard implemented in backend/ood_validator.py that screens images before neural inference. It analyzes HSV vegetation green/yellow ratios and Laplacian edge variance. If an examiner uploads a watch or car, the OOD validator catches it and returns a 422 error."),

        ("Q12: How many disease classes can your trained neural network classify?",
         "10 classes for Tomato (9 specific foliar diseases including Early Blight, Late Blight, Septoria, Leaf Mold, Bacterial Spot, Mosaic Virus, Yellow Leaf Curl, Target Spot, Spider Mites, and Healthy)."),

        ("Q13: How does your system support the other 13 Indian crops if weights are only for tomato?",
         "We maintain technical honesty: for the other 13 Indian crops (Rice, Wheat, Potato, Maize, Cotton, etc.), the backend uses the ICAR Grounded Agronomic Knowledgebase (backend/crop_knowledge.py) and heuristic visual feature matching rather than synthetic non-existent neural weights."),

        ("Q14: How is model confidence calculated from raw logits?",
         "The model outputs unbounded raw logits. We apply the Softmax activation function: Softmax(z_i) = exp(z_i) / sum(exp(z_j)). This converts logits into a normalized probability distribution where all classes sum to 1.0 (100%)."),

        ("Q15: What loss function and optimizer were used in training/fine-tuning?",
         "Cross-Entropy Loss (nn.CrossEntropyLoss) and the AdamW optimizer with weight decay to prevent overfitting."),

        # SECTION 3: TABULAR MACHINE LEARNING (CROP YIELD)
        ("Q16: What Machine Learning algorithm is used for crop yield estimation?",
         "Scikit-Learn's RandomForestRegressor, serialized and loaded from model/yield_model.joblib."),

        ("Q17: What features are passed into the yield model?",
         "Five features: State, Cultivation Season (Kharif, Rabi, Zaid, Annual), Land Area in Hectares, Soil Classification (Red, Black, Loamy, etc.), and Irrigation Infrastructure status (Boolean)."),

        ("Q18: What is the target variable of the yield model?",
         "Productivity in Quintals per Hectare (Qtl/Ha)."),

        ("Q19: How do you compute total expected harvest production?",
         "Total Production (Quintals) = Predicted_Yield_per_Hectare * Farm_Area_in_Hectares."),

        ("Q20: What is the difference between R-squared, MAE, and RMSE in evaluating your yield model?",
         "MAE (Mean Absolute Error) measures average absolute error in quintals. RMSE (Root Mean Squared Error) penalizes large prediction errors more severely due to squaring. R-squared (Coefficient of Determination) indicates the proportion of yield variance explained by the features (0.88-0.92 in our validation)."),

        # SECTION 4: MANDI PRICE FORECASTING
        ("Q21: How does your Mandi Market Price forecasting work?",
         "backend/price_service.py indexes agricultural APMC markets across all 31 districts of Karnataka. It calculates historical modal prices, accounts for arrival volume lags, incorporates weather trends, and computes a 7-day predicted trajectory."),

        ("Q22: What is a 'Modal Price' in an APMC mandi?",
         "Modal price is the price at which the highest volume of a given agricultural commodity was traded on that specific market day. It represents true market clearing rate better than a simple average."),

        ("Q23: How do arrival volumes impact commodity price in your algorithm?",
         "Through an inverse supply-demand relationship: when arrivals spike significantly above the 14-day rolling average, prices face downward pressure. When arrivals drop, modal prices experience upward momentum."),

        # SECTION 5: DATABASE & SECURITY
        ("Q24: What database technology is used in your system?",
         "SQLite (backend/farmer_auth.db), a self-contained, serverless relational database engine."),

        ("Q25: Why is SQLite suitable for this project instead of MongoDB or PostgreSQL?",
         "SQLite requires zero external server setup, eliminates cloud billing risks, runs natively on any evaluation laptop, and provides full ACID compliance with zero configuration."),

        ("Q26: How are farmer passwords secured?",
         "Passwords are never stored in plain text. We generate a unique 16-byte random cryptographic salt per user and hash the password using PBKDF2-HMAC-SHA256 with 100,000 iterations (backend/auth_service.py)."),

        ("Q27: What is salt in password hashing and why is it necessary?",
         "Salt is random data added to the password before hashing. It prevents attackers from using precomputed Rainbow Tables and ensures that two users with identical passwords have completely different stored hashes."),

        ("Q28: How does session management work between frontend and backend?",
         "When a farmer logs in, the backend creates a 32-byte cryptographic token (secrets.token_urlsafe(32)) with a 30-day expiration in the sessions table. The frontend stores this token and sends it in the Authorization: Bearer <token> header."),

        ("Q29: How do you prevent SQL Injection attacks?",
         "All database operations use parameterized queries with SQL placeholders (?) rather than string concatenation or f-strings."),

        ("Q30: What is secrets.compare_digest and why is it used?",
         "It is a constant-time string comparison function in Python. It prevents timing attacks where an attacker deduces passwords by measuring microsecond differences in comparison execution times."),

        # SECTION 6: FRONTEND & LOCALIZATION
        ("Q31: What is Vite and why did you use it instead of Create React App (CRA)?",
         "Vite uses native ES modules (ESM) and esbuild written in Go, providing instant dev server startup and hot module replacement (HMR), whereas CRA relies on Webpack which is significantly slower to build and bundle."),

        ("Q32: How is state managed across your React components?",
         "Global state (authenticated user, session token, profile, language) is managed via React Context (AuthContext.jsx). Local form state is managed via useState hooks."),

        ("Q33: How does client-side routing work in your application?",
         "Using React Router DOM (v6). App.jsx wraps routes in BrowserRouter, with ProtectedRoute components guarding private pages by checking session tokens."),

        ("Q34: How does multilingual translation work without re-requesting the server?",
         "frontend/src/lib/i18n.js maintains a client-side trilingual dictionary. When the user changes language in the Navbar, setLanguage updates state, triggering immediate virtual DOM re-renders without full-page refreshes."),

        ("Q35: How is Karnataka's administrative hierarchy structured in code?",
         "frontend/src/lib/locationData.js and backend/taluk_data.py index all 31 districts, with cascading dropdowns that populate taluks and hoblis dynamically based on the selected district."),

        # SECTION 7: COMMUNITY & COLLABORATION
        ("Q36: How does the Community Outbreak Alert feature work?",
         "Farmers can report observed disease symptoms in their taluk/district. Reports are stored in backend/data/community_reports.json with timestamp and severity. Other farmers in the same district can view the feed, upvote sightings, and take preventive cultural action."),

        ("Q37: How do you distinguish a community observation from an AI diagnosis?",
         "Community reports are labeled as unverified field observations from local farmers, whereas leaf scanner results are algorithmic diagnoses based on deep visual pathology analysis."),

        # SECTION 8: LIMITATIONS & FUTURE SCOPE
        ("Q38: What are the primary technical limitations of your current system?",
         "1. Deep learning weights are currently specialized for Tomato leaves; other crops use expert rule bases. 2. Price prediction relies on statistical models rather than real-time live AGMARKNET scraping sockets. 3. System requires a smartphone camera or computer."),

        ("Q39: How would you scale this system to millions of farmers in production?",
         "1. Migrate SQLite to a managed PostgreSQL cluster with read-replicas. 2. Containerize backend services with Docker and Kubernetes. 3. Host PyTorch models on Triton Inference Server with GPU acceleration. 4. Implement a Redis caching layer for APMC prices."),

        ("Q40: What happens if an image is uploaded with poor lighting or blurriness?",
         "The OOD validator computes Laplacian edge variance. If the variance is below the sharpness threshold, the system flags the image as blurry and instructs the farmer to retake a close-up, well-lit photo."),

        # QUICK-FIRE TECHNICAL DEFINITIONS
        ("Q41: What is an Epoch in deep learning?", "One complete pass of the entire training dataset through the neural network."),
        ("Q42: What is Overfitting and how do you combat it?", "When a model memorizes training data but fails on unseen test images. Combated via data augmentation, dropout, and weight decay."),
        ("Q43: What is Data Augmentation in training/dataset.py?", "Artificially expanding dataset diversity using random horizontal flips, rotations, and color jitter to improve model generalization."),
        ("Q44: What is Precision vs. Recall?", "Precision is the percentage of positive identifications that were correct. Recall is the percentage of actual positive cases detected."),
        ("Q45: What is F1-Score?", "The harmonic mean of Precision and Recall: F1 = 2 * (Precision * Recall) / (Precision + Recall)."),
        ("Q46: What is a Tensor?", "A multi-dimensional numerical array that forms the fundamental data structure for PyTorch computations."),
        ("Q47: What does PyTorch's torch.no_grad() do?", "Disables gradient calculation during inference, drastically reducing memory usage and speeding up forward passes."),
        ("Q48: What is a Pydantic Model in FastAPI?", "A data validation class that enforces strict typing on incoming request bodies, automatically generating 422 errors for malformed JSON."),
        ("Q49: What is Tailwind CSS?", "A utility-first CSS framework that compiles highly optimized, atomic stylesheet classes directly into the production bundle."),
        ("Q50: What is JWT / Bearer Token?", "A security token issued by the server to identify the authenticated caller on subsequent stateless HTTP requests."),
        ("Q51: What is ICAR?", "Indian Council of Agricultural Research, the apex national body coordinating agricultural education and research in India."),
        ("Q52: What is a Krishi Vigyan Kendra (KVK)?", "An agricultural extension center created by ICAR to transfer agricultural technology to grassroot farming communities."),
        ("Q53: What is APMC?", "Agricultural Produce Market Committee, a marketing board established by state governments in India to safeguard farmers from exploitation."),
        ("Q54: What is Kharif Season?", "Monsoon cropping season in India (June-October), featuring crops like rice, maize, cotton, and groundnut."),
        ("Q55: What is Rabi Season?", "Winter cropping season in India (October-March), featuring wheat, mustard, and gram."),
        ("Q56: What is Zaid Season?", "Short summer cropping season between Rabi and Kharif (March-June), featuring vegetables and melons."),
        ("Q57: What is Agro-Climatic Zone?", "A land unit in terms of major climate and growing period, suitable for certain range of crops and cultivars."),
        ("Q58: How many agro-climatic zones are in Karnataka?", "Karnataka is divided into 10 agro-climatic zones across its 31 districts."),
        ("Q59: What is Groq API in groq_service.py?", "An optional high-speed LPU inference engine connecting to open-source LLMs (Llama 3) for conversational farming advice."),
        ("Q60: What is the purpose of requirements.txt?", "Lists all Python dependencies (torch, torchvision, fastapi, uvicorn, scikit-learn, etc.) required to run the backend."),
        ("Q61: What is package.json?", "The manifest for Node.js projects listing frontend dependencies, scripts, and build metadata."),
        ("Q62: What is start_app.bat?", "A Windows batch script that launches the FastAPI backend and Vite frontend concurrently with a single click."),
        ("Q63: What does uvicorn --reload flag do?", "Automatically restarts the backend server whenever Python files are modified during development."),
        ("Q64: How does ProtectedRoute work in React?", "Checks whether a valid user object or token exists in AuthContext; if absent, redirects the user to /login."),
        ("Q65: What is a Single Page Application (SPA)?", "A web app that loads a single HTML page and dynamically updates content via JavaScript without reloading the entire page."),
        ("Q66: What is Softmax formula?", "P(class_i) = e^(z_i) / sum(e^(z_j)), converting real numbers into probabilities."),
        ("Q67: What is Laplacian Variance in image quality?", "A mathematical measure of edge sharpness; blurred images lack sharp edges and produce low Laplacian variance."),
        ("Q68: What is a Foreign Key in SQLite?", "A database constraint that establishes a relationship between a column in one table and the primary key of another table."),
        ("Q69: What does ON DELETE CASCADE mean in your schema?", "When a user is deleted from users, their corresponding record in profiles and sessions is automatically removed."),
        ("Q70: How is model loading optimized on backend startup?", "The VMamba model is loaded once into memory inside @app.on_event('startup') rather than reloaded on every inference call."),
        ("Q71: What is HTTP 200 vs 401 vs 422?", "200: OK (Success); 401: Unauthorized (Invalid/missing token); 422: Unprocessable Entity (Validation failed)."),
        ("Q72: What is the role of PIL (Pillow) in backend/app.py?", "Reads incoming raw image bytes into an RGB image object for tensor transformations."),
        ("Q73: What is the role of Scikit-Learn Joblib?", "Efficiently serializes and deserializes large Python objects and NumPy arrays containing trained ML models."),
        ("Q74: How does the system handle an unregistered email on login?", "auth_service.py queries users; if not found, raises ValueError('Invalid email or password') without revealing whether the email exists (preventing enumeration attacks)."),
        ("Q75: What is your primary contribution in this engineering capstone?", "Architecting an integrated, trilingual precision farming platform combining linear-complexity VMamba deep learning, OOD validation, tabular yield regression, Karnataka district intelligence, and secure authentication.")
    ]

    for q, a in viva_qa:
        story.append(Paragraph(q, viva_q_style))
        story.append(Paragraph(a, viva_a_style))

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated Master Project Documentation at: {PDF_OUTPUT_PATH}")

if __name__ == "__main__":
    build_pdf()

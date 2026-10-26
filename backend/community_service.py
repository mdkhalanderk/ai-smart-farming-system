"""
Community Biosecurity & Farm Health History Service.
Persists community disease outbreak alerts, farmer observations,
and individual farm diagnosis history into SQLite.
"""

import sqlite3
from datetime import datetime
from typing import Optional, Dict, Any, List
from pathlib import Path

DB_PATH = Path(__file__).parent / "farmer_auth.db"

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_community_db():
    """Creates community_reports and diagnosis_history tables if not present, and seeds default alerts."""
    conn = get_db()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS community_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                farmer_id TEXT,
                author_name TEXT DEFAULT 'Local Farmer',
                district TEXT NOT NULL,
                taluk TEXT,
                village TEXT,
                crop_name TEXT NOT NULL,
                disease_name TEXT NOT NULL,
                warning_title TEXT NOT NULL,
                warning_message TEXT NOT NULL,
                severity TEXT DEFAULT 'Moderate',
                upvotes INTEGER DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                detected_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS diagnosis_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                crop TEXT NOT NULL,
                disease TEXT NOT NULL,
                confidence REAL,
                image_name TEXT,
                created_at TEXT NOT NULL
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_community_district ON community_reports(district)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_diagnosis_user ON diagnosis_history(user_id)")

        # Seed initial regional outbreak alerts if empty
        count = conn.execute("SELECT COUNT(*) FROM community_reports").fetchone()[0]
        if count == 0:
            now = datetime.utcnow().isoformat() + "Z"
            seed_alerts = [
                (
                    "system", "KVK Pathologist", "Kolar", "Srinivaspur", "Ronur",
                    "Tomato", "Early Blight",
                    "Early Blight Cluster Detected in Solanaceous Plots",
                    "Target-spot concentric rings observed on lower leaves of hybrid tomato crops following high humidity mornings. Preventive Mancozeb 75 WP (2g/L) recommended.",
                    "High", 14, 1, now
                ),
                (
                    "system", "District Agronomist", "Mandya", "Maddur", "Koppa",
                    "Sugarcane", "Woolly Aphid",
                    "Sugarcane Woolly Aphid (Ceratovacuna lanigera) Flare-up",
                    "White waxy colonies observed on lower leaf surface under Shimsha canal belt. Release Encarsia flavoscutellum parasitoids or spray Chlorpyrifos 20 EC (2ml/L).",
                    "Moderate", 9, 1, now
                ),
                (
                    "system", "Horticulture Officer", "Mysuru", "Nanjangud", "Biligere",
                    "Banana", "Sigatoka Leaf Spot",
                    "Yellow Sigatoka Leaf Streaks Observed on Kapila River Plots",
                    "Spindle and mature leaves showing dark brown necrotic streaks with grey centers. De-leaf infected foliage and spray Propiconazole 25 EC (1ml/L).",
                    "High", 12, 1, now
                ),
                (
                    "system", "KVK Agronomist", "Davangere", "Harihara", "Malebennur",
                    "Maize", "Fall Armyworm",
                    "Fall Armyworm (Spodoptera frugiperda) Whorl Damage Notice",
                    "Pinholes and sawdust frass found inside central whorls of 25-day-old hybrid maize. Apply Chlorantraniliprole 18.5 SC (0.4ml/L) whorl direct spray.",
                    "High", 18, 1, now
                ),
                (
                    "system", "Senior Extension Specialist", "Hassan", "Channarayapatna", "Shravanabelagola",
                    "Potato", "Late Blight",
                    "Late Blight Pre-warning for Kharif Table Potato",
                    "Cool misty morning conditions favor Phytophthora infestans zoospore germination. Apply prophylactic Mancozeb or Cymoxanil + Mancozeb if dew persists.",
                    "High", 16, 1, now
                ),
                (
                    "system", "District Biosecurity Desk", "Belagavi", "Chikkodi", "Nipani",
                    "Soybean", "Soybean Rust",
                    "Soybean Rust (Phakopsora pachyrhizi) Vigilance Alert",
                    "Brown-tan pustules recorded on bottom canopy leaves in Krishna basin. Hexaconazole 5 EC (1ml/L) advised at flowering stage.",
                    "Moderate", 7, 1, now
                ),
                (
                    "system", "Dryland Farming Center", "Tumakuru", "Tiptur", "Nonavinakere",
                    "Coconut", "Black-headed Caterpillar",
                    "Coconut Black-headed Caterpillar (Opisina arenosella) Activity",
                    "Dried leaflet patches on lower fronds observed. Release Goniozus nephantidis larval parasitoids immediately.",
                    "Moderate", 11, 1, now
                )
            ]
            conn.executemany("""
                INSERT INTO community_reports (
                    farmer_id, author_name, district, taluk, village,
                    crop_name, disease_name, warning_title, warning_message,
                    severity, upvotes, is_active, detected_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, seed_alerts)

        # Seed initial farm diagnosis history if empty
        diag_count = conn.execute("SELECT COUNT(*) FROM diagnosis_history").fetchone()[0]
        if diag_count == 0:
            now_diag = datetime.utcnow().isoformat() + "Z"
            seed_diags = [
                ("demo_farmer", "Tomato", "Early Blight", 98.4, "tomato_early_blight.jpg", now_diag),
                ("demo_farmer", "Rice / Paddy", "Blast (Magnaporthe oryzae)", 96.2, "paddy_blast.jpg", now_diag),
                ("demo_farmer", "Chilli / Pepper", "Leaf Curl Virus", 94.7, "chilli_leaf_curl.jpg", now_diag),
            ]
            conn.executemany("""
                INSERT INTO diagnosis_history (user_id, crop, disease, confidence, image_name, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, seed_diags)
    conn.close()

# Auto-initialize tables
init_community_db()

def get_community_reports(district: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieves all active community reports, optionally filtered by district."""
    conn = get_db()
    try:
        if district and district.strip().lower() != 'all':
            dist = district.strip()
            rows = conn.execute("""
                SELECT * FROM community_reports 
                WHERE is_active = 1 AND (LOWER(district) = LOWER(?) OR LOWER(district) LIKE LOWER(?))
                ORDER BY detected_at DESC
            """, (dist, f"%{dist}%")).fetchall()
        else:
            rows = conn.execute("""
                SELECT * FROM community_reports 
                WHERE is_active = 1
                ORDER BY detected_at DESC
            """).fetchall()

        return [dict(r) for r in rows]
    finally:
        conn.close()

def add_community_report(data: Dict[str, Any]) -> Dict[str, Any]:
    """Inserts a new farmer outbreak report."""
    now = datetime.utcnow().isoformat() + "Z"
    district = data.get("district", "Kolar").strip()
    crop_name = data.get("crop_name", "Crop").strip()
    disease_name = data.get("disease_name", "Observation").strip()
    warning_title = data.get("warning_title") or f"{crop_name} Outbreak: {disease_name}"
    warning_message = data.get("warning_message", "").strip()
    author_name = data.get("author_name") or "Local Farmer"
    taluk = data.get("taluk", "").strip()
    village = data.get("village", "").strip()
    severity = data.get("severity", "Moderate")
    farmer_id = data.get("farmer_id", "anonymous")

    conn = get_db()
    try:
        with conn:
            cursor = conn.execute("""
                INSERT INTO community_reports (
                    farmer_id, author_name, district, taluk, village,
                    crop_name, disease_name, warning_title, warning_message,
                    severity, upvotes, is_active, detected_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?)
            """, (farmer_id, author_name, district, taluk, village, crop_name, disease_name, warning_title, warning_message, severity, now))
            new_id = cursor.lastrowid
            
        row = conn.execute("SELECT * FROM community_reports WHERE id = ?", (new_id,)).fetchone()
        return dict(row) if row else {}
    finally:
        conn.close()

def upvote_community_report(report_id: int) -> int:
    """Increments the helpfulness count of a community report."""
    conn = get_db()
    try:
        with conn:
            conn.execute("UPDATE community_reports SET upvotes = upvotes + 1 WHERE id = ?", (report_id,))
            row = conn.execute("SELECT upvotes FROM community_reports WHERE id = ?", (report_id,)).fetchone()
            return row[0] if row else 0
    finally:
        conn.close()

def save_diagnosis_history(user_id: str, crop: str, disease: str, confidence: float, image_name: str = "") -> Dict[str, Any]:
    """Records a leaf diagnosis into the farmer's history."""
    now = datetime.utcnow().isoformat() + "Z"
    conn = get_db()
    try:
        with conn:
            cursor = conn.execute("""
                INSERT INTO diagnosis_history (user_id, crop, disease, confidence, image_name, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user_id, crop, disease, confidence, image_name, now))
            new_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM diagnosis_history WHERE id = ?", (new_id,)).fetchone()
        return dict(row) if row else {}
    finally:
        conn.close()

def get_diagnosis_history(user_id: str = "", limit: int = 20) -> List[Dict[str, Any]]:
    """Fetches recent disease diagnoses for a given farmer or returns recent history."""
    conn = get_db()
    try:
        if user_id and user_id != "all":
            rows = conn.execute("""
                SELECT * FROM diagnosis_history 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ?
            """, (user_id, limit)).fetchall()
            if rows:
                return [dict(r) for r in rows]
        
        # Fallback to recent diagnoses so the UI always has diagnostic records
        rows = conn.execute("""
            SELECT * FROM diagnosis_history 
            ORDER BY created_at DESC 
            LIMIT ?
        """, (limit,)).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

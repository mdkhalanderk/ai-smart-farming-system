"""
Secure SQLite-backed Farmer Authentication & Profile Service for FastAPI.
Provides genuine, server-side authentication with salted PBKDF2-HMAC-SHA256 password hashing,
session token management, and profile persistence.
"""

import sqlite3
import hashlib
import secrets
import os
import re
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from pathlib import Path

DB_PATH = Path(__file__).parent / "farmer_auth.db"

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_auth_db():
    """Initializes the users, profiles, and sessions tables."""
    conn = get_db()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id TEXT PRIMARY KEY,
                user_id TEXT UNIQUE NOT NULL,
                full_name TEXT,
                phone TEXT,
                mobile_number TEXT,
                district TEXT,
                state TEXT,
                primary_crops TEXT,
                main_crop TEXT,
                preferred_language TEXT,
                land_size TEXT,
                farming_type TEXT,
                experience_years INTEGER,
                updated_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)
        cols_cursor = conn.execute("PRAGMA table_info(profiles)")
        existing_cols = {r[1] for r in cols_cursor.fetchall()}
        for col in ["mobile_number", "main_crop", "preferred_language", "taluk", "village"]:
            if col not in existing_cols:
                conn.execute(f"ALTER TABLE profiles ADD COLUMN {col} TEXT")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)")
    conn.close()

# Auto-initialize on module load
init_auth_db()

def _hash_password(password: str, salt: bytes) -> str:
    """Derives a secure cryptographic PBKDF2-HMAC-SHA256 hash using 100,000 iterations."""
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return derived.hex()

def _generate_salt() -> bytes:
    return os.urandom(16)

def register_user(email: str, password: str, extra_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Registers a new farmer with salted hash and creates their default profile."""
    email = email.strip().lower()
    if not email or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise ValueError("Invalid email address format.")
    
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters long.")
    
    extra = extra_data or {}
    conn = get_db()
    try:
        with conn:
            # Check existing email
            cursor = conn.execute("SELECT id FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                raise ValueError("An account with this email address already exists. Please log in.")

            user_id = secrets.token_hex(16)
            salt_bytes = _generate_salt()
            salt_hex = salt_bytes.hex()
            pw_hash = _hash_password(password, salt_bytes)
            now_iso = datetime.utcnow().isoformat() + "Z"

            conn.execute(
                "INSERT INTO users (id, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)",
                (user_id, email, pw_hash, salt_hex, now_iso)
            )

            # Insert initial profile
            profile_id = secrets.token_hex(16)
            phone_val = extra.get("mobile_number") or extra.get("phone") or ""
            crop_val = extra.get("main_crop") or extra.get("primary_crops") or "Rice / Paddy"
            lang_val = extra.get("preferred_language") or "English"
            conn.execute(
                """
                INSERT INTO profiles (
                    id, user_id, full_name, phone, mobile_number, district, state,
                    primary_crops, main_crop, preferred_language, land_size, farming_type, experience_years, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    profile_id,
                    user_id,
                    extra.get("full_name") or "Farmer",
                    phone_val,
                    phone_val,
                    extra.get("district") or "Kolar",
                    extra.get("state") or "Karnataka",
                    crop_val,
                    crop_val,
                    lang_val,
                    extra.get("land_size") or "2.5 Acres",
                    extra.get("farming_type") or "Integrated",
                    int(extra.get("experience_years") or 5),
                    now_iso
                )
            )

            # Create session token (valid 30 days)
            token = secrets.token_urlsafe(32)
            expires_at = (datetime.utcnow() + timedelta(days=30)).isoformat() + "Z"
            conn.execute(
                "INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
                (token, user_id, expires_at, now_iso)
            )

            return {
                "user": {"id": user_id, "email": email, "created_at": now_iso},
                "session": {"access_token": token, "expires_at": expires_at, "token_type": "bearer"},
                "profile": get_profile_by_user_id(user_id)
            }
    finally:
        conn.close()

def login_user(email: str, password: str) -> Dict[str, Any]:
    """Authenticates a farmer, validates password hash, and issues a session token."""
    email = email.strip().lower()
    password = password.strip()
    conn = get_db()
    try:
        cursor = conn.execute("SELECT id, email, password_hash, salt, created_at FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        if not row:
            raise ValueError("Invalid email or password.")
        
        user_id = row["id"]
        salt_bytes = bytes.fromhex(row["salt"])
        expected_hash = row["password_hash"]

        computed_hash = _hash_password(password, salt_bytes)
        if not secrets.compare_digest(computed_hash, expected_hash):
            raise ValueError("Invalid email or password.")
        
        # Create session token (valid 30 days)
        now_iso = datetime.utcnow().isoformat() + "Z"
        token = secrets.token_urlsafe(32)
        expires_at = (datetime.utcnow() + timedelta(days=30)).isoformat() + "Z"

        with conn:
            conn.execute(
                "INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
                (token, user_id, expires_at, now_iso)
            )

        return {
            "user": {"id": user_id, "email": email, "created_at": row["created_at"]},
            "session": {"access_token": token, "expires_at": expires_at, "token_type": "bearer"},
            "profile": get_profile_by_user_id(user_id)
        }
    finally:
        conn.close()

def reset_password(email: str, new_password: str) -> Dict[str, Any]:
    """Updates password for an existing registered farmer and generates a fresh session."""
    email = email.strip().lower()
    new_password = new_password.strip()
    if len(new_password) < 6:
        raise ValueError("New password must be at least 6 characters long.")
    
    conn = get_db()
    try:
        with conn:
            cursor = conn.execute("SELECT id FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if not row:
                raise ValueError("No account found with this email address.")
            
            user_id = row["id"]
            salt_bytes = _generate_salt()
            salt_hex = salt_bytes.hex()
            pw_hash = _hash_password(new_password, salt_bytes)
            
            conn.execute(
                "UPDATE users SET password_hash = ?, salt = ? WHERE id = ?",
                (pw_hash, salt_hex, user_id)
            )
            # Invalidate old sessions
            conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
            
            # Issue a new active session token so the user is immediately authenticated
            now_iso = datetime.utcnow().isoformat() + "Z"
            token = secrets.token_urlsafe(32)
            expires_at = (datetime.utcnow() + timedelta(days=30)).isoformat() + "Z"
            conn.execute(
                "INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
                (token, user_id, expires_at, now_iso)
            )
            
            return {
                "status": "success",
                "message": "Password updated successfully.",
                "user": {"id": user_id, "email": email, "created_at": now_iso},
                "session": {"access_token": token, "expires_at": expires_at, "token_type": "bearer"},
                "profile": get_profile_by_user_id(user_id)
            }
    finally:
        conn.close()

def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """Retrieves authenticated user from active session token."""
    if not token:
        return None
    conn = get_db()
    try:
        cursor = conn.execute(
            """
            SELECT s.token, s.expires_at, u.id, u.email, u.created_at
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = ?
            """,
            (token,)
        )
        row = cursor.fetchone()
        if not row:
            return None
        
        # Check expiry
        now_iso = datetime.utcnow().isoformat() + "Z"
        if row["expires_at"] < now_iso:
            with conn:
                conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
            return None
        
        return {
            "id": row["id"],
            "email": row["email"],
            "created_at": row["created_at"]
        }
    finally:
        conn.close()

def logout_user(token: str) -> bool:
    """Invalidates active session token."""
    if not token:
        return True
    conn = get_db()
    try:
        with conn:
            conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        return True
    finally:
        conn.close()

def get_profile_by_user_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves farmer profile by user_id with synchronized alias fields."""
    conn = get_db()
    try:
        cursor = conn.execute("SELECT * FROM profiles WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            # Auto-create profile row for existing user if missing
            user_check = conn.execute("SELECT email FROM users WHERE id = ?", (user_id,)).fetchone()
            if user_check:
                now_iso = datetime.utcnow().isoformat() + "Z"
                new_profile_id = secrets.token_hex(16)
                with conn:
                    conn.execute(
                        """
                        INSERT INTO profiles (
                            id, user_id, full_name, phone, mobile_number, district, state,
                            primary_crops, main_crop, preferred_language, land_size, farming_type, experience_years, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (new_profile_id, user_id, "Farmer", "", "", "Kolar", "Karnataka", "Rice / Paddy", "Rice / Paddy", "English", "2.5 Acres", "Integrated", 5, now_iso)
                    )
                cursor = conn.execute("SELECT * FROM profiles WHERE user_id = ?", (user_id,))
                row = cursor.fetchone()

        if not row:
            return None
        d = dict(row)
        
        # Synchronize and normalize alias fields
        phone_val = d.get("mobile_number") or d.get("phone") or ""
        crop_val = d.get("main_crop") or d.get("primary_crops") or "Rice / Paddy"
        lang_val = d.get("preferred_language") or "English"

        d["phone"] = phone_val
        d["mobile_number"] = phone_val
        d["primary_crops"] = crop_val
        d["main_crop"] = crop_val
        d["preferred_language"] = lang_val
        return d
    finally:
        conn.close()

def update_profile(user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Updates farmer profile fields with robust alias synchronization."""
    allowed_fields = {
        "full_name", "phone", "district", "taluk", "village", "state", "primary_crops",
        "land_size", "farming_type", "experience_years",
        "mobile_number", "main_crop", "preferred_language"
    }
    filtered = {k: v for k, v in updates.items() if k in allowed_fields}
    if not filtered:
        return get_profile_by_user_id(user_id) or {}

    # Synchronize alias fields so both columns stay identical
    if "mobile_number" in filtered and filtered["mobile_number"]:
        filtered["phone"] = filtered["mobile_number"]
    elif "phone" in filtered and filtered["phone"]:
        filtered["mobile_number"] = filtered["phone"]

    if "main_crop" in filtered and filtered["main_crop"]:
        filtered["primary_crops"] = filtered["main_crop"]
    elif "primary_crops" in filtered and filtered["primary_crops"]:
        filtered["main_crop"] = filtered["primary_crops"]

    filtered["updated_at"] = datetime.utcnow().isoformat() + "Z"

    # Inspect current columns in profiles table
    conn = get_db()
    try:
        cols_cursor = conn.execute("PRAGMA table_info(profiles)")
        existing_cols = {r[1] for r in cols_cursor.fetchall()}
        
        # Ensure any missing columns are added on the fly
        with conn:
            for col in ["mobile_number", "main_crop", "preferred_language", "taluk", "village"]:
                if col not in existing_cols:
                    conn.execute(f"ALTER TABLE profiles ADD COLUMN {col} TEXT")
                    existing_cols.add(col)

            # Check if profile row exists for this user_id; if not, create initial row
            row_check = conn.execute("SELECT id FROM profiles WHERE user_id = ?", (user_id,)).fetchone()
            if not row_check:
                new_profile_id = secrets.token_hex(16)
                conn.execute(
                    "INSERT INTO profiles (id, user_id, updated_at) VALUES (?, ?, ?)",
                    (new_profile_id, user_id, filtered["updated_at"])
                )

            # Only update columns that actually exist in the table
            valid_updates = {k: v for k, v in filtered.items() if k in existing_cols}
            if valid_updates:
                set_clause = ", ".join(f"{k} = ?" for k in valid_updates.keys())
                values = list(valid_updates.values()) + [user_id]
                conn.execute(f"UPDATE profiles SET {set_clause} WHERE user_id = ?", values)

        return get_profile_by_user_id(user_id) or {}
    finally:
        conn.close()


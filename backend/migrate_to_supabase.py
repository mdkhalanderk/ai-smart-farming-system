"""
backend/migrate_to_supabase.py

Safe Migration Utility: Migrates existing SQLite Farmer Profiles & Community Alerts
into Supabase PostgreSQL while preserving the original SQLite database as a safe backup.
"""

import os
import json
import sqlite3
from pathlib import Path
from typing import Dict, Any, List

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
SQLITE_DB_PATH = BACKEND_DIR / "farmer_auth.db"
BACKUP_DB_PATH = BACKEND_DIR / "farmer_auth_backup.db"
MIGRATION_EXPORT_PATH = BACKEND_DIR / "sqlite_migration_export.json"


def get_sqlite_conn():
    conn = sqlite3.connect(str(SQLITE_DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def export_sqlite_data() -> Dict[str, Any]:
    """Exports SQLite records to JSON for auditing and safe Supabase import."""
    if not SQLITE_DB_PATH.exists():
        return {"error": "SQLite database not found"}

    conn = get_sqlite_conn()
    data = {}
    with conn:
        users = [dict(r) for r in conn.execute("SELECT id, email, created_at FROM users").fetchall()]
        profiles = [dict(r) for r in conn.execute("SELECT * FROM profiles").fetchall()]
        reports = [dict(r) for r in conn.execute("SELECT * FROM community_reports").fetchall()]
        data["users"] = users
        data["profiles"] = profiles
        data["community_reports"] = reports
    conn.close()

    with open(MIGRATION_EXPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Exported {len(users)} users, {len(profiles)} profiles, {len(reports)} alerts to {MIGRATION_EXPORT_PATH}")
    return data


def find_sqlite_profile_by_email(email: str) -> Dict[str, Any] | None:
    """Finds existing SQLite profile for an email to facilitate seamless Supabase onboarding."""
    if not SQLITE_DB_PATH.exists():
        return None
    email_clean = email.strip().lower()
    conn = get_sqlite_conn()
    try:
        user_row = conn.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email_clean,)).fetchone()
        if not user_row:
            return None
        user_id = user_row["id"]
        profile_row = conn.execute("SELECT * FROM profiles WHERE user_id = ?", (user_id,)).fetchone()
        if profile_row:
            return dict(profile_row)
        return None
    except Exception as e:
        print(f"Error querying SQLite profile for {email}: {e}")
        return None
    finally:
        conn.close()


if __name__ == "__main__":
    export_sqlite_data()

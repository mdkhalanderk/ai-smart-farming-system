"""
Unified Database Compatibility Layer (SQLite locally + PostgreSQL via DATABASE_URL in Cloud).
Automatically translates SQLite-style '?' placeholders, 'INSERT OR IGNORE', 'AUTOINCREMENT',
'PRAGMA table_info', and dict/index row access when DATABASE_URL is configured.
"""

import os
import re
import sqlite3
from pathlib import Path
from typing import Any, Iterable, Optional

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    psycopg2 = None


def get_database_url() -> str:
    url = os.getenv("DATABASE_URL", "").strip()
    # Handle accidental 'psql ...' or 'DATABASE_URL=...' paste
    m = re.search(r"(postgres(?:ql)?://[^\s'\"]+|//[^\s'\"]+)", url)
    if m:
        url = m.group(1)
    url = url.strip().strip('"').strip("'")
    if url.startswith("//"):
        url = "postgresql:" + url
    elif url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    # Remove channel_binding=require if present for maximum libpq compatibility
    url = re.sub(r"[?&]channel_binding=[^&]*", "", url)
    if "?" not in url and "&" in url:
        url = url.replace("&", "?", 1)
    return url


def is_postgres_enabled() -> bool:
    return bool(get_database_url()) and psycopg2 is not None


class CompatRow(dict):
    """Row object supporting both dict key lookup (row['col']) and positional indexing (row[0])."""
    def __init__(self, ordered_items):
        super().__init__(ordered_items)
        self._values = [v for _, v in ordered_items]

    def __getitem__(self, key):
        if isinstance(key, int):
            return self._values[key]
        return super().__getitem__(key)


class CompatCursor:
    def __init__(self, cur, description_cols=None):
        self._cur = cur
        self._cols = description_cols

    def _wrap_row(self, row):
        if row is None:
            return None
        if isinstance(row, dict):
            return CompatRow(list(row.items()))
        if self._cur.description:
            cols = [d[0] for d in self._cur.description]
            return CompatRow(list(zip(cols, row)))
        return row

    def fetchone(self):
        return self._wrap_row(self._cur.fetchone())

    def fetchall(self):
        return [self._wrap_row(r) for r in self._cur.fetchall()]

    @property
    def lastrowid(self):
        return getattr(self._cur, "lastrowid", None)


def _translate_sql_to_postgres(sql: str) -> str:
    s = sql.strip()

    # Translate PRAGMA table_info(table_name)
    pragma_match = re.match(r"PRAGMA\s+table_info\s*\(\s*([a-zA-Z0-9_]+)\s*\)", s, re.IGNORECASE)
    if pragma_match:
        tbl = pragma_match.group(1).lower()
        return (
            "SELECT ordinal_position AS cid, column_name AS name, data_type AS type "
            f"FROM information_schema.columns WHERE table_name = '{tbl}'"
        )

    # Translate sqlite_master check
    if "sqlite_master" in s:
        s = re.sub(
            r"SELECT\s+1\s+FROM\s+sqlite_master\s+WHERE\s+type='table'\s+AND\s+name='([^']+)'",
            r"SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='\1'",
            s,
            flags=re.IGNORECASE,
        )

    s = re.sub(r"INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT", "SERIAL PRIMARY KEY", s, flags=re.IGNORECASE)
    s = re.sub(r"\s+COLLATE\s+NOCASE", "", s, flags=re.IGNORECASE)
    s = re.sub(r"datetime\s*\(\s*'now'\s*\)", "TO_CHAR(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')", s, flags=re.IGNORECASE)

    # INSERT OR IGNORE INTO ... -> INSERT INTO ... ON CONFLICT DO NOTHING
    if re.search(r"INSERT\s+OR\s+IGNORE\s+INTO", s, re.IGNORECASE):
        s = re.sub(r"INSERT\s+OR\s+IGNORE\s+INTO", "INSERT INTO", s, flags=re.IGNORECASE)
        if "ON CONFLICT" not in s.upper():
            s = s.rstrip(";") + " ON CONFLICT DO NOTHING"

    # Replace ? placeholders outside single-quoted string literals with %s
    out = []
    in_quote = False
    i = 0
    while i < len(s):
        ch = s[i]
        if ch == "'":
            in_quote = not in_quote
            out.append(ch)
        elif ch == "?" and not in_quote:
            out.append("%s")
        else:
            out.append(ch)
        i += 1
    return "".join(out)


class CompatPgConnection:
    def __init__(self, dsn: str):
        self._conn = psycopg2.connect(dsn)
        self._conn.autocommit = False

    def execute(self, sql: str, params: Optional[Iterable[Any]] = None) -> CompatCursor:
        pg_sql = _translate_sql_to_postgres(sql)
        cur = self._conn.cursor()
        if params is not None:
            cur.execute(pg_sql, tuple(params))
        else:
            cur.execute(pg_sql)
        return CompatCursor(cur)

    def executemany(self, sql: str, seq_of_params: Iterable[Iterable[Any]]) -> CompatCursor:
        pg_sql = _translate_sql_to_postgres(sql)
        cur = self._conn.cursor()
        cur.executemany(pg_sql, [tuple(p) for p in seq_of_params])
        return CompatCursor(cur)

    def cursor(self):
        return self._conn.cursor()

    @property
    def row_factory(self):
        return None

    @row_factory.setter
    def row_factory(self, val):
        pass

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        try:
            self._conn.close()
        except Exception:
            pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self._conn.rollback()
        else:
            self._conn.commit()
        return False


def get_db_connection(sqlite_path: Path):
    """Returns a PostgreSQL connection if DATABASE_URL is configured, otherwise SQLite."""
    dsn = get_database_url()
    if dsn and psycopg2 is not None:
        return CompatPgConnection(dsn)
    conn = sqlite3.connect(str(sqlite_path))
    conn.row_factory = sqlite3.Row
    return conn

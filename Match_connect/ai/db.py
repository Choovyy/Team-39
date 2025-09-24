import os
import logging
from contextlib import contextmanager

try:
    import mysql.connector  # lightweight direct connector
except ImportError:  # Fallback / guidance
    mysql = None

logger = logging.getLogger(__name__)

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_NAME = os.getenv("DB_NAME", "dbspear")

@contextmanager
def get_conn():
    conn = None
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            auth_plugin='mysql_native_password'
        )
        yield conn
    finally:
        if conn:
            conn.close()

def get_user_name_by_email(email: str):
    """Return (firstname, lastname, full_name) for given email or (None,None,None)."""
    if not email:
        return None, None, None
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            # Table & column names derived from JPA @Table(name="users") fields firstname / lastname / email
            cur.execute("SELECT firstname, lastname FROM users WHERE email = %s LIMIT 1", (email,))
            row = cur.fetchone()
            cur.close()
            if row:
                fn, ln = row
                full = f"{fn or ''} {ln or ''}".strip()
                return fn, ln, full or None
    except Exception as e:
        logger.error(f"DB error fetching user name for {email}: {e}")
    return None, None, None

def get_bulk_names(emails):
    """Return dict email -> full_name for list of emails. Ignores those not found."""
    result = {}
    unique = [e for e in set(emails) if e]
    if not unique:
        return result
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            # Build placeholder list
            placeholders = ",".join(["%s"] * len(unique))
            query = f"SELECT email, firstname, lastname FROM users WHERE email IN ({placeholders})"
            cur.execute(query, tuple(unique))
            for email, fn, ln in cur.fetchall():
                full = f"{fn or ''} {ln or ''}".strip()
                result[email] = full
            cur.close()
    except Exception as e:
        logger.error(f"DB bulk name lookup failed: {e}")
    return result

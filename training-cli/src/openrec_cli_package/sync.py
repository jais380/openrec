import sqlite3
import httpx
from openrec_cli_package.http import get_client

fetch_cursor = """
    SELECT last_sync_timestamp FROM sync_state WHERE project_id = ?;
"""

def get_cursor(conn: sqlite3.Connection, project_id: str) -> str | None:
    cursor = conn.execute(fetch_cursor, (project_id,)).fetchone()
    return cursor

def run_sync(conn: sqlite3.Connection, client: httpx.Client, project_id: str, base_url: str):
    cursor = get_cursor(conn, project_id)
    if cursor is None:
        fetch_page(base_url)

def fetch_page(base_url: str):
    get_client(base_url)

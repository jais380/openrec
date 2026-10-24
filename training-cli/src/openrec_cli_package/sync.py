import sqlite3
import httpx
from openrec_cli_package.http import get_client

fetch_cursor = """
    SELECT last_sync_timestamp FROM sync_state WHERE project_id = ?;
"""

def get_cursor(conn: sqlite3.Connection, project_id: str) -> str | None:
    cursor = conn.execute(fetch_cursor, (project_id,)).fetchone()
    return cursor

def run_sync(conn: sqlite3.Connection, client: httpx.Client, project_id: str, limit: int):
    cursor = get_cursor(conn, project_id)
    print(cursor)
    resp = fetch_page(client, project_id, cursor, limit)
    print(resp)

def fetch_page(client: httpx.Client, project_id: str, cursor: str | None, limit: int) -> dict:
    params = { "projectId": project_id }
    if cursor is not None:
        params["modifiedSince"] = cursor
    elif limit is not None:
        params["limit"] = limit

    print(params)
    resp = client.request("GET", "/api/sync/delta", params=params)
    print(resp)

    resp.raise_for_status()
    result = resp.json()

    return { "data": result["data"], "count": result["count"], "next_cursor": result["nextCursor"] }

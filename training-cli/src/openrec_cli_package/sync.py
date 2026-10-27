import sqlite3
import httpx

FETCH_CURSOR = """
    SELECT last_sync_timestamp FROM sync_state WHERE project_id = ?;
"""

UPSERT_EVENT = """
    INSERT INTO interactions (id, project_id, user_id, item_id, event_type, interaction_value, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
"""

UPSERT_CURSOR = """
    INSERT INTO sync_state (project_id, last_sync_timestamp) VALUES (?, ?)
    ON CONFLICT(project_id) DO UPDATE
    SET last_sync_timestamp = excluded.last_sync_timestamp
    WHERE excluded.last_sync_timestamp > sync_state.last_sync_timestamp
"""

def get_cursor(conn: sqlite3.Connection, project_id: str) -> str | None:
    cursor = conn.execute(FETCH_CURSOR, (project_id,)).fetchone()
    return cursor

def run_sync(conn: sqlite3.Connection, client: httpx.Client, project_id: str, limit: int):
    has_next_page = True
    new_limit = limit

    while has_next_page is True:
        cursor = get_cursor(conn, project_id)
        previous_cursor = cursor

        resp = fetch_page(client, project_id, cursor, new_limit)
        events = resp["data"]
        next_cursor = resp["next_cursor"]
        count = resp["count"]
        has_next_page = resp["has_next_page"]

        new_cursor = next_cursor

        if len(events) > 0:
            idMatchCount = store_page(conn, project_id, events, next_cursor, count)

            if previous_cursor is not None:
                if has_next_page is True and idMatchCount == new_limit and previous_cursor[0] == new_cursor:
                    new_limit = new_limit + 100

def fetch_page(client: httpx.Client, project_id: str, cursor: str | None, limit: int) -> dict:
    params = { "projectId": project_id }
    if cursor is not None:
        params["modifiedSince"] = cursor
    if limit is not None:
        params["limit"] = limit

    resp = client.request("GET", "/api/sync/delta", params=params)

    resp.raise_for_status()
    result = resp.json()

    return { "data": result["data"], "count": result["count"], "next_cursor": result["nextCursor"], "has_next_page": result["hasNextPage"] }

def store_page(conn: sqlite3.Connection, project_id: str, events: list, next_cursor: str | None, count: int) -> dict:
    with conn:
        rows = []

        for e in events:
            id = e["id"]
            user_id = e["userId"]
            item_id = e["itemId"]
            event_type = e["eventType"]
            interaction_value = e["interactionValue"]
            timestamp = e["createdAt"]

            if project_id != e["projectId"]:
                print("Project_id mismatch, ending sync...")
                raise ValueError

            event = (id, project_id, user_id, item_id, event_type, interaction_value, timestamp)
            rows.append(event)

        conn.executemany(UPSERT_EVENT, rows)

        ids = [r[0] for r in rows]
        marks = ",".join("?" * len(ids))
        found = conn.execute(
            f"SELECT COUNT(*) FROM interactions WHERE id IN ({marks})", ids
        ).fetchone()[0]
        if found != len(set(ids)):
            raise ValueError("page not fully stored")

        if next_cursor is not None:
            last_sync_timestamp = next_cursor
            conn.execute(UPSERT_CURSOR, (project_id, last_sync_timestamp))

        return found

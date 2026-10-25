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
    cursor = get_cursor(conn, project_id)
    print(cursor)
    resp = fetch_page(client, project_id, cursor, limit)
    events = resp["data"]
    next_cursor = resp["next_cursor"]
    count = resp["count"]
    has_next_page = resp["has_next_page"]

    if len(events) > 0:
        updated_event_count = store_page(conn, project_id, events, next_cursor, count, has_next_page)


def fetch_page(client: httpx.Client, project_id: str, cursor: str | None, limit: int) -> dict:
    params = { "projectId": project_id }
    if cursor is not None:
        params["modifiedSince"] = cursor
    elif limit is not None:
        params["limit"] = limit

    resp = client.request("GET", "/api/sync/delta", params=params)

    resp.raise_for_status()
    result = resp.json()

    return { "data": result["data"], "count": result["count"], "next_cursor": result["nextCursor"], "has_next_page": result["hasNextPage"] }

def store_page(conn: sqlite3.Connection, project_id: str, events: list, next_cursor: str | None, count: int, has_next_page: bool) -> int:
    with conn:
        rows = []

        for e in events:
            id = e["id"]
            user_id = e["userId"]
            item_id = e["itemId"]
            event_type = e["eventType"]
            interaction_value = e["interactionValue"]
            timestamp = e["createdAt"]

            print(e["projectId"], project_id)

            if project_id != e["projectId"]:
                print("Project_id mismatch, ending sync...")
                raise ValueError

            event = (id, project_id, user_id, item_id, event_type, interaction_value, timestamp)
            rows.append(event)

        before_write = conn.total_changes
        print(f"Changes made before write - {before_write}")

        conn.executemany(UPSERT_EVENT, rows)

        after_write = conn.total_changes
        print(f"Changes made after write - {after_write}")


        if next_cursor is not None:
            last_sync_timestamp = next_cursor
            conn.execute(UPSERT_CURSOR, (project_id, last_sync_timestamp))

        if after_write < count:
            new_event_count = after_write
            repeated_event_count = count - after_write

            print(new_event_count, repeated_event_count)

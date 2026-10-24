import sqlite3
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS interactions (
    id                TEXT PRIMARY KEY,      -- the server's UUID
    project_id        TEXT NOT NULL,
    user_id           TEXT NOT NULL,
    item_id           TEXT NOT NULL,
    event_type        TEXT NOT NULL,
    interaction_value REAL NOT NULL,
    timestamp         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_interactions_project_ts
    ON interactions (project_id, timestamp);

CREATE TABLE IF NOT EXISTS sync_state (
    project_id          TEXT PRIMARY KEY,
    last_sync_timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS checkpoint_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id     TEXT NOT NULL,
    stage      TEXT NOT NULL,       -- 'sync' | 'train' | 'push'
    status     TEXT NOT NULL,       -- 'started' | 'completed' | 'failed'
    payload    TEXT,                -- JSON string: progress details
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""

def get_connection(db_path: str | Path) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    return conn

def init_db(db_path: str | Path) -> None:
    with get_connection(db_path) as conn:
        try:
            conn.executescript(SCHEMA)
        finally:
            conn.close()

def openrec_db(db_path: str) -> sqlite3.Connection:
    conn = get_connection(db_path)
    conn.executescript(SCHEMA)
    return conn

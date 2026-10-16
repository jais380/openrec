import sqlite3
from openrec_cli_package.db import init_db

def test_init_db_creates_tables(tmp_path):
    db_file = tmp_path / "test.db"
    init_db(db_file)

    conn = sqlite3.connect(db_file)
    tables = {
        row[0]
        for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
    }

    assert {"interactions", "sync_state", "checkpoint_logs"} <= tables

def test_init_db_is_idempotent(tmp_path):
    db_file = tmp_path / "test.db"

    init_db(db_file)
    init_db(db_file) # Must not crash the test

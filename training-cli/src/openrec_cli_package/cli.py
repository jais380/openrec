import typer
from openrec_cli_package.db import init_db, openrec_db
from openrec_cli_package.sync import get_cursor, run_sync
from openrec_cli_package.http import get_client
from dotenv import load_dotenv

load_dotenv()

app = typer.Typer(help="openrec training CLI")

@app.command()
def sync(
    project_id: str = typer.Option(..., help="Project to sync"),
    server_url: str = typer.Option("http://127.0.0.1:4002", envvar="OPENREC_SERVER_URL"),
    db_path: str = typer.Option("openrec.db", envvar="OPENREC_DB_PATH"),
    limit: int = typer.Option(500, envvar="OPENREC_SYNC_LIMIT")
):
    if limit > 500:
        typer.echo(f"{limit} limit is too large, adjusting to {500}...")
        limit = 500

    with openrec_db(db_path) as conn:
        """Pull new interaction events from the ingestion server"""
        typer.echo(f"Syncing project {project_id} from {server_url}...")

        client = get_client(server_url)
        print(client)
        result = run_sync(conn, client, project_id, limit)
        return result

@app.command()
def train(
    project_id: str = typer.Option(...)
):
    """Train the model on the local cache"""
    typer.echo(f"Training project {project_id}")

@app.command()
def push(
    project_id: str = typer.Option(...)
):
    """Push generated recommendations to the server"""
    typer.echo(f"Pushing project {project_id}")

@app.command()
def init(
    db_path: str = typer.Option("openrec.db", help="Path to the local SQLite file")
):
    """Create the local SQLite database and tables"""
    init_db(db_path)
    typer.echo(f"Initialized database at {db_path}")

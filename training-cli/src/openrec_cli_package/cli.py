import typer
from openrec_cli_package.db import init_db
from dotenv import load_dotenv

load_dotenv()

app = typer.Typer(help="openrec training CLI")

@app.command()
def sync(
    project_id: str = typer.Option(..., help="Project to sync"),
    server_url: str = typer.Option("http://localhost:4002", envvar="OPENREC_SERVER_URL")
):
    """Pull new interaction events from the ingestion server"""
    typer.echo(f"Syncing project {project_id} from {server_url}")

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

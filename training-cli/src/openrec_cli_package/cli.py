import typer

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

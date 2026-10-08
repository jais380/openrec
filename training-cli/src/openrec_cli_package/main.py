import typer
import sqlite3


def main(firstname: str, lastname: str = "", formal: bool = False):
    # Create sqlite3 db automatically
    sqlite3.connect("tutorial.db")

    """
        can send firstname with optional lastname. Note that lastname is whatever comes after --lastname
    """
    if formal:
        print(f"Good day Mr. {lastname} {firstname}")
    else:
        print(f"Hello {firstname} {lastname}")


if __name__ == "__main__":
    typer.run(main)

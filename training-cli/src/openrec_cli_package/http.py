import httpx
import os
from pathlib import Path
from dotenv import set_key

timeout = httpx.Timeout(connect=5, read=30, write=10, pool=5)

def create_or_update_env(key: str, secret: str) -> None:
    env_path = Path.cwd() / ".env"
    env_path.touch(exist_ok=True) # Creates .env file if it doesn't exist
    set_key(env_path, "OPENREC_API_KEY", key)
    set_key(env_path, "OPENREC_API_SECRET", secret)

def get_client(base_url: str) -> str:
    fetched_token = get_token(base_url)

    with httpx.Client(
        base_url=base_url,
        headers= { "Authorization": f"Bearer {fetched_token}" },
        timeout=timeout
    ) as client:
        return client

def get_token(base_url: str) -> str:
    with httpx.Client(
        base_url=base_url,
        timeout=timeout
    ) as client:
        try:
            api_key = os.environ.get("OPENREC_API_KEY", None)
            api_secret = os.environ.get("OPENREC_API_SECRET", None)

            if api_key is None or api_secret is None:
                data = register_user(client)

                api_key = data["apiKey"]
                api_secret = data["apiSecret"]

                create_or_update_env(api_key, api_secret)

            data2 = generate_token(client, api_key, api_secret)
            token: str = data2["token"]
            print(token)
        except Exception:
            raise Exception
    return token

def register_user(client: httpx.Client) -> dict:
    username = input("username: ")
    email = input("email: ")
    password = input("password: ")
    confirm_password = input("confirm password: ")

    resp = client.post("/api/auth/register", data={
        "username": username,
        "email": email,
        "password": password,
        "confirmPassword": confirm_password
    })

    resp.raise_for_status()
    result = resp.json()

    return result["data"]

def generate_token(client: httpx.Client, api_key: str, api_secret: str) -> dict:
    resp = client.post("/api/auth/token", headers={
        "x-api-key": api_key,
        "x-api-secret": api_secret,
    })

    resp.raise_for_status()
    result = resp.json()
    return result["data"]

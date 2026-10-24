import httpx
import os

timeout = httpx.Timeout(connect=5, read=30, write=10, pool=5)

api_key = os.environ.get("API_KEY", None)
api_secret = os.environ.get("API_SECRET", None)

def get_token(base_url: str) -> str:
    if api_key or api_secret is None:
        with httpx.Client(
            base_url=base_url,
            timeout=timeout
        ) as client:
            try:
                data = register_user(client)

                key = data["apiKey"]
                secret = data["apiSecret"]

                print(secret)
                print(key)

                data2 = generate_token(client, api_key, api_secret)
                token: str = data2["token"]
                print(token)
            except Exception:
                raise Exception
    return token

def get_client(base_url: str):
    fetched_token = get_token(base_url)
    print(fetched_token)

    with httpx.Client(
        base_url=base_url,
        headers= { "Authorization": f"Bearer {fetched_token}" },
        timeout=timeout
    ) as client:
        print(client)
        return client

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

    print(resp)

    resp.raise_for_status()
    result = resp.json()

    print(result)
    return result["data"]

def generate_token(client: httpx.Client, api_key: str, api_secret: str) -> dict:
    resp = client.post("/api/auth/token", headers={
        "x-api-key": api_key,
        "x-api-secret": api_secret,
    })

    resp.raise_for_status()
    result = resp.json()
    return result["data"]

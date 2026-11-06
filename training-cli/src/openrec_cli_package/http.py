import httpx
import os
import time, random
from pathlib import Path
from dotenv import set_key

timeout = httpx.Timeout(connect=5, read=30, write=10, pool=5)

RETRYABLE_STATUS = {408, 429, 500, 502, 503, 504}

def create_or_update_env(key: str, secret: str) -> None:
    env_path = Path.cwd() / ".env"
    env_path.touch(exist_ok=True) # Creates .env file if it doesn't exist
    set_key(env_path, "OPENREC_API_KEY", key)
    set_key(env_path, "OPENREC_API_SECRET", secret)

def get_client(base_url: str) -> httpx.Client:
    url = base_url.rstrip("/")

    fetched_token = get_token(url)

    return httpx.Client(
        base_url=base_url,
        headers= { "Authorization": f"Bearer {fetched_token}" },
        timeout=timeout
    )

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

def request_with_retry(client: httpx.Client, method: str, url: str,
                       *, max_attempts: int = 5, base_delay: float = 1.0, max_delay: float = 30.0,
                       sleep = time.sleep, **kwargs) -> httpx.Response:

    last_exc = None
    refreshed = False
    for attempt in range(1, max_attempts + 1):
        retry_after = None
        try:
            resp = client.request(method, url, **kwargs)

        except httpx.TransportError as exc:
            last_exc = exc
            print(f"attempt {attempt} failed: {exc!r}")

        else:
            print(resp.status_code)
            if resp.status_code not in RETRYABLE_STATUS:
                if resp.is_success:
                    return resp

                elif resp.status_code == 401 and not refreshed:
                    newClient = get_client(str(client.base_url))
                    print(client.base_url)
                    client.headers["Authorization"] = newClient.headers["Authorization"]
                    newClient.close()
                    refreshed = True

                    last_exc = httpx.HTTPStatusError(f"Http {resp.status_code}", request = resp.request, response = resp)
                    continue

                elif resp.status_code == 401:
                    resp.raise_for_status()

                else:
                    resp.raise_for_status()

            last_exc = httpx.HTTPStatusError(f"Http {resp.status_code}", request = resp.request, response = resp)
            retry_after: str | None = resp.headers.get("Retry-After")
            print(retry_after)

        if attempt == max_attempts:
            raise last_exc

        delay = min(max_delay, base_delay * 2 ** (attempt - 1))
        delay = random.uniform(0, delay)
        if retry_after and retry_after.isdigit():
            delay = max(delay, float(retry_after))
        sleep(delay)
    raise last_exc

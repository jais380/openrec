import httpx
import pytest
from openrec_cli_package.http import request_with_retry

def scripted(*items):
    """Handler that returns/raises each item in order, and records the requests."""
    queue = iter(items)
    calls = []

    def handler(request):
        calls.append(request)
        item = next(queue)
        if isinstance(item, Exception):
            raise item
        return item

    return handler, calls


def make_client(handler, **kwargs):
    return httpx.Client(
        transport=httpx.MockTransport(handler),
        base_url="http://test",
        **kwargs,
    )

def test_returns_immediately_on_200():
    handler, calls = scripted(httpx.Response(200, json={"events": []}))
    client = make_client(handler)

    resp = request_with_retry(client, "GET", "/x", sleep=lambda s: None)

    assert resp.status_code == 200
    assert len(calls) == 1                     # no retries


def test_retries_503_then_succeeds():
    handler, calls = scripted(
        httpx.Response(503),
        httpx.Response(503),
        httpx.Response(200, json={"ok": True}),
    )
    client = make_client(handler)
    sleeps = []

    resp = request_with_retry(client, "GET", "/x", sleep=sleeps.append)

    assert resp.status_code == 200
    assert len(calls) == 3                     # 2 failures + 1 success
    assert len(sleeps) == 2                    # waited between them, not after success

def test_retries_408_then_succeeds():
    handler, calls = scripted(
        httpx.Response(408),
        httpx.Response(408),
        httpx.Response(200, json={"ok": True}),
    )
    client = make_client(handler)
    sleeps = []

    resp = request_with_retry(client, "GET", "/x", sleep=sleeps.append)

    assert resp.status_code == 200
    assert len(calls) == 3                     # 2 failures + 1 success
    assert len(sleeps) == 2                    # waited between them, not after success

def test_retries_429_then_succeeds():
    handler, calls = scripted(
        httpx.Response(429),
        httpx.Response(429),
        httpx.Response(200, json={"ok": True}),
    )
    client = make_client(handler)
    sleeps = []

    resp = request_with_retry(client, "GET", "/x", sleep=sleeps.append)

    assert resp.status_code == 200
    assert len(calls) == 3                     # 2 failures + 1 success
    assert len(sleeps) == 2                    # waited between them, not after success

def test_retries_503_then_succeeds():
    handler, calls = scripted(
        httpx.Response(503),
        httpx.Response(503),
        httpx.Response(200, json={"ok": True}),
    )
    client = make_client(handler)
    sleeps = []

    resp = request_with_retry(client, "GET", "/x", sleep=sleeps.append)

    assert resp.status_code == 200
    assert len(calls) == 3                     # 2 failures + 1 success
    assert len(sleeps) == 2                    # waited between them, not after success

def test_retries_500_then_succeeds():
    handler, calls = scripted(
        httpx.Response(500),
        httpx.Response(500),
        httpx.Response(200, json={"ok": True}),
    )
    client = make_client(handler)
    sleeps = []

    resp = request_with_retry(client, "GET", "/x", sleep=sleeps.append)

    assert resp.status_code == 200
    assert len(calls) == 3                     # 2 failures + 1 success
    assert len(sleeps) == 2                    # waited between them, not after success

def test_retries_504_then_succeeds():
    handler, calls = scripted(
        httpx.Response(504),
        httpx.Response(504),
        httpx.Response(200, json={"ok": True}),
    )
    client = make_client(handler)
    sleeps = []

    resp = request_with_retry(client, "GET", "/x", sleep=sleeps.append)

    assert resp.status_code == 200
    assert len(calls) == 3                     # 2 failures + 1 success
    assert len(sleeps) == 2                    # waited between them, not after success

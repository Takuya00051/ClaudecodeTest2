import urllib.request
import json

def get(url: str) -> dict:
    with urllib.request.urlopen(url) as res:
        return json.loads(res.read().decode())

def post(url: str, data: dict) -> dict:
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body,
                                 headers={"Content-Type": "application/json"},
                                 method="POST")
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode())

import urllib.request
import json
import ssl

api_key = "nugen-eec6fcc4b6c63980"
url = "https://api.nugen.in/api/v3/alignment-projects/create"

payload = {
    "alignment_name": "eventflow-nugen-aligned-v1",
    "base_model_id": "llama-v3p2-3b-reasoning",
    "document_ids": ["document_01m3g6b5qjj48d6k"],
    "description": "EventFlow AI Domain Alignment for HackCelestial 3.0"
}

data = json.dumps(payload).encode('utf-8')
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    url,
    data=data,
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        res = json.loads(response.read().decode('utf-8'))
        print("ALIGNMENT CREATION RESPONSE:", json.dumps(res, indent=2))
except Exception as e:
    print(f"FAILED TO CREATE ALIGNMENT: {e}")

import urllib.request
import json
import ssl

api_key = "nugen-eec6fcc4b6c63980"

endpoints = [
    "https://api.nugen.in/api/v3/documents/list",
    "https://api.nugen.in/api/v3/models/aligned",
    "https://api.nugen.in/api/v3/models/base",
    "https://api.nugen.in/api/v3/alignment-projects/list"
]

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

for ep in endpoints:
    print(f"--- GET {ep} ---")
    req = urllib.request.Request(
        ep,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
            res = json.loads(response.read().decode('utf-8'))
            print("SUCCESS:", json.dumps(res, indent=2))
    except Exception as e:
        print(f"FAILED: {e}")

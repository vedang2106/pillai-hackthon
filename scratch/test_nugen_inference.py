import urllib.request
import json
import ssl

api_key = "nugen-eec6fcc4b6c63980"
url = "https://api.nugen.in/api/v3/inference/chat/completions"

payload = {
    "model": "llama-v3p2-3b-reasoning",
    "messages": [
        {"role": "system", "content": "You are EventFlow AI's Nugen Aligned Crowd Safety Model for HackCelestial 3.0."},
        {"role": "user", "content": "Zone A utilization is 96%. What immediate actions must be taken according to EventFlow safety protocols?"}
    ],
    "max_tokens": 150
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
    with urllib.request.urlopen(req, context=ctx, timeout=12) as response:
        res = json.loads(response.read().decode('utf-8'))
        print("SUCCESS! NUGEN CHAT COMPLETION RESPONSE:")
        print(json.dumps(res, indent=2))
except Exception as e:
    print(f"FAILED on {url}: {e}")

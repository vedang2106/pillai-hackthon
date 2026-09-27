import urllib.request
import json
import ssl

api_key = "nugen-eec6fcc4b6c63980"

endpoints = [
    "https://api.nugen.in/v1/chat/completions",
    "https://api.nugen.in/v1/completions",
    "https://platform.nugen.in/api/v3/chat/completions",
    "https://platform.nugen.in/api/v1/chat/completions"
]

payload = {
    "model": "qwen-v2p5-0p5b-instruct",
    "messages": [
        {"role": "system", "content": "You are Nugen Aligned EventFlow AI assistant."},
        {"role": "user", "content": "What is the emergency protocol for 96% utilization in Zone A?"}
    ]
}

data = json.dumps(payload).encode('utf-8')
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

for ep in endpoints:
    print(f"Testing {ep}...")
    req = urllib.request.Request(
        ep,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
            res = json.loads(response.read().decode('utf-8'))
            print(f"SUCCESS on {ep}:", json.dumps(res, indent=2))
            break
    except Exception as e:
        print(f"FAILED on {ep}: {e}")

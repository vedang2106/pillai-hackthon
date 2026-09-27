import urllib.request
import json
import ssl

api_key = "nugen-eec6fcc4b6c63980"
url = "https://api.nugen.in/api/v3/inference/chat/completions"

models = [
    "qwen-v2p5-0p5b-instruct",
    "qwen2-vl-2b-instruct",
    "deepseek-v3p2",
    "gpt-oss-20b",
    "llama-v3p2-3b-reasoning"
]

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

for m in models:
    print(f"Testing model: {m}...")
    payload = {
        "model": m,
        "messages": [
            {"role": "system", "content": "You are EventFlow AI crowd safety assistant."},
            {"role": "user", "content": "Hello"}
        ],
        "max_tokens": 50
    }
    data = json.dumps(payload).encode('utf-8')
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
        with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
            res = json.loads(response.read().decode('utf-8'))
            print(f"SUCCESS on model {m}:", json.dumps(res, indent=2))
            break
    except Exception as e:
        print(f"FAILED on model {m}: {e}")

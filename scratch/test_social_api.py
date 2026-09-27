import urllib.request
import json

url = "http://127.0.0.1:5000/api/social/event/66f54c98c70f45a2aade5011"
req = urllib.request.Request(url)

try:
    with urllib.request.urlopen(req, timeout=5) as response:
        res = json.loads(response.read().decode('utf-8'))
        print("SOCIAL API RESPONSE:")
        print(json.dumps(res, indent=2))
except Exception as e:
    print("FAILED:", e)

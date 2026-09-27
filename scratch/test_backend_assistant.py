import urllib.request
import json

url = "http://localhost:5000/api/ai/assistant/query"
payload = {
    "query": "What is the emergency protocol for 96% utilization?"
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(
    url,
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST"
)

try:
    with urllib.request.urlopen(req, timeout=5) as response:
        res = json.loads(response.read().decode('utf-8'))
        print("END-TO-END BACKEND API RESPONSE:")
        print(json.dumps(res, indent=2))
except Exception as e:
    print("FAILED:", e)

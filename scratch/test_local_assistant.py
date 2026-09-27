import urllib.request
import json

url = "http://localhost:8000/assistant/query"
payload = {
    "query": "What is the highest risk zone right now?",
    "contextData": {
        "events": [{"id": "evt_1", "name": "HackCelestial 3.0"}],
        "zones": [{"name": "Food Plaza", "capacity": 100, "currentOccupancy": 96}],
        "risks": [{"name": "Food Plaza", "riskLevel": "CRITICAL", "currentUtilization": 96, "reason": "Severe crowd density bottleneck"}]
    }
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")

try:
    with urllib.request.urlopen(req, timeout=5) as response:
        res = json.loads(response.read().decode('utf-8'))
        print("AI SERVICE ASSISTANT RESPONSE:")
        print(json.dumps(res, indent=2))
except Exception as e:
    print("FAILED:", e)

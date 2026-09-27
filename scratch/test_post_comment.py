import urllib.request
import json

url = "http://127.0.0.1:5000/api/social/comments"
payload = {
    "eventId": "66f54c98c70f45a2aade5011",
    "visitorName": "Pooja Hegde",
    "comment": "Awesome concert! Entry was smooth and security team was very helpful.",
    "rating": 5
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")

try:
    with urllib.request.urlopen(req, timeout=5) as response:
        res = json.loads(response.read().decode('utf-8'))
        print("POST COMMENT RESPONSE:")
        print(json.dumps(res, indent=2))
except Exception as e:
    print("FAILED:", e)

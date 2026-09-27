import urllib.request
import json
import ssl
import time

api_key = "nugen-eec6fcc4b6c63980"
alignment_id = "alignment_01m3ga2mjaw84jp3"
url = f"https://api.nugen.in/api/v3/alignment-projects/{alignment_id}"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

for i in range(10):
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {api_key}"}
    )
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
            res = json.loads(response.read().decode('utf-8'))
            print(f"[{time.strftime('%H:%M:%S')}] Status: {res.get('status')} | Progress: {res.get('progress')}% | Error: {res.get('error')}")
            if res.get('status') in ['READY', 'FAILED', 'COMPLETED']:
                print("Final Output:", json.dumps(res, indent=2))
                break
    except Exception as e:
        print(f"Error checking status: {e}")
    time.sleep(3)

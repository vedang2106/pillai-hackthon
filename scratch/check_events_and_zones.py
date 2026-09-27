import requests

res = requests.get('http://localhost:5000/api/events')
print("Events status:", res.status_code)
if res.status_code == 200:
    events = res.json().get('events', [])
    print(f"Total events in DB: {len(events)}")
    for e in events:
        e_id = e.get('_id')
        name = e.get('name')
        z_res = requests.get(f'http://localhost:5000/api/zones/{e_id}')
        zones = z_res.json().get('zones', []) if z_res.status_code == 200 else []
        print(f"Event: {name} (ID: {e_id}) -> {len(zones)} zones")

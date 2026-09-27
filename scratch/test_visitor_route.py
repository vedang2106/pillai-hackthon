import requests

print("=== TESTING /predict/visitor-route ON FASTAPI ===")
url = "http://localhost:8000/predict/visitor-route"
payload = {
    "origin": {"name": "Byculla Station", "latitude": 18.9790, "longitude": 72.8333},
    "destination": {"name": "Event Venue", "latitude": 19.0760, "longitude": 72.8777},
    "vehicleType": "FOUR_WHEELER",
    "event": {}
}

res = requests.post(url, json=payload)
print("Status:", res.status_code)
if res.status_code == 200:
    data = res.json()
    print("Distance:", data.get("distanceKm"), "km")
    print("Waypoints count:", len(data.get("waypoints", [])))
    print("Navigation steps count:", len(data.get("navigationSteps", [])))
    print("Compliance:", data.get("complianceStatus"))

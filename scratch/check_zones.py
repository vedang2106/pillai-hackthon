import requests

res = requests.get('http://localhost:5000/api/zones/66f54c98c70f45a2aade5011')
print("Status:", res.status_code)
data = res.json()
print("Zones returned:", len(data.get('zones', [])))
for z in data.get('zones', []):
    print("Zone:", z.get('name'), "| Lat:", z.get('latitude'), "| Lng:", z.get('longitude'), "| Occupancy:", z.get('currentOccupancy'), "| Util:", z.get('utilizationPercent'), "%")

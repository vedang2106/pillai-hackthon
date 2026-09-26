from typing import List, Dict, Any

def sanitize_zone_data(zones: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Sanitizes raw zone records from Node.js backend/MongoDB.
    Ensures occupancy, capacity, latitude, and longitude are numeric.
    """
    cleaned = []
    for z in zones:
        capacity = max(1, int(z.get("capacity", 1000)))
        occupancy = max(0, int(z.get("currentOccupancy", 0)))
        utilization = min(100.0, round((occupancy / capacity) * 100.0, 2))
        
        cleaned.append({
            "zoneId": str(z.get("_id") or z.get("id") or z.get("zoneId")),
            "name": str(z.get("name", "Zone")),
            "latitude": float(z.get("latitude", 19.076)),
            "longitude": float(z.get("longitude", 72.8777)),
            "capacity": capacity,
            "currentOccupancy": occupancy,
            "utilizationPercent": utilization,
            "crowdLevel": str(z.get("crowdLevel", "LOW")),
            "trafficLevel": str(z.get("trafficLevel", "NORMAL")),
            "riskLevel": str(z.get("riskLevel", "LOW")),
            "type": str(z.get("type", "GATE")),
            "dataSource": str(z.get("dataSource", "SIMULATED")),
        })
    return cleaned

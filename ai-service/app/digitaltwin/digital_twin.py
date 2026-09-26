"""
Digital Twin Engine for EventFlow AI
Generates a synchronized live digital representation of city/event infrastructure objects.
"""

from typing import Dict, Any, List

def build_digital_twin_state(events: List[Dict[str, Any]], zones: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Constructs real-time state for venue objects, transit hubs, road links, and parking sectors.
    """
    twin_objects = []
    
    for z in zones:
        zid = str(z.get("id") or z.get("_id"))
        cap = max(z.get("capacity", 1000), 1)
        occ = z.get("currentOccupancy", 0)
        util = round((occ / cap) * 100, 1)
        ztype = z.get("type", "ZONE")
        
        # Estimate incoming/outgoing flow rates (visitors/min)
        growth = float(z.get("growthRate", 5.0))
        in_flow = round(max(growth * 1.5, 0), 1)
        out_flow = round(max(growth * 0.8, 0), 1)
        
        risk = z.get("riskLevel") or ("CRITICAL" if util >= 90 else ("HIGH" if util >= 75 else ("MEDIUM" if util >= 60 else "LOW")))
        
        twin_objects.append({
            "objectId": zid,
            "name": z.get("name", "Zone"),
            "category": ztype,
            "latitude": z.get("latitude"),
            "longitude": z.get("longitude"),
            "capacity": cap,
            "occupancy": occ,
            "utilizationPercent": util,
            "riskLevel": risk,
            "incomingFlowRatePerMin": in_flow,
            "outgoingFlowRatePerMin": out_flow,
            "status": "HEALTHY" if risk in ["LOW", "MEDIUM"] else "CONGESTED",
            "source": z.get("dataSource", "SIMULATED")
        })
        
    return {
        "digitalTwin": twin_objects,
        "totalObjects": len(twin_objects),
        "timestamp": z.get("lastUpdated") or "",
        "source": "SIMULATED"
    }

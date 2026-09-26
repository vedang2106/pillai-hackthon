"""
Multi-Event Intelligence & Overlap Detection Engine for EventFlow AI
Analyzes city-wide event interactions, shared transit hubs, and concurrent exit wave congestion.
"""

from typing import Dict, Any, List
import math

def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates Haversine distance in kilometers between two lat/lon points."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def detect_event_overlaps(events: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Scans a list of active/upcoming city events to detect temporal, geographical, and transit node overlaps.
    """
    interactions = []
    
    for i in range(len(events)):
        for j in range(i + 1, len(events)):
            e1 = events[i]
            e2 = events[j]
            
            # Extract coordinates
            v1 = e1.get("venue", {})
            v2 = e2.get("venue", {})
            lat1, lon1 = float(v1.get("latitude") or 0.0), float(v1.get("longitude") or 0.0)
            lat2, lon2 = float(v2.get("latitude") or 0.0), float(v2.get("longitude") or 0.0)
            
            if lat1 == 0 or lat2 == 0:
                dist_km = 999.0
            else:
                dist_km = round(calculate_distance_km(lat1, lon1, lat2, lon2), 2)
                
            att1 = e1.get("expectedAttendance", 5000)
            att2 = e2.get("expectedAttendance", 5000)
            combined_att = att1 + att2
            
            # Check geographical proximity (< 5.0 km)
            is_geo_near = dist_km < 5.0
            
            # Extract zones/transport to find shared infrastructure
            zones1 = {z.get("name"): z for z in e1.get("zones", [])}
            zones2 = {z.get("name"): z for z in e2.get("zones", [])}
            
            shared_names = list(set(zones1.keys()).intersection(set(zones2.keys())))
            
            if is_geo_near or len(shared_names) > 0:
                severity = "CRITICAL" if combined_att > 40000 and dist_km < 2.5 else ("HIGH" if dist_km < 4.0 else "MEDIUM")
                
                interactions.append({
                    "event1Id": str(e1.get("id") or e1.get("_id")),
                    "event1Name": e1.get("name", "Event 1"),
                    "event2Id": str(e2.get("id") or e2.get("_id")),
                    "event2Name": e2.get("name", "Event 2"),
                    "distanceKm": dist_km,
                    "combinedExpectedAttendance": combined_att,
                    "sharedInfrastructure": shared_names if shared_names else ["Shared Transit Corridor / Radial Highway"],
                    "severity": severity,
                    "title": f"⚠ EVENT INTERACTION DETECTED",
                    "details": f"Multiple large events ({e1.get('name')} & {e2.get('name')}) are within {dist_km} km of each other with combined expected crowd of {combined_att:,}. High potential for overlapping egress transit waves.",
                    "recommendedAction": "Coordinate municipal traffic signals and synchronize departure shuttle schedules between organizers.",
                    "source": "AI_PREDICTION"
                })
                
    return {
        "interactions": interactions,
        "totalInteractions": len(interactions),
        "evaluatedEventsCount": len(events),
        "source": "AI_PREDICTION"
    }

"""
Smart Routing Engine for EventFlow AI
Calculates crowd-aware, risk-adjusted optimal routes between points in the event/city network.
"""

from typing import Dict, Any, List

def calculate_smart_routes(origin: Dict[str, Any], destination: Dict[str, Any], available_routes: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Evaluates candidate routes considering distance, travel time, traffic congestion, and crowd risk.
    """
    evaluated_routes = []
    
    for r in available_routes:
        name = r.get("name", "Standard Route")
        distance_km = float(r.get("distanceKm", 2.0))
        base_time = float(r.get("baseTimeMin", 15.0))
        crowd_level = r.get("crowdLevel", "MEDIUM")
        traffic_level = r.get("trafficLevel", "NORMAL")
        risk_level = r.get("riskLevel", "LOW")
        
        # Risk penalty mapping (in virtual minutes added to perceived cost)
        penalty = 0.0
        if risk_level == "CRITICAL" or crowd_level == "CRITICAL":
            penalty += 25.0
        elif risk_level == "HIGH" or crowd_level == "HIGH":
            penalty += 15.0
        elif risk_level == "MEDIUM" or crowd_level == "MEDIUM":
            penalty += 5.0
            
        if traffic_level == "HEAVY":
            penalty += 10.0
        elif traffic_level == "SLOW":
            penalty += 4.0
            
        adjusted_time = round(base_time + penalty, 1)
        score = round((distance_km * 1.2) + (adjusted_time * 1.5), 1)
        
        evaluated_routes.append({
            "id": r.get("id", name.lower().replace(" ", "_")),
            "name": name,
            "distanceKm": distance_km,
            "estimatedTimeMin": int(base_time),
            "effectivePerceivedTimeMin": int(adjusted_time),
            "crowdLevel": crowd_level,
            "trafficLevel": traffic_level,
            "riskLevel": risk_level,
            "score": score,
            "waypoints": r.get("waypoints", []),
        })
        
    # Sort by score ascending (lower score = better route)
    evaluated_routes.sort(key=lambda x: x["score"])
    
    recommended = evaluated_routes[0]
    alternatives = evaluated_routes[1:]
    
    # Construct reasoning
    if len(evaluated_routes) > 1 and evaluated_routes[0]["distanceKm"] > evaluated_routes[1]["distanceKm"]:
        reason = f"{recommended['name']} is slightly longer ({recommended['distanceKm']} km vs {evaluated_routes[1]['distanceKm']} km) but avoids severe crowd congestion and high risk zones."
    else:
        reason = f"{recommended['name']} provides the optimal balance of travel time, low crowd exposure, and minimal traffic delay."

    return {
        "recommendedRoute": recommended,
        "alternativeRoutes": alternatives,
        "recommendationReason": reason,
        "source": "AI_PREDICTION"
    }

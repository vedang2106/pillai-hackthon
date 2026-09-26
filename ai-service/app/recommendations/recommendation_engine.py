"""
Recommendation Engine for EventFlow AI
Generates role-specific actionable intelligence for Visitors, Organizers, and Government Authorities.
"""

from typing import Dict, Any, List
import datetime

def generate_recommendations(event: Dict[str, Any], zones: List[Dict[str, Any]], risk_evaluations: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Analyzes event state, zone risks, and demand forecasts to build tailored recommendations.
    """
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    visitor_recs = []
    organizer_recs = []
    government_recs = []
    
    high_risk_zones = [r for r in risk_evaluations if r["riskLevel"] in ["HIGH", "CRITICAL"]]
    gates = [z for z in zones if z.get("type") == "GATE"]
    roads = [z for z in zones if z.get("type") == "ROAD"]
    transports = [z for z in zones if z.get("type") in ["METRO", "RAIL", "BUS"]]
    
    # 1. Gate Redirection & Visitor Flow
    if len(gates) >= 2:
        gates_sorted = sorted(gates, key=lambda g: g.get("currentOccupancy", 0) / max(g.get("capacity", 1), 1))
        busiest_gate = gates_sorted[-1]
        quietest_gate = gates_sorted[0]
        
        bus_util = (busiest_gate.get("currentOccupancy", 0) / max(busiest_gate.get("capacity", 1), 1)) * 100
        quiet_util = (quietest_gate.get("currentOccupancy", 0) / max(quietest_gate.get("capacity", 1), 1)) * 100
        
        if bus_util > 70 and (bus_util - quiet_util) > 20:
            visitor_recs.append({
                "title": f"Use {quietest_gate.get('name')} Instead of {busiest_gate.get('name')}",
                "severity": "MEDIUM",
                "targetRole": "VISITOR",
                "reason": f"{busiest_gate.get('name')} is at {int(bus_util)}% capacity while {quietest_gate.get('name')} is only at {int(quiet_util)}%.",
                "action": f"Head towards {quietest_gate.get('name')} for faster entry.",
                "expectedImpact": "Reduces entry wait time by approximately 12-15 minutes.",
                "timestamp": now_iso,
                "source": "AI_PREDICTION"
            })
            
            organizer_recs.append({
                "title": f"Redirect Entrance Traffic from {busiest_gate.get('name')} to {quietest_gate.get('name')}",
                "severity": "HIGH",
                "targetRole": "ORGANIZER",
                "reason": f"Severe ingress imbalance detected between entry points.",
                "action": f"Update digital signage at approach junctions and send push notification advising visitors to use {quietest_gate.get('name')}.",
                "expectedImpact": "Balances gate utilization and lowers surge pressure at main gate by 35%.",
                "timestamp": now_iso,
                "source": "AI_PREDICTION"
            })

    # 2. Road Congestion & Traffic Management
    heavy_roads = [r for r in roads if r.get("trafficLevel") == "HEAVY" or r.get("riskLevel") in ["HIGH", "CRITICAL"]]
    for rd in heavy_roads:
        visitor_recs.append({
            "title": f"Avoid {rd.get('name')} For Next 15-20 Minutes",
            "severity": "HIGH",
            "targetRole": "VISITOR",
            "reason": f"Heavy vehicle and pedestrian congestion reported along {rd.get('name')}.",
            "action": "Use suggested smart detour route via secondary arterial road.",
            "expectedImpact": "Saves 10-18 minutes in transit delay.",
            "timestamp": now_iso,
            "source": "AI_PREDICTION"
        })
        
        government_recs.append({
            "title": f"Deploy Traffic Marshals near {rd.get('name')}",
            "severity": "HIGH",
            "targetRole": "GOVERNMENT",
            "reason": f"{rd.get('name')} is experiencing gridlock risk due to event approach volume.",
            "action": "Dispatch municipal traffic control officers and adjust signal timings for emergency flow.",
            "expectedImpact": "Prevents city-wide arterial traffic spillover.",
            "timestamp": now_iso,
            "source": "AI_PREDICTION"
        })

    # 3. Public Transport Surge
    high_transports = [t for t in transports if t.get("currentOccupancy", 0) / max(t.get("capacity", 1), 1) > 0.75]
    for tr in high_transports:
        organizer_recs.append({
            "title": f"Request Extra Shuttle Bus Dispatches to {tr.get('name')}",
            "severity": "HIGH",
            "targetRole": "ORGANIZER",
            "reason": f"{tr.get('name')} is approaching capacity with expected end-of-event exit surge.",
            "action": "Notify transport authority to activate secondary shuttle bus loop.",
            "expectedImpact": "Clears platform accumulation within 10 minutes.",
            "timestamp": now_iso,
            "source": "AI_PREDICTION"
        })

    # Default fallback recommendations if conditions are normal
    if not visitor_recs:
        visitor_recs.append({
            "title": "Optimal Ingress Flow Detected",
            "severity": "LOW",
            "targetRole": "VISITOR",
            "reason": "All venue gates and entry corridors are operating smoothly.",
            "action": "Proceed directly to designated ticket check-in gates.",
            "expectedImpact": "Minimal wait times expected (< 3 mins).",
            "timestamp": now_iso,
            "source": "AI_PREDICTION"
        })
        
    if not organizer_recs:
        organizer_recs.append({
            "title": "Maintain Standard Operations",
            "severity": "LOW",
            "targetRole": "ORGANIZER",
            "reason": "Zone occupancies and flow rates remain within normal design limits.",
            "action": "Continue routine crowd monitoring across all venue sectors.",
            "expectedImpact": "Stable venue state.",
            "timestamp": now_iso,
            "source": "AI_PREDICTION"
        })

    if not government_recs:
        government_recs.append({
            "title": "City Corridor Operations Normal",
            "severity": "LOW",
            "targetRole": "GOVERNMENT",
            "reason": "No major transport or road arterial bottlenecks detected.",
            "action": "Maintain active automated camera & sensor monitoring.",
            "expectedImpact": "Smooth transit across urban sectors.",
            "timestamp": now_iso,
            "source": "AI_PREDICTION"
        })

    return {
        "VISITOR": visitor_recs,
        "ORGANIZER": organizer_recs,
        "GOVERNMENT": government_recs,
        "source": "AI_PREDICTION"
    }

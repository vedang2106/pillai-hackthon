"""
What-If Simulator Engine for EventFlow AI
Allows testing hypothetical operational scenarios (gate closure, attendance surge, transit failure) without mutating live data.
"""

from typing import Dict, Any, List
from app.risk.risk_detection import calculate_zone_risk
from app.ripple.crowd_ripple import simulate_crowd_ripple

def run_what_if_simulation(
    current_zones: List[Dict[str, Any]],
    scenario: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Simulates a scenario against current zones state.
    
    scenario example:
      {
        "closedZoneId": "zone_123",
        "attendanceSurgePercent": 25,
        "transitCapacityFactor": 0.5,
        "additionalGateOpened": False
      }
    """
    closed_id = str(scenario.get("closedZoneId", ""))
    surge_pct = float(scenario.get("attendanceSurgePercent", 0.0)) / 100.0
    transit_factor = float(scenario.get("transitCapacityFactor", 1.0))
    
    simulated_zones = []
    
    # Calculate initial baseline risks
    base_risks = [calculate_zone_risk(z) for z in current_zones]
    
    for z in current_zones:
        zid = str(z.get("id") or z.get("_id"))
        z_copy = dict(z)
        
        # Apply surge
        if surge_pct > 0:
            z_copy["currentOccupancy"] = int(z_copy.get("currentOccupancy", 0) * (1.0 + surge_pct))
            
        # Handle closure or redistribution
        if zid == closed_id:
            z_copy["currentOccupancy"] = 0
            z_copy["capacity"] = 1 # Closed
            z_copy["trafficLevel"] = "HEAVY"
        elif closed_id and z_copy.get("type") == z.get("type"):
            # Redistribute crowd from closed zone to matching zones
            z_copy["currentOccupancy"] = int(z_copy.get("currentOccupancy", 0) * 1.35)
            
        # Handle transit reduction
        if z_copy.get("type") in ["METRO", "RAIL", "BUS"]:
            z_copy["capacity"] = max(int(z_copy.get("capacity", 1000) * transit_factor), 100)
            if transit_factor < 0.8:
                z_copy["trafficLevel"] = "HEAVY"
                
        simulated_zones.append(z_copy)
        
    simulated_risks = [calculate_zone_risk(sz) for sz in simulated_zones]
    
    # Build graph nodes & edges for ripple comparison
    nodes = [{"id": str(z.get("id") or z.get("_id")), "name": z.get("name"), "type": z.get("type"), "currentOccupancy": z.get("currentOccupancy"), "capacity": z.get("capacity")} for z in simulated_zones]
    edges = []
    for i in range(len(nodes) - 1):
        edges.append({"source": nodes[i]["id"], "target": nodes[i+1]["id"], "travelTimeMin": 5})
        
    ripple_result = simulate_crowd_ripple(nodes, edges)
    
    # Identify key delta changes
    critical_diff = len([r for r in simulated_risks if r["riskLevel"] == "CRITICAL"]) - len([r for r in base_risks if r["riskLevel"] == "CRITICAL"])
    high_diff = len([r for r in simulated_risks if r["riskLevel"] == "HIGH"]) - len([r for r in base_risks if r["riskLevel"] == "HIGH"])
    
    summary = f"Simulated scenario results in {critical_diff:+d} critical risk zones and {high_diff:+d} high risk zones compared to current state."

    return {
        "scenarioApplied": scenario,
        "currentStateRisks": base_risks,
        "simulatedStateRisks": simulated_risks,
        "rippleTimeline": ripple_result.get("timeline"),
        "comparisonSummary": summary,
        "source": "SIMULATED"
    }

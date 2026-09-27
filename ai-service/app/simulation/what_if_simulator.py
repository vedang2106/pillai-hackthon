"""
What-If Simulator Engine for EventFlow AI
Allows testing hypothetical operational scenarios (gate closure, attendance surge, transit failure, weather events) without mutating live data.
"""

from typing import Dict, Any, List
from app.risk.risk_detection import calculate_zone_risk
from app.ripple.crowd_ripple import simulate_crowd_ripple

def run_what_if_simulation(
    current_zones: List[Dict[str, Any]],
    scenario: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Simulates operational and weather scenarios against current zones state.
    
    scenario example:
      {
        "weatherMode": "SIMULATED", # "LIVE" or "SIMULATED"
        "rainfallMm": 45.0,
        "temperatureC": 32.0,
        "windSpeedKmh": 28.0,
        "stormSeverity": "MODERATE",
        "closedZoneId": "zone_123",
        "attendanceSurgePercent": 25,
        "transitCapacityFactor": 0.5
      }
    """
    weather_mode = scenario.get("weatherMode", "LIVE")
    rainfall_mm = float(scenario.get("rainfallMm", 0.0))
    temp_c = float(scenario.get("temperatureC", 26.0))
    wind_kmh = float(scenario.get("windSpeedKmh", 12.0))
    storm_severity = str(scenario.get("stormSeverity", "NONE")).upper()
    
    closed_id = str(scenario.get("closedZoneId", ""))
    surge_pct = float(scenario.get("attendanceSurgePercent", 0.0)) / 100.0
    transit_factor = float(scenario.get("transitCapacityFactor", 1.0))
    
    simulated_zones = []
    weather_impact_notes = []
    
    # Calculate baseline risks
    base_risks = [calculate_zone_risk(z) for z in current_zones]
    
    # Analyze weather conditions impact
    is_heavy_rain = rainfall_mm > 25.0 or storm_severity in ["SEVERE", "EXTREME"]
    is_extreme_heat = temp_c > 38.0
    is_high_wind = wind_kmh > 40.0 or storm_severity == "EXTREME"
    
    if is_heavy_rain:
        weather_impact_notes.append(f"🌧️ Heavy rainfall ({rainfall_mm:.1f} mm/hr) detected. Outdoor stage & open gate capacities reduced by up to 70%.")
    if is_extreme_heat:
        weather_impact_notes.append(f"☀️ Extreme heat warning ({temp_c:.1f}°C). Increased heat exhaustion risk & water station demand.")
    if is_high_wind:
        weather_impact_notes.append(f"💨 High wind speeds ({wind_kmh:.1f} km/h). Structural warnings issued for temporary outdoor tents.")
        
    for z in current_zones:
        zid = str(z.get("id") or z.get("_id"))
        z_copy = dict(z)
        z_type = str(z_copy.get("type", "")).upper()
        
        # Apply Weather Impact to Zones
        if is_heavy_rain and z_type in ["OUTDOOR", "STAGE", "GATE", "OPEN_AIR", "PARKING"]:
            # Drop outdoor capacity and shift crowd
            orig_cap = z_copy.get("capacity", 1000)
            z_copy["capacity"] = max(int(orig_cap * 0.3), 100)
            z_copy["currentOccupancy"] = int(z_copy.get("currentOccupancy", 0) * 0.4)
            z_copy["trafficLevel"] = "HEAVY"
            z_copy["riskLevel"] = "HIGH" if not is_high_wind else "CRITICAL"
        elif is_heavy_rain and z_type in ["INDOOR", "AUDITORIUM", "HALL", "SUBWAY", "METRO"]:
            # Indoor zones absorb displaced outdoor crowd
            z_copy["currentOccupancy"] = int(z_copy.get("currentOccupancy", 0) * 1.6)
            
        if is_extreme_heat and z_type in ["MEDICAL", "WATER_STATION", "FOOD_COURT"]:
            z_copy["currentOccupancy"] = int(z_copy.get("currentOccupancy", 0) * 1.5)
            z_copy["trafficLevel"] = "HEAVY"

        # Apply surge
        if surge_pct > 0:
            z_copy["currentOccupancy"] = int(z_copy.get("currentOccupancy", 0) * (1.0 + surge_pct))
            
        # Handle closure or redistribution
        if zid == closed_id:
            z_copy["currentOccupancy"] = 0
            z_copy["capacity"] = 1
            z_copy["trafficLevel"] = "HEAVY"
        elif closed_id and z_copy.get("type") == z.get("type"):
            z_copy["currentOccupancy"] = int(z_copy.get("currentOccupancy", 0) * 1.35)
            
        # Handle transit reduction
        if z_type in ["METRO", "RAIL", "BUS"]:
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
    
    summary = f"Simulated scenario results in {critical_diff:+d} critical risk zones and {high_diff:+d} high risk zones compared to baseline state."
    if weather_impact_notes:
        summary += " " + " ".join(weather_impact_notes)

    return {
        "scenarioApplied": scenario,
        "weatherMode": weather_mode,
        "weatherMetrics": {
            "rainfallMm": rainfall_mm,
            "temperatureC": temp_c,
            "windSpeedKmh": wind_kmh,
            "stormSeverity": storm_severity
        },
        "weatherImpactNotes": weather_impact_notes,
        "currentStateRisks": base_risks,
        "simulatedStateRisks": simulated_risks,
        "rippleTimeline": ripple_result.get("timeline"),
        "comparisonSummary": summary,
        "source": "SIMULATED"
    }


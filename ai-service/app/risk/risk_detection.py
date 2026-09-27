"""
Risk Detection Engine for EventFlow AI
Evaluates zone and event operational conditions to determine real-time risk level and time to threshold.
"""

from typing import Dict, Any, List, Optional
import math

def calculate_zone_risk(zone_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes real-time risk assessment for a specific zone.
    
    Expected keys in zone_data:
      - zoneId: str
      - name: str
      - capacity: int
      - currentOccupancy: int
      - growthRate: float (visitors / min)
      - trafficLevel: str ('NORMAL', 'SLOW', 'HEAVY')
      - predicted15m: int (predicted crowd in 15 minutes)
    """
    zone_id = zone_data.get("zoneId") or zone_data.get("_id", "unknown")
    name = zone_data.get("name", "Zone")
    capacity = max(zone_data.get("capacity", 1000), 1)
    current = zone_data.get("currentOccupancy", 0)
    growth = zone_data.get("growthRate", 0.0)
    traffic = zone_data.get("trafficLevel", "NORMAL")
    predicted_15m = zone_data.get("predicted15m", current)
    
    current_util = current / capacity
    predicted_util = predicted_15m / capacity
    
    # Calculate time to threshold (90% capacity)
    target_crowd = capacity * 0.90
    if growth > 0 and current < target_crowd:
        mins_to_threshold = round((target_crowd - current) / growth, 1)
    elif current >= target_crowd:
        mins_to_threshold = 0.0
    else:
        mins_to_threshold = None  # Not approaching
        
    # Base risk score (0 to 100)
    raw_score = (current_util * 50) + (predicted_util * 40)
    if traffic == "HEAVY":
        raw_score += 15
    elif traffic == "SLOW":
        raw_score += 8
        
    risk_score = round(min(max(raw_score, 0), 100), 1)
    
    # Determine risk level & reason based on exact thresholds
    if predicted_util > 0.85 or current_util > 0.85:
        level = "CRITICAL"
        reason = f"🚨 EXTREME DANGER (>85%): Current occupancy reached {int(current_util*100)}% of max capacity threshold."
    elif predicted_util >= 0.70 or current_util >= 0.70:
        level = "HIGH"
        reason = f"⚠️ HIGH CONGESTION (70-85%): Occupancy ({int(current_util*100)}%) has entered high congestion zone."
    elif predicted_util >= 0.40 or current_util >= 0.40:
        level = "MEDIUM"
        reason = f"🟡 MODERATE (40-70%): Zone experiencing steady crowd inflow ({int(current_util*100)}% utilization)."
    else:
        level = "LOW"
        reason = f"🟢 NORMAL (0-40%): Zone operating smoothly within safe thresholds ({int(current_util*100)}% utilization)."

    return {
        "zoneId": str(zone_id),
        "name": name,
        "riskLevel": level,
        "riskScore": risk_score,
        "currentUtilization": round(current_util * 100, 1),
        "predictedUtilization": round(predicted_util * 100, 1),
        "predictedTimeToThreshold": mins_to_threshold,
        "reason": reason,
        "source": "AI_PREDICTION"
    }

def batch_detect_risk(zones: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Evaluates risk across all zones in an event."""
    results = []
    for z in zones:
        results.append(calculate_zone_risk(z))
    return results

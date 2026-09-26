"""
Exit Wave Prediction Model for EventFlow AI
Predicts egress wave timing, transit platform surge, and parking exit bottlenecks as events end.
"""

from typing import Dict, Any, List

def predict_exit_wave(event: Dict[str, Any], zones: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculates 45-minute post-event departure wave profile across venue gates, roads, metro stations, and parking.
    """
    total_crowd = sum([z.get("currentOccupancy", 0) for z in zones]) or event.get("expectedAttendance", 10000)
    
    # Egress distribution curves (% of total exiting crowd)
    wave_timeline = [
        {
            "interval": "0 - 15 MIN",
            "phase": "VENUE EXIT SURGE",
            "venueExitCrowd": int(total_crowd * 0.40),
            "roadDemandCrowd": int(total_crowd * 0.15),
            "metroRailDemandCrowd": int(total_crowd * 0.20),
            "busRideshareCrowd": int(total_crowd * 0.10),
            "parkingExitVehicles": int((total_crowd * 0.15) / 2.5),
            "riskLevel": "HIGH" if total_crowd > 20000 else "MEDIUM"
        },
        {
            "interval": "15 - 30 MIN",
            "phase": "TRANSIT HUB PEAK",
            "venueExitCrowd": int(total_crowd * 0.35),
            "roadDemandCrowd": int(total_crowd * 0.45),
            "metroRailDemandCrowd": int(total_crowd * 0.50),
            "busRideshareCrowd": int(total_crowd * 0.35),
            "parkingExitVehicles": int((total_crowd * 0.40) / 2.5),
            "riskLevel": "CRITICAL" if total_crowd > 20000 else "HIGH"
        },
        {
            "interval": "30 - 45 MIN",
            "phase": "DISPERSAL & ROAD ARTERIAL CLEARING",
            "venueExitCrowd": int(total_crowd * 0.20),
            "roadDemandCrowd": int(total_crowd * 0.30),
            "metroRailDemandCrowd": int(total_crowd * 0.25),
            "busRideshareCrowd": int(total_crowd * 0.40),
            "parkingExitVehicles": int((total_crowd * 0.35) / 2.5),
            "riskLevel": "MEDIUM"
        },
        {
            "interval": "45+ MIN",
            "phase": "SYSTEM NORMALIZATION",
            "venueExitCrowd": int(total_crowd * 0.05),
            "roadDemandCrowd": int(total_crowd * 0.10),
            "metroRailDemandCrowd": int(total_crowd * 0.05),
            "busRideshareCrowd": int(total_crowd * 0.15),
            "parkingExitVehicles": int((total_crowd * 0.10) / 2.5),
            "riskLevel": "LOW"
        }
    ]
    
    peak_phase = wave_timeline[1]
    
    return {
        "eventId": str(event.get("id") or event.get("_id", "unknown")),
        "eventName": event.get("name", "Event"),
        "totalExitingCrowd": total_crowd,
        "peakSurgeWindow": "15 - 30 MIN",
        "peakMetroRailDemand": peak_phase["metroRailDemandCrowd"],
        "peakRoadDemand": peak_phase["roadDemandCrowd"],
        "timeline": wave_timeline,
        "recommendation": "Deploy auxiliary shuttle buses 15 minutes prior to main event conclusion.",
        "source": "AI_PREDICTION"
    }

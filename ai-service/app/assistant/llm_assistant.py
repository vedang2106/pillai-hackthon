"""
Structured Data Contextual Assistant for EventFlow AI
Grounds LLM responses directly in empirical live MongoDB & AI prediction data.
"""

from typing import Dict, Any, List

def process_assistant_query(query: str, context_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates natural language user questions strictly against real event, zone, and risk state.
    """
    query_lower = query.lower().strip()
    events = context_data.get("events", [])
    zones = context_data.get("zones", [])
    risks = context_data.get("risks", [])
    recommendations = context_data.get("recommendations", {})
    interactions = context_data.get("interactions", [])
    
    if not events and not zones:
        return {
            "answer": "Insufficient data available in the current system state to answer this query.",
            "groundingData": {},
            "source": "AI_PREDICTION"
        }
        
    # 1. "What is the biggest risk right now?"
    if "biggest risk" in query_lower or "highest risk" in query_lower or "critical" in query_lower:
        critical_zones = [r for r in risks if r.get("riskLevel") == "CRITICAL"]
        high_zones = [r for r in risks if r.get("riskLevel") == "HIGH"]
        
        if critical_zones:
            top = critical_zones[0]
            ans = f"The biggest operational risk right now is **{top.get('name')}** (Risk Level: **CRITICAL**, Utilization: **{top.get('currentUtilization')}%**). Reason: {top.get('reason')}"
        elif high_zones:
            top = high_zones[0]
            ans = f"The highest current risk is **{top.get('name')}** (Risk Level: **HIGH**, Utilization: **{top.get('currentUtilization')}%**). Reason: {top.get('reason')}"
        else:
            ans = "All monitored zones are currently operating under **LOW** or **MEDIUM** risk with no critical capacity bottlenecks detected."
            
        return {"answer": ans, "groundingData": {"risks": risks}, "source": "AI_PREDICTION"}

    # 2. "Which gate should visitors use?"
    if "gate" in query_lower and ("use" in query_lower or "recommend" in query_lower or "best" in query_lower):
        gates = [z for z in zones if z.get("type") == "GATE"]
        if gates:
            sorted_gates = sorted(gates, key=lambda g: g.get("currentOccupancy", 0) / max(g.get("capacity", 1), 1))
            best = sorted_gates[0]
            worst = sorted_gates[-1]
            best_util = int((best.get("currentOccupancy", 0) / max(best.get("capacity", 1), 1)) * 100)
            worst_util = int((worst.get("currentOccupancy", 0) / max(worst.get("capacity", 1), 1)) * 100)
            
            ans = f"Visitors are advised to use **{best.get('name')}** (currently at **{best_util}%** capacity). Avoid **{worst.get('name')}** which is currently experiencing peak influx at **{worst_util}%** capacity."
        else:
            ans = "No specific venue gates are registered for this event. Please follow standard site signage."
            
        return {"answer": ans, "groundingData": {"gates": gates}, "source": "AI_PREDICTION"}

    # 3. "What should the organizer do right now?"
    if "organizer" in query_lower or "action" in query_lower or "recommendation" in query_lower:
        org_recs = recommendations.get("ORGANIZER", [])
        if org_recs:
            rec_texts = [f"• **{r['title']}**: {r['action']} ({r['expectedImpact']})" for r in org_recs]
            ans = "Key actions for organizers right now:\n" + "\n".join(rec_texts)
        else:
            ans = "Current organizer recommendations: Maintain standard zone surveillance and monitor entry check-in rates."
            
        return {"answer": ans, "groundingData": {"organizerRecommendations": org_recs}, "source": "AI_PREDICTION"}

    # 4. "Summarize city situation" / "city situation"
    if "city" in query_lower or "summary" in query_lower or "overview" in query_lower:
        event_count = len(events)
        high_risk_count = len([r for r in risks if r.get("riskLevel") in ["HIGH", "CRITICAL"]])
        inter_count = len(interactions)
        
        ans = f"**City Egress & Event Overview:** Currently monitoring **{event_count}** active/scheduled events across the city. **{high_risk_count}** zones are flagged at HIGH/CRITICAL risk. **{inter_count}** multi-event transport/road interactions detected."
        return {"answer": ans, "groundingData": {"eventCount": event_count, "highRiskCount": high_risk_count}, "source": "AI_PREDICTION"}

    # Generic fallback grounded in available data
    return {
        "answer": f"EventFlow AI System Analysis: Monitored {len(zones)} active zones across {len(events)} events. All predictions grounded in backend data.",
        "groundingData": {"zoneCount": len(zones)},
        "source": "AI_PREDICTION"
    }

"""
FastAPI Main Application for EventFlow AI Python Service
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

from app.preprocessing.preprocessing import sanitize_zone_data
from app.prediction.demand_prediction import handle_demand_prediction, PredictDemandRequest, ZoneItem
from app.risk.risk_detection import calculate_zone_risk, batch_detect_risk
from app.ripple.crowd_ripple import simulate_crowd_ripple
from app.routing.smart_routing import calculate_smart_routes
from app.recommendations.recommendation_engine import generate_recommendations
from app.multievent.multi_event_intelligence import detect_event_overlaps
from app.digitaltwin.digital_twin import build_digital_twin_state
from app.simulation.what_if_simulator import run_what_if_simulation
from app.prediction.exit_wave import predict_exit_wave
from app.assistant.llm_assistant import process_assistant_query
from app.analytics.ml_analytics import calculate_ml_analytics
from app.advisory.advisory_parser import compute_visitor_smart_path

app = FastAPI(
    title="EventFlow AI Intelligence Service",
    version="1.2.0",
    description="Python FastAPI service providing real-time crowd intelligence, XGBoost demand forecasts, NetworkX spatial ripple modeling, and smart routing."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "ok": True,
        "service": "ai-service",
        "engine": "FastAPI + XGBoost + NetworkX",
        "modelVersion": "xgboost-v1.2.0"
    }

# 1. Demand Prediction
@app.post("/predict/demand")
def predict_demand_endpoint(payload: Dict[str, Any]):
    event_id = str(payload.get("eventId") or payload.get("event", {}).get("id") or "event_1")
    zones = payload.get("zones", [])
    event_data = payload.get("event") or payload.get("eventData")
    
    zone_items = [ZoneItem(**z) for z in zones] if zones else []
    req = PredictDemandRequest(eventId=event_id, zones=zone_items, eventData=event_data)
    return handle_demand_prediction(req)

# 2. Risk Detection
@app.post("/predict/risk")
def predict_risk_endpoint(payload: Dict[str, Any]):
    zones = payload.get("zones", [])
    if not zones and "zone" in payload:
        zones = [payload["zone"]]
    results = batch_detect_risk(zones)
    return {"risks": results, "totalEvaluated": len(results), "source": "AI_PREDICTION"}

# 3. Crowd Ripple Simulation
@app.post("/predict/ripple")
def predict_ripple_endpoint(payload: Dict[str, Any]):
    nodes = payload.get("nodes", [])
    edges = payload.get("edges", [])
    return simulate_crowd_ripple(nodes, edges)

# 4. Smart Routing
@app.post("/predict/smart-route")
def smart_route_endpoint(payload: Dict[str, Any]):
    origin = payload.get("origin", {})
    destination = payload.get("destination", {})
    available_routes = payload.get("availableRoutes", [])
    return calculate_smart_routes(origin, destination, available_routes)

# 5. Recommendation Engine
@app.post("/predict/recommendations")
def recommendations_endpoint(payload: Dict[str, Any]):
    event = payload.get("event", {})
    zones = payload.get("zones", [])
    risks = payload.get("risks", batch_detect_risk(zones))
    return generate_recommendations(event, zones, risks)

# 6. Multi-Event Intelligence & Overlap
@app.post("/predict/multi-event")
def multi_event_endpoint(payload: Dict[str, Any]):
    events = payload.get("events", [])
    return detect_event_overlaps(events)

# 7. Digital Twin State
@app.post("/digital-twin")
def digital_twin_endpoint(payload: Dict[str, Any]):
    events = payload.get("events", [])
    zones = payload.get("zones", [])
    return build_digital_twin_state(events, zones)

# 8. What-If Simulator
@app.post("/simulation/what-if")
def what_if_endpoint(payload: Dict[str, Any]):
    current_zones = payload.get("zones", [])
    scenario = payload.get("scenario", {})
    return run_what_if_simulation(current_zones, scenario)

# 9. Exit Wave AI
@app.post("/predict/exit-wave")
def exit_wave_endpoint(payload: Dict[str, Any]):
    event = payload.get("event", {})
    zones = payload.get("zones", [])
    return predict_exit_wave(event, zones)

# 10. Grounded LLM AI Assistant
@app.post("/assistant/query")
def assistant_query_endpoint(payload: Dict[str, Any]):
    query = payload.get("query", "")
    context_data = payload.get("contextData", {})
    return process_assistant_query(query, context_data)

# 11. ML Analytics
@app.post("/analytics/eval")
def ml_analytics_endpoint(payload: Dict[str, Any]):
    feedback_records = payload.get("feedbackRecords", [])
    return calculate_ml_analytics(feedback_records)

# 12. Visitor Smart Route with Advisory Compliance (ChromaDB)
@app.post("/predict/visitor-route")
def visitor_route_endpoint(payload: Dict[str, Any]):
    origin = payload.get("origin", {})
    destination = payload.get("destination", {})
    vehicle_type = payload.get("vehicleType", "FOUR_WHEELER")
    event_data = payload.get("event", {})
    return compute_visitor_smart_path(origin, destination, vehicle_type, event_data)

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.preprocessing.preprocessing import sanitize_zone_data
from app.features.feature_engineering import build_feature_matrix
from app.models.demand_model import demand_model_instance

class ZoneItem(BaseModel):
    zoneId: Optional[str] = None
    _id: Optional[str] = None
    id: Optional[str] = None
    name: str = "Zone"
    latitude: Optional[float] = 19.076
    longitude: Optional[float] = 72.8777
    capacity: int = 1000
    currentOccupancy: int = 0
    crowdLevel: Optional[str] = "LOW"
    trafficLevel: Optional[str] = "NORMAL"
    riskLevel: Optional[str] = "LOW"
    type: Optional[str] = "GATE"
    dataSource: Optional[str] = "SIMULATED"

class PredictDemandRequest(BaseModel):
    eventId: str
    zones: List[ZoneItem] = []
    eventData: Optional[Dict[str, Any]] = None

def handle_demand_prediction(request_data: PredictDemandRequest) -> Dict[str, Any]:
    raw_zones = [z.model_dump(by_alias=True) for z in request_data.zones]
    cleaned_zones = sanitize_zone_data(raw_zones)
    df_features = build_feature_matrix(cleaned_zones, request_data.eventData)
    predictions = demand_model_instance.predict_forecasts(df_features)

    return {
        "eventId": request_data.eventId,
        "timestamp": datetime.now().isoformat(),
        "totalZones": len(predictions),
        "modelVersion": demand_model_instance.model_version,
        "predictions": predictions
    }

import os

class Settings:
    PROJECT_NAME: str = "EventFlow AI — ML Service"
    API_VERSION: str = "1.0.0"
    HOST: str = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
    NODE_BACKEND_URL: str = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")
    MODEL_VERSION: str = "xgboost-v1.2.0"

settings = Settings()

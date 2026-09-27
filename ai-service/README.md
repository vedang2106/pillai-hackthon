# EventFlow AI — Python ML Service

FastAPI service for real-time crowd intelligence, XGBoost demand forecasting, NetworkX spatial ripple modeling, ChromaDB vector advisory matching, and smart routing.

## Setup & Running

1. **Navigate to the AI service directory:**
   ```bash
   cd ai-service
   ```

2. **Create and activate a virtual environment (optional but recommended):**
   ```bash
   python -m venv .venv
   # Windows (PowerShell)
   .venv\Scripts\Activate.ps1
   # macOS/Linux
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the FastAPI server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Or from the root directory:
   ```bash
   npm run dev:ai
   ```

Service will run on `http://localhost:8000`.  
Health check endpoint: `GET http://localhost:8000/health`

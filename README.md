# EventFlow AI

**Tagline:** Predict. Prevent. Redirect.

Full-stack event crowd intelligence platform (React + Node + MongoDB + Mapbox + Python FastAPI AI).

## Folder Structure

```
eventflow-frontend/        # Main Project Monorepo Root
├── frontend/             # Vite + React UI (visitor + organizer dashboard)
├── backend/              # Node.js + Express + Socket.IO + Mongoose API
├── ai-service/           # Python FastAPI ML pipeline (demand prediction & analytics)
├── docker-compose.yml    # MongoDB Docker container
├── package.json          # Monorepo root scripts
├── ARCHITECTURE.md       # Architecture & roadmap documentation
└── README.md             # Project documentation
```

## Prerequisites

- Node.js 20+
- MongoDB (local, Docker, or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Python 3.10+ (for `ai-service`)
- [Mapbox access token](https://account.mapbox.com/)

## Quick Start

### 1. MongoDB (Database)

Using Docker:
```bash
docker-compose up -d
```

### 2. Backend (Express API)

```bash
cd backend
cp .env.example .env
# Edit MONGODB_URI and JWT_SECRET if needed
npm install
npm run seed    # optional demo event + zones + demo users
npm run dev
```

API runs on: `http://localhost:5000` · Health check: `GET http://localhost:5000/api/health`

Demo accounts (after seed):
- **Organizer:** `organizer@eventflow.demo` / `demo1234`
- **Visitor:** `visitor@eventflow.demo` / `demo1234`

### 3. Frontend (React UI)

```bash
# from root directory or frontend directory
cd frontend
cp .env.example .env
# Set VITE_MAPBOX_TOKEN=pk....
npm install
npm run dev
```

Or from the root workspace:
```bash
npm run dev:frontend
```

Open `http://localhost:5173`. Vite proxies `/api` and `/socket.io` to port 5000.

### 4. AI Service (Python FastAPI)

```bash
cd ai-service
# install dependencies if needed
uvicorn app.main:app --reload --port 8000
```

Or from root workspace:
```bash
npm run dev:ai
```

## Root Workspace Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` / `npm run dev:frontend` | Launch Frontend dev server (`frontend/`) |
| `npm run dev:backend` | Launch Express Backend server (`backend/`) |
| `npm run dev:ai` | Launch FastAPI AI Service (`ai-service/`) |
| `npm run seed` | Seed demo data into MongoDB |
| `npm run build` | Build production bundle for Frontend |
| `npm run install:all` | Install node dependencies in frontend and backend |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full architecture and roadmap.

# EventFlow AI — Architecture (Phases 1–8+)

## Monorepo layout

```
eventflow-frontend/          # Repository Root
  ├── frontend/              # Vite + React (visitor + organizer UI)
  ├── backend/               # Node.js + Express + Socket.IO + Mongoose
  └── ai-service/            # Python FastAPI ML pipelines
```

## Data flow (target closed loop)

```
Simulation / User reports / Transport
        ↓
   MongoDB (zones, reports, predictions, …)
        ↓
   Express REST + Socket.IO
        ↓
   React (Mapbox, dashboards)
        ↓
   Python AI service (predictions, risk, ripple, routing)
        ↓
   Recommendations → organizer action → feedback collection
```

## Implemented now

| Layer | Capability |
|--------|------------|
| MongoDB | `users`, `events`, `zones` collections |
| Auth | JWT, roles `VISITOR`, `ORGANIZER`, `ADMIN` |
| API | `/api/auth/*`, `/api/events`, `/api/zones/:eventId` |
| Real-time | Socket.IO rooms `event:{eventId}`, zone update events |
| Frontend | Light (#FFFFFF / #F97316) design, React Router, API-driven events/zones |
| Map | Mapbox GL JS (`VITE_MAPBOX_TOKEN`) |
| AI Service | FastAPI app structure ready |

## Explicitly not in UI

- Hardcoded crowd counts in React components (removed from landing; KPIs aggregate from zone API).
- Fake ML metrics (coming with real evaluation).

## Next phases

9. Backend simulation engine (continuous zone occupancy)
10–12. AI service: features, XGBoost demand, risk rules + ML
13–17. Ripple, routing, optimization, recommendations
18–25. Digital twin, what-if, exit wave, feedback, LLM, analytics, deploy

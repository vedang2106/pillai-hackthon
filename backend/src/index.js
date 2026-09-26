import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { connectDB, getDbStatus } from './config/db.js';
import { registerSocketHandlers } from './socket/index.js';
import authRoutes from './routes/auth.routes.js';
import eventsRoutes from './routes/events.routes.js';
import zonesRoutes from './routes/zones.routes.js';
import aiRoutes from './routes/ai.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';

const app = express();
const server = http.createServer(app);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const io = new Server(server, {
  cors: { origin: clientOrigin, methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
});

app.set('io', io);
registerSocketHandlers(io);

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'eventflow-backend',
    mongodb: getDbStatus(),
    simulation: 'not_started',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/events', aiRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/tickets', ticketsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

const port = Number(process.env.PORT) || 5000;

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required. Copy backend/.env.example to backend/.env');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required in backend/.env');
    process.exit(1);
  }

  try {
    await connectDB(uri);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }

  server.listen(port, () => {
    console.log(`EventFlow API listening on http://localhost:${port}`);
  });
}

start();

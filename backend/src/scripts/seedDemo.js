import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Zone } from '../models/Zone.js';

const DEMO_ZONES = [
  { name: 'Gate A', type: 'GATE', lat: 19.076, lng: 72.8777, capacity: 5000 },
  { name: 'Gate B', type: 'GATE', lat: 19.078, lng: 72.879, capacity: 4000 },
  { name: 'Gate C', type: 'GATE', lat: 19.074, lng: 72.876, capacity: 3500 },
  { name: 'Main Stage', type: 'STAGE', lat: 19.077, lng: 72.8785, capacity: 25000 },
  { name: 'Food Area', type: 'FOOD', lat: 19.0755, lng: 72.878, capacity: 8000 },
  { name: 'Parking', type: 'PARKING', lat: 19.073, lng: 72.875, capacity: 6000 },
  { name: 'Metro Station', type: 'METRO', lat: 19.079, lng: 72.881, capacity: 12000 },
  { name: 'Bus Station', type: 'BUS', lat: 19.072, lng: 72.874, capacity: 5000 },
  { name: 'Hotel Area', type: 'HOTEL', lat: 19.08, lng: 72.882, capacity: 3000 },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing. Copy backend/.env.example to backend/.env and set your connection string.');
    process.exit(1);
  }
  try {
    await connectDB(process.env.MONGODB_URI);
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    console.error('');
    console.error('Start MongoDB locally, run: docker compose up -d (from project root),');
    console.error('or set MONGODB_URI in backend/.env to a MongoDB Atlas cluster.');
    process.exit(1);
  }

  let organizer = await User.findOne({ email: 'organizer@eventflow.demo' });
  if (!organizer) {
    organizer = await User.create({
      name: 'Demo Organizer',
      email: 'organizer@eventflow.demo',
      password: 'demo1234',
      role: 'ORGANIZER',
    });
    console.log('Created organizer organizer@eventflow.demo / demo1234');
  }

  let visitor = await User.findOne({ email: 'visitor@eventflow.demo' });
  if (!visitor) {
    visitor = await User.create({
      name: 'Demo Visitor',
      email: 'visitor@eventflow.demo',
      password: 'demo1234',
      role: 'VISITOR',
    });
    console.log('Created visitor visitor@eventflow.demo / demo1234');
  }

  let event = await Event.findOne({ name: 'City Mega Music Festival' });
  if (!event) {
    const start = new Date();
    start.setHours(18, 0, 0, 0);
    event = await Event.create({
      name: 'City Mega Music Festival',
      date: start,
      startTime: '18:00',
      endTime: '23:30',
      venue: {
        name: 'City Grounds',
        address: 'Mumbai, India',
        latitude: 19.076,
        longitude: 72.8777,
      },
      expectedAttendance: 48000,
      venueCapacity: 50000,
      organizerId: organizer._id,
      status: 'LIVE',
    });
    console.log('Created demo event:', event.name);
  }

  const existingZones = await Zone.countDocuments({ eventId: event._id });
  if (existingZones === 0) {
    await Zone.insertMany(
      DEMO_ZONES.map((z) => ({
        eventId: event._id,
        name: z.name,
        latitude: z.lat,
        longitude: z.lng,
        location: { type: 'Point', coordinates: [z.lng, z.lat] },
        capacity: z.capacity,
        type: z.type,
        currentOccupancy: 0,
        utilizationPercent: 0,
        crowdLevel: 'LOW',
        dataSource: 'SIMULATED',
        lastUpdated: new Date(),
      }))
    );
    console.log(`Inserted ${DEMO_ZONES.length} zones (occupancy starts at 0 until simulation — Phase 9)`);
  } else {
    console.log('Zones already exist for demo event, skipping zone insert');
  }

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

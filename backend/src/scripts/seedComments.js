import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import { SocialSignal } from '../models/SocialSignal.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vedang:vedang21@project1.kzcuh2v.mongodb.net/eventflow?appName=project1';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const event1Id = new mongoose.Types.ObjectId('66f54c98c70f45a2aade5011');
  const event2Id = new mongoose.Types.ObjectId('66f54c98c70f45a2aade5022');
  const event3Id = new mongoose.Types.ObjectId('66f54c98c70f45a2aade5033');

  await SocialSignal.deleteMany({ eventId: { $in: [event1Id, event2Id, event3Id] } });

  // Event 1: Live Current Event
  await SocialSignal.create([
    {
      eventId: event1Id,
      visitorName: 'Rohan Sharma',
      comment: 'Food court was extremely crowded around 7 PM, but the main stage entry gate was very fast and well organized!',
      rating: 4,
      sentiment: 'POSITIVE',
      managementScore: 88,
      topics: ['GATE_ENTRY', 'FACILITIES', 'CROWD_MANAGEMENT'],
      aiSummary: 'Positive gate entry experience; noted food court congestion.',
    },
    {
      eventId: event1Id,
      visitorName: 'Ananya Verma',
      comment: 'Great management despite the rain delay! Staff handed out ponchos and kept the exit queue moving smoothly.',
      rating: 5,
      sentiment: 'POSITIVE',
      managementScore: 94,
      topics: ['WEATHER_IMPACT', 'CROWD_MANAGEMENT', 'FACILITIES'],
      aiSummary: 'Praised rain protocol and smooth exit wave management.',
    },
    {
      eventId: event1Id,
      visitorName: 'Vikram Patel',
      comment: 'Gate 3 queue was super slow due to ticket scanner bottleneck.',
      rating: 2,
      sentiment: 'NEGATIVE',
      managementScore: 55,
      topics: ['GATE_ENTRY', 'CROWD_MANAGEMENT'],
      aiSummary: 'Negative review highlighting gate 3 scanner bottleneck.',
    }
  ]);

  // Event 2: Past Event (Celestial Music Festival)
  await SocialSignal.create([
    {
      eventId: event2Id,
      visitorName: 'Priya Nair',
      comment: 'Acoustics were amazing! Clean washrooms and zero line at VIP entry gate.',
      rating: 5,
      sentiment: 'POSITIVE',
      managementScore: 96,
      topics: ['ENTERTAINMENT', 'FACILITIES', 'GATE_ENTRY'],
      aiSummary: 'Excellent review praising sound quality and clean washrooms.',
    },
    {
      eventId: event2Id,
      visitorName: 'Karan Malhotra',
      comment: 'Parking exit took 45 minutes after main artist finished. Need better traffic marshals.',
      rating: 3,
      sentiment: 'NEUTRAL',
      managementScore: 70,
      topics: ['CROWD_MANAGEMENT', 'FACILITIES'],
      aiSummary: 'Mixed review noting parking egress delay.',
    }
  ]);

  // Event 3: Past Event (International Hackathon Summit)
  await SocialSignal.create([
    {
      eventId: event3Id,
      visitorName: 'David Miller',
      comment: 'High speed WiFi worked perfectly throughout the main hall! Registration was seamless.',
      rating: 5,
      sentiment: 'POSITIVE',
      managementScore: 95,
      topics: ['FACILITIES', 'GATE_ENTRY'],
      aiSummary: 'Praised registration speed and infrastructure reliability.',
    }
  ]);

  console.log('Successfully seeded visitor comments across multiple events!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

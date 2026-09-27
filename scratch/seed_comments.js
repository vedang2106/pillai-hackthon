import mongoose from 'mongoose';
import { SocialSignal } from '../backend/src/models/SocialSignal.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventflow';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const eventId = new mongoose.Types.ObjectId('66f54c98c70f45a2aade5011');

  await SocialSignal.deleteMany({ eventId });

  await SocialSignal.create([
    {
      eventId,
      visitorName: 'Rohan Sharma',
      comment: 'Food court was extremely crowded around 7 PM, but the main stage entry gate was very fast and well organized!',
      rating: 4,
      sentiment: 'POSITIVE',
      managementScore: 88,
      topics: ['GATE_ENTRY', 'FOOD_FACILITIES', 'CROWD_MANAGEMENT'],
      aiSummary: 'Positive gate entry experience; noted food court congestion.',
    },
    {
      eventId,
      visitorName: 'Ananya Verma',
      comment: 'Great management despite the rain delay! Staff handed out ponchos and kept the exit queue moving smoothly.',
      rating: 5,
      sentiment: 'POSITIVE',
      managementScore: 94,
      topics: ['WEATHER_IMPACT', 'CROWD_MANAGEMENT', 'FACILITIES'],
      aiSummary: 'Praised rain protocol and smooth exit wave management.',
    },
    {
      eventId,
      visitorName: 'Vikram Patel',
      comment: 'Gate 3 queue was super slow due to ticket scanner bottleneck.',
      rating: 2,
      sentiment: 'NEGATIVE',
      managementScore: 55,
      topics: ['GATE_ENTRY', 'CROWD_MANAGEMENT'],
      aiSummary: 'Negative review highlighting gate 3 scanner bottleneck.',
    }
  ]);

  console.log('Successfully seeded visitor comments with AI sentiment!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

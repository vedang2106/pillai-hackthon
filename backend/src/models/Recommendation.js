import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false, index: true },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: false, index: true },
    title: { type: String, required: true },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    targetRole: {
      type: String,
      enum: ['VISITOR', 'ORGANIZER', 'GOVERNMENT'],
      required: true,
    },
    reason: { type: String, required: true },
    action: { type: String, required: true },
    expectedImpact: { type: String, required: true },
    source: {
      type: String,
      enum: ['AI_PREDICTION', 'GOVERNMENT_VERIFIED', 'ORGANIZER', 'SIMULATED'],
      default: 'AI_PREDICTION',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXECUTED'],
      default: 'PENDING',
    },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

export const Recommendation = mongoose.model('Recommendation', recommendationSchema);

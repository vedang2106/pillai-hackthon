import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false, index: true },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: false, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    targetAudience: {
      type: String,
      enum: ['ORGANIZER', 'GOVERNMENT', 'VISITOR', 'ALL'],
      default: 'ALL',
    },
    source: {
      type: String,
      enum: ['AI_PREDICTION', 'GOVERNMENT_VERIFIED', 'ORGANIZER', 'USER_REPORTED', 'SIMULATED'],
      default: 'AI_PREDICTION',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED', 'DISMISSED'],
      default: 'ACTIVE',
    },
    predictedTimeToThreshold: { type: Number, default: null }, // in minutes
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

export const Alert = mongoose.model('Alert', alertSchema);

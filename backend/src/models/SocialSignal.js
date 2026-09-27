import mongoose from 'mongoose';

const socialSignalSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    visitorName: { type: String, default: 'Attendee Visitor' },
    comment: { type: String, required: true },
    rating: { type: Number, default: 4, min: 1, max: 5 },
    sentiment: {
      type: String,
      enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'PANIC'],
      default: 'POSITIVE',
    },
    managementScore: { type: Number, default: 85 },
    topics: [{ type: String }],
    aiSummary: { type: String, default: 'Overall smooth management reported by attendee.' },
    source: { type: String, default: 'VISITOR_COMMENT' },
  },
  { timestamps: true }
);

export const SocialSignal = mongoose.model('SocialSignal', socialSignalSchema);

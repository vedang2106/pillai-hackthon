import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false, index: true },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: false, index: true },
    modelVersion: { type: String, default: 'xgboost-v1.2.0' },
    predictedValue: { type: Number, required: true },
    actualValue: { type: Number, required: true },
    error: { type: Number, required: true }, // abs(predicted - actual)
    metricType: { type: String, default: 'DEMAND_PREDICTION' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);

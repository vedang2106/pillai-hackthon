import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    eventName: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    visitorName: { type: String, required: true, trim: true },
    visitorEmail: { type: String, required: true, trim: true, lowercase: true },
    tierName: { type: String, required: true, default: 'Normal Pass' },
    price: { type: Number, required: true, min: 0, default: 0 },
    entryZoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: true },
    entryZoneName: { type: String, required: true },
    qrCodeData: { type: String, required: true },
    status: {
      type: String,
      enum: ['VALID', 'CHECKED_IN', 'CANCELLED'],
      default: 'VALID',
    },
    checkedInAt: { type: Date },
    scannedByGuardId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Ticket = mongoose.model('Ticket', ticketSchema);

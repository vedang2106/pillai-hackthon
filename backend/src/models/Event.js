import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, default: 'General' },
    date: { type: Date, required: true },
    endDate: { type: Date },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    venue: {
      name: { type: String, required: true, trim: true },
      address: { type: String, trim: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    expectedAttendance: { type: Number, required: true, min: 1 },
    venueCapacity: { type: Number, required: true, min: 1 },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedOrganizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    source: {
      type: String,
      enum: ['GOVERNMENT', 'ORGANIZER'],
      default: 'ORGANIZER',
    },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'PENDING', 'UNVERIFIED'],
      default: 'UNVERIFIED',
    },
    governmentVerified: { type: Boolean, default: false },
    officialTrafficRestrictions: { type: String, default: '' },
    officialRoadClosures: { type: String, default: '' },
    officialTransportInfo: { type: String, default: '' },
    emergencyInfo: { type: String, default: '' },
    ticketTiers: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, default: 0 },
        totalQuantity: { type: Number, required: true, default: 1000 },
        soldQuantity: { type: Number, default: 0 },
        entryZoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
        entryZoneName: { type: String, default: 'Gate 1 Main Entry' },
      },
    ],
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'APPROVED', 'SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
  },
  { timestamps: true }
);

eventSchema.index({ organizerId: 1, date: -1 });
eventSchema.index({ date: 1 });

export const Event = mongoose.model('Event', eventSchema);

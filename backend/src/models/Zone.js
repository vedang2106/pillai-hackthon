import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    name: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
    },
    capacity: { type: Number, required: true, min: 1 },
    type: {
      type: String,
      enum: [
        'GATE',
        'VENUE',
        'STAGE',
        'FOOD',
        'PARKING',
        'RAIL',
        'BUS',
        'METRO',
        'HOTEL',
        'ROAD',
        'OTHER',
      ],
      default: 'OTHER',
    },
    connectedZones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Zone' }],
    currentOccupancy: { type: Number, default: 0, min: 0 },
    crowdLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    trafficLevel: {
      type: String,
      enum: ['NORMAL', 'SLOW', 'HEAVY'],
      default: 'NORMAL',
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    utilizationPercent: { type: Number, default: 0, min: 0, max: 100 },
    dataSource: {
      type: String,
      enum: ['LIVE', 'SIMULATED', 'USER_REPORTED', 'PREDICTED', 'HISTORICAL'],
      default: 'SIMULATED',
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

zoneSchema.pre('save', function setGeo(next) {
  if (this.latitude != null && this.longitude != null) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
    };
  }
  next();
});

zoneSchema.index({ location: '2dsphere' });

export const Zone = mongoose.model('Zone', zoneSchema);

import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Zone } from '../models/Zone.js';

function computeUtilization(zone) {
  if (!zone.capacity) return 0;
  return Math.min(100, Math.round((zone.currentOccupancy / zone.capacity) * 100));
}

function crowdFromUtilization(pct) {
  if (pct >= 90) return 'CRITICAL';
  if (pct >= 75) return 'HIGH';
  if (pct >= 50) return 'MEDIUM';
  return 'LOW';
}

export async function listZonesByEvent(req, res) {
  const { eventId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: 'Invalid event id' });
  }
  const zones = await Zone.find({ eventId }).sort({ name: 1 }).lean();
  res.json({ zones, dataSourceLabel: 'Backend state (simulation engine pending — Phase 9)' });
}

export async function createZone(req, res) {
  const {
    eventId,
    name,
    latitude,
    longitude,
    capacity,
    type,
    connectedZones,
    currentOccupancy,
  } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const isGov = req.user.role === 'GOVERNMENT_AUTHORITY' || req.user.role === 'ADMIN';
  const isOwner = event.organizerId?.toString() === req.user.id || event.assignedOrganizerId?.toString() === req.user.id;

  if (!isGov && !isOwner) {
    return res.status(403).json({ message: 'Not allowed to add zones to this event' });
  }

  const baseLat = event.venue?.latitude ?? 19.076;
  const baseLng = event.venue?.longitude ?? 72.8777;
  const zoneLat = latitude != null && !isNaN(Number(latitude)) && Number(latitude) !== 0
    ? Number(latitude)
    : baseLat + (Math.random() - 0.5) * 0.003;
  const zoneLng = longitude != null && !isNaN(Number(longitude)) && Number(longitude) !== 0
    ? Number(longitude)
    : baseLng + (Math.random() - 0.5) * 0.003;

  const occupancy = currentOccupancy ?? 0;
  const utilizationPercent = capacity ? Math.min(100, Math.round((occupancy / capacity) * 100)) : 0;

  const zone = await Zone.create({
    eventId,
    name,
    latitude: zoneLat,
    longitude: zoneLng,
    capacity: Number(capacity) || 1000,
    type: type || 'GATE',
    connectedZones: connectedZones ?? [],
    currentOccupancy: occupancy,
    utilizationPercent,
    crowdLevel: crowdFromUtilization(utilizationPercent),
    dataSource: 'SIMULATED',
    lastUpdated: new Date(),
  });

  const io = req.app.get('io');
  io?.to(`event:${eventId}`).emit('zones:updated', { eventId });

  res.status(201).json({ zone });
}

export async function updateZone(req, res) {
  const zone = await Zone.findById(req.params.id);
  if (!zone) {
    return res.status(404).json({ message: 'Zone not found' });
  }

  const event = await Event.findById(zone.eventId);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  if (event.organizerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Not allowed to update this zone' });
  }

  const updatable = [
    'name',
    'latitude',
    'longitude',
    'capacity',
    'type',
    'connectedZones',
    'currentOccupancy',
    'crowdLevel',
    'trafficLevel',
    'riskLevel',
    'gateStatus',
    'redirectGateId',
    'redirectGateName',
    'redirectNotice',
    'gateChangeReason',
    'dataSource',
  ];
  for (const key of updatable) {
    if (req.body[key] !== undefined) zone[key] = req.body[key];
  }
  zone.utilizationPercent = computeUtilization(zone);
  if (req.body.crowdLevel === undefined) {
    zone.crowdLevel = crowdFromUtilization(zone.utilizationPercent);
  }
  zone.lastUpdated = new Date();
  await zone.save();

  const io = req.app.get('io');
  io?.to(`event:${zone.eventId}`).emit('zone:updated', { zoneId: zone._id, eventId: zone.eventId });

  res.json({ zone });
}

export async function deleteZone(req, res) {
  const zone = await Zone.findById(req.params.id);
  if (!zone) {
    return res.status(404).json({ message: 'Zone not found' });
  }
  const event = await Event.findById(zone.eventId);
  if (event.organizerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Not allowed to delete this zone' });
  }
  const eventId = zone.eventId;
  await zone.deleteOne();
  const io = req.app.get('io');
  io?.to(`event:${eventId}`).emit('zones:updated', { eventId });
  res.status(204).send();
}

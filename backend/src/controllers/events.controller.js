import { Event } from '../models/Event.js';
import { Zone } from '../models/Zone.js';
import { User } from '../models/User.js';

export async function listEvents(req, res) {
  const events = await Event.find()
    .populate('organizerId', 'name email')
    .populate('assignedOrganizerId', 'name email')
    .sort({ date: 1 })
    .lean();
  res.json({ events });
}

export async function getEvent(req, res) {
  const event = await Event.findById(req.params.id)
    .populate('organizerId', 'name email')
    .populate('assignedOrganizerId', 'name email')
    .lean();
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json({ event });
}

export async function createEvent(req, res) {
  const {
    name,
    description,
    category,
    date,
    endDate,
    startTime,
    endTime,
    venue,
    expectedAttendance,
    venueCapacity,
    status,
  } = req.body;

  const event = await Event.create({
    name,
    description,
    category: category || 'General',
    date,
    endDate,
    startTime,
    endTime,
    venue,
    expectedAttendance,
    venueCapacity: venueCapacity || expectedAttendance,
    status: status || 'SCHEDULED',
    source: req.user.role === 'GOVERNMENT_AUTHORITY' ? 'GOVERNMENT' : 'ORGANIZER',
    verificationStatus: req.user.role === 'GOVERNMENT_AUTHORITY' ? 'VERIFIED' : 'UNVERIFIED',
    governmentVerified: req.user.role === 'GOVERNMENT_AUTHORITY',
    organizerId: req.user.id,
  });

  res.status(201).json({ event });
}

export async function createOfficialEvent(req, res) {
  const {
    name,
    description,
    category,
    date,
    endDate,
    startTime,
    endTime,
    venue,
    expectedAttendance,
    venueCapacity,
    assignedOrganizerId,
    officialTrafficRestrictions,
    officialRoadClosures,
    officialTransportInfo,
    emergencyInfo,
    status,
  } = req.body;

  const event = await Event.create({
    name,
    description,
    category: category || 'General',
    date,
    endDate: endDate || date,
    startTime,
    endTime,
    venue,
    expectedAttendance,
    venueCapacity: venueCapacity || expectedAttendance,
    assignedOrganizerId: assignedOrganizerId || null,
    organizerId: assignedOrganizerId || req.user.id,
    source: 'GOVERNMENT',
    verificationStatus: 'VERIFIED',
    governmentVerified: true,
    status: status || 'APPROVED',
    officialTrafficRestrictions: officialTrafficRestrictions || '',
    officialRoadClosures: officialRoadClosures || '',
    officialTransportInfo: officialTransportInfo || '',
    emergencyInfo: emergencyInfo || '',
  });

  res.status(201).json({ event });
}

export async function getGovernmentOverview(req, res) {
  const events = await Event.find()
    .populate('organizerId', 'name email')
    .populate('assignedOrganizerId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const organizers = await User.find({ role: 'ORGANIZER' }).select('name email role').lean();

  const metrics = {
    totalEvents: events.length,
    governmentVerified: events.filter((e) => e.governmentVerified || e.verificationStatus === 'VERIFIED').length,
    pendingApprovals: events.filter((e) => e.verificationStatus === 'PENDING' || e.verificationStatus === 'UNVERIFIED').length,
    liveEvents: events.filter((e) => e.status === 'LIVE').length,
    unassignedEvents: events.filter((e) => !e.assignedOrganizerId && !e.organizerId).length,
  };

  res.json({ metrics, events, organizers });
}

export async function verifyEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  event.verificationStatus = 'VERIFIED';
  event.governmentVerified = true;
  if (event.status === 'DRAFT' || event.status === 'PENDING') {
    event.status = 'APPROVED';
  }
  await event.save();
  res.json({ event });
}

export async function assignOrganizer(req, res) {
  const { organizerId } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  event.assignedOrganizerId = organizerId;
  event.organizerId = organizerId;
  await event.save();
  
  const updatedEvent = await Event.findById(event._id)
    .populate('organizerId', 'name email')
    .populate('assignedOrganizerId', 'name email')
    .lean();

  res.json({ event: updatedEvent });
}

export async function updateEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  
  const isGov = req.user.role === 'GOVERNMENT_AUTHORITY' || req.user.role === 'ADMIN';
  const isOwner = event.organizerId?.toString() === req.user.id || event.assignedOrganizerId?.toString() === req.user.id;

  if (!isGov && !isOwner) {
    return res.status(403).json({ message: 'Not allowed to update this event' });
  }

  const fields = [
    'name',
    'description',
    'category',
    'date',
    'endDate',
    'startTime',
    'endTime',
    'venue',
    'expectedAttendance',
    'venueCapacity',
    'status',
    'officialTrafficRestrictions',
    'officialRoadClosures',
    'officialTransportInfo',
    'emergencyInfo',
  ];
  for (const key of fields) {
    if (req.body[key] !== undefined) event[key] = req.body[key];
  }

  if (isGov && req.body.assignedOrganizerId !== undefined) {
    event.assignedOrganizerId = req.body.assignedOrganizerId;
    if (req.body.assignedOrganizerId) {
      event.organizerId = req.body.assignedOrganizerId;
    }
  }

  await event.save();
  res.json({ event });
}

export async function deleteEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const isGov = req.user.role === 'GOVERNMENT_AUTHORITY' || req.user.role === 'ADMIN';
  const isOwner = event.organizerId?.toString() === req.user.id || event.assignedOrganizerId?.toString() === req.user.id;

  if (!isGov && !isOwner) {
    return res.status(403).json({ message: 'Not allowed to delete this event' });
  }

  await Zone.deleteMany({ eventId: event._id });
  await event.deleteOne();
  res.status(204).send();
}

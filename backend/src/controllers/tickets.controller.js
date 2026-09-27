import { Event } from '../models/Event.js';
import { Zone } from '../models/Zone.js';
import { Ticket } from '../models/Ticket.js';
import { Alert } from '../models/Alert.js';

// Helper to generate unique 8-character Ticket ID
function generateTicketId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'TKT-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 1. Get Ticket Tiers for an Event
export async function getTicketTiers(req, res) {
  const { eventId } = req.params;
  const event = await Event.findById(eventId).lean();
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  // If no tiers exist yet, auto-initialize with default tiers linked to event's gate zones
  if (!event.ticketTiers || event.ticketTiers.length === 0) {
    const zones = await Zone.find({ eventId }).lean();
    const gateZone = zones.find((z) => z.type === 'GATE') || zones[0] || { _id: null, name: 'Main Gate' };

    const defaultTiers = [
      {
        name: 'Normal Pass',
        price: 499,
        totalQuantity: 1000,
        soldQuantity: 0,
        entryZoneId: gateZone._id,
        entryZoneName: gateZone.name,
      },
      {
        name: 'VIP Pass',
        price: 1499,
        totalQuantity: 300,
        soldQuantity: 0,
        entryZoneId: gateZone._id,
        entryZoneName: `${gateZone.name} (VIP Lane)`,
      },
      {
        name: 'Premium Access',
        price: 2999,
        totalQuantity: 100,
        soldQuantity: 0,
        entryZoneId: gateZone._id,
        entryZoneName: `${gateZone.name} (Fast-Track)`,
      },
    ];

    await Event.findByIdAndUpdate(eventId, { ticketTiers: defaultTiers });
    return res.json({ tiers: defaultTiers });
  }

  res.json({ tiers: event.ticketTiers });
}

// 2. Configure / Save Ticket Tiers (Organizer)
export async function saveTicketTiers(req, res) {
  const { eventId } = req.params;
  const { tiers } = req.body;

  if (!Array.isArray(tiers) || tiers.length === 0) {
    return res.status(400).json({ message: 'At least one ticket tier is required.' });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  event.ticketTiers = tiers.map((t) => ({
    name: t.name,
    price: Number(t.price) || 0,
    totalQuantity: Number(t.totalQuantity) || 100,
    soldQuantity: Number(t.soldQuantity) || 0,
    entryZoneId: t.entryZoneId || null,
    entryZoneName: t.entryZoneName || 'Gate 1 Main Entry',
  }));

  await event.save();

  const io = req.app.get('io');
  io?.to(`event:${eventId}`).emit('ticketTiers:update', event.ticketTiers);
  io?.emit('ticketTiers:update', event.ticketTiers);

  res.json({ message: 'Ticket tiers updated successfully', tiers: event.ticketTiers });
}

// 3. Purchase Ticket (Visitor)
export async function purchaseTicket(req, res) {
  const { eventId, tierName, visitorName, visitorEmail, quantity = 1 } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const tier = event.ticketTiers.find((t) => t.name === tierName) || event.ticketTiers[0];
  if (!tier) {
    return res.status(400).json({ message: 'Selected ticket tier does not exist.' });
  }

  if (tier.soldQuantity + quantity > tier.totalQuantity) {
    return res.status(400).json({ message: 'Selected ticket tier is sold out.' });
  }

  // Find assigned entry zone
  let zone = null;
  if (tier.entryZoneId) {
    zone = await Zone.findById(tier.entryZoneId);
  }
  if (!zone) {
    zone = await Zone.findOne({ eventId, type: 'GATE' }) || await Zone.findOne({ eventId });
  }

  const createdTickets = [];
  for (let i = 0; i < quantity; i++) {
    const tId = generateTicketId();
    const qrData = JSON.stringify({
      ticketId: tId,
      eventId: event._id,
      eventName: event.name,
      visitorName,
      visitorEmail,
      tierName: tier.name,
      entryZoneId: zone?._id,
      entryZoneName: zone?.name || tier.entryZoneName,
    });

    const ticket = await Ticket.create({
      ticketId: tId,
      eventId: event._id,
      eventName: event.name,
      userId: req.user?._id || null,
      visitorName,
      visitorEmail,
      tierName: tier.name,
      price: tier.price,
      entryZoneId: zone?._id,
      entryZoneName: zone?.name || tier.entryZoneName,
      qrCodeData: qrData,
      status: 'VALID',
    });

    createdTickets.push(ticket);
  }

  // Update sold quantity
  tier.soldQuantity += quantity;
  await event.save();

  const io = req.app.get('io');
  io?.to(`event:${eventId}`).emit('ticketTiers:update', event.ticketTiers);
  io?.emit('ticketTiers:update', event.ticketTiers);

  res.status(201).json({
    message: 'Ticket purchased successfully!',
    tickets: createdTickets,
  });
}

// 4. Get Visitor My Tickets
export async function getMyTickets(req, res) {
  const query = {};
  if (req.user?._id) {
    query.userId = req.user._id;
  } else if (req.query.email) {
    query.visitorEmail = req.query.email.toLowerCase();
  } else {
    return res.json({ tickets: [] });
  }

  const tickets = await Ticket.find(query).sort({ createdAt: -1 }).lean();
  res.json({ tickets });
}

// 5. Gate Guard QR Scanner API (Scan Ticket & Live Danger Calculation)
export async function scanTicket(req, res) {
  const { ticketId, qrCodeData, eventId } = req.body;
  const searchId = ticketId || (qrCodeData ? (typeof qrCodeData === 'string' ? JSON.parse(qrCodeData)?.ticketId : qrCodeData?.ticketId) : null);

  if (!searchId) {
    return res.status(400).json({ message: 'Ticket ID or QR Code data is required.' });
  }

  const ticket = await Ticket.findOne({ ticketId: searchId.trim().toUpperCase() });
  if (!ticket) {
    return res.status(404).json({ message: `❌ INVALID TICKET: No record found for ID '${searchId}'.` });
  }

  if (eventId && ticket.eventId.toString() !== eventId.toString()) {
    return res.status(400).json({ message: `❌ TICKET MISMATCH: Ticket belongs to a different event.` });
  }

  if (ticket.status === 'CHECKED_IN') {
    return res.status(400).json({
      message: `❌ TICKET ALREADY USED! Checked in on ${new Date(ticket.checkedInAt).toLocaleTimeString()}. Entry denied.`,
      ticket,
    });
  }

  // Update ticket status
  ticket.status = 'CHECKED_IN';
  ticket.checkedInAt = new Date();
  ticket.scannedByGuardId = req.user?._id || null;
  await ticket.save();

  // Find Entry Zone and increment Occupancy
  let dangerLevel = 'LOW';
  let updatedZone = null;

  if (ticket.entryZoneId) {
    updatedZone = await Zone.findById(ticket.entryZoneId);
    if (updatedZone) {
      updatedZone.currentOccupancy = (updatedZone.currentOccupancy || 0) + 1;
      const util = Math.min(100, Math.round((updatedZone.currentOccupancy / updatedZone.capacity) * 100));
      updatedZone.utilizationPercent = util;

      if (util > 85) {
        dangerLevel = 'CRITICAL'; // EXTREME DANGER (>85%)
      } else if (util >= 70) {
        dangerLevel = 'HIGH'; // HIGH CONGESTION (70-85%)
      } else if (util >= 40) {
        dangerLevel = 'MEDIUM'; // MODERATE (40-70%)
      } else {
        dangerLevel = 'LOW'; // NORMAL (0-40%)
      }

      updatedZone.crowdLevel = dangerLevel;
      updatedZone.riskLevel = dangerLevel;
      updatedZone.lastUpdated = new Date();
      await updatedZone.save();

      // Emit real-time Socket.IO zone update
      const io = req.app.get('io');
      io?.to(`event:${ticket.eventId}`).emit('zone:update', updatedZone);
      io?.to(`event:${ticket.eventId}`).emit('zone:updated', { zoneId: updatedZone._id, eventId: ticket.eventId });
      io?.to(`event:${ticket.eventId}`).emit('zones:updated', { eventId: ticket.eventId });
      io?.emit('zone:update', updatedZone);

      let newAlert = null;
      if (dangerLevel === 'HIGH' || dangerLevel === 'CRITICAL') {
        const isExtreme = dangerLevel === 'CRITICAL';
        const alertTitle = isExtreme
          ? `🚨 EXTREME DANGER: ${updatedZone.name.toUpperCase()} (>85%)`
          : `⚠️ HIGH CONGESTION: ${updatedZone.name.toUpperCase()} (70-85%)`;

        const alertMessage = isExtreme
          ? `CRITICAL OVERCROWDING ALERT! ${updatedZone.name} reached ${updatedZone.currentOccupancy}/${updatedZone.capacity} (${util}%). Immediate crowd redirection required!`
          : `HIGH CROWD WARNING! ${updatedZone.name} reached ${updatedZone.currentOccupancy}/${updatedZone.capacity} (${util}%). Monitor gate flow.`;

        newAlert = await Alert.create({
          eventId: ticket.eventId,
          zoneId: updatedZone._id,
          title: alertTitle,
          message: alertMessage,
          severity: dangerLevel,
          targetAudience: 'ORGANIZER',
          source: 'GUARD_SCANNER',
        });

        io?.to(`event:${ticket.eventId}`).emit('alert:new', newAlert);
        io?.to(`event:${ticket.eventId}`).emit('organizer:alert', newAlert);
        io?.emit('alert:new', newAlert);
      }

      return res.json({
        success: true,
        message: `✅ TICKET VALIDATED: CHECK IN SUCCESSFUL`,
        ticket: {
          ticketId: ticket.ticketId,
          visitorName: ticket.visitorName,
          tierName: ticket.tierName,
          entryZoneName: ticket.entryZoneName,
          checkedInAt: ticket.checkedInAt,
        },
        alert: newAlert,
        zoneStatus: {
          zoneName: updatedZone.name,
          currentOccupancy: updatedZone.currentOccupancy,
          capacity: updatedZone.capacity,
          utilizationPercent: updatedZone.utilizationPercent,
          riskLevel: updatedZone.riskLevel,
          dangerStatus:
            dangerLevel === 'CRITICAL'
              ? '🚨 EXTREME DANGER (>85%)'
              : dangerLevel === 'HIGH'
              ? '⚠️ HIGH CONGESTION (70-85%)'
              : dangerLevel === 'MEDIUM'
              ? '🟡 MODERATE (40-70%)'
              : '🟢 NORMAL (0-40%)',
        },
      });
    }
  }

  res.json({
    success: true,
    message: `✅ TICKET VALIDATED: CHECK IN SUCCESSFUL`,
    ticket: {
      ticketId: ticket.ticketId,
      visitorName: ticket.visitorName,
      tierName: ticket.tierName,
      entryZoneName: ticket.entryZoneName,
      checkedInAt: ticket.checkedInAt,
    },
    alert: null,
    zoneStatus: null,
  });
}

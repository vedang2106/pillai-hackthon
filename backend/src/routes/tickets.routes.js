import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getTicketTiers,
  saveTicketTiers,
  purchaseTicket,
  getMyTickets,
  scanTicket,
} from '../controllers/tickets.controller.js';

const router = Router();

// Get & Save Ticket Tiers
router.get('/tiers/:eventId', asyncHandler(getTicketTiers));
router.post('/tiers/:eventId', authenticate, authorize('ORGANIZER', 'GOVERNMENT_AUTHORITY', 'ADMIN'), asyncHandler(saveTicketTiers));

// Visitor Ticket Purchase & My Tickets
router.post('/purchase', asyncHandler(purchaseTicket));
router.get('/my-tickets', asyncHandler(getMyTickets));

// Gate Guard Scanner API
router.post('/scan', asyncHandler(scanTicket));

export default router;

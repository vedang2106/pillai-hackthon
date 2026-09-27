import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import {
  postVisitorComment,
  getEventSocialSignals,
  getOrganizerSocialHistory,
} from '../controllers/social.controller.js';

const router = Router();

// Public / Visitor POST comment
router.post('/comments', asyncHandler(postVisitorComment));

// Get Social Signals for an Event
router.get('/event/:eventId', asyncHandler(getEventSocialSignals));

// Get Organizer Multi-Event Social & Management History
router.get('/organizer-history', authenticate, asyncHandler(getOrganizerSocialHistory));

export default router;

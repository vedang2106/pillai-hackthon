import { Router } from 'express';
import { body, param } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createEvent,
  createOfficialEvent,
  deleteEvent,
  getEvent,
  getGovernmentOverview,
  listEvents,
  updateEvent,
  verifyEvent,
  assignOrganizer,
} from '../controllers/events.controller.js';

const router = Router();

async function validate(req, res) {
  const { validationResult } = await import('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
}

router.get('/', asyncHandler(listEvents));

router.get(
  '/government/overview',
  authenticate,
  authorize('GOVERNMENT_AUTHORITY', 'ADMIN'),
  asyncHandler(getGovernmentOverview)
);

router.post(
  '/official',
  authenticate,
  authorize('GOVERNMENT_AUTHORITY', 'ADMIN'),
  [
    body('name').trim().notEmpty(),
    body('date').isISO8601(),
    body('startTime').notEmpty(),
    body('endTime').notEmpty(),
    body('venue.name').trim().notEmpty(),
    body('expectedAttendance').isInt({ min: 1 }),
  ],
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await createOfficialEvent(req, res);
  })
);

router.patch(
  '/:id/verify',
  authenticate,
  authorize('GOVERNMENT_AUTHORITY', 'ADMIN'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await verifyEvent(req, res);
  })
);

router.patch(
  '/:id/assign-organizer',
  authenticate,
  authorize('GOVERNMENT_AUTHORITY', 'ADMIN'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await assignOrganizer(req, res);
  })
);

router.get(
  '/:id',
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await getEvent(req, res);
  })
);

router.post(
  '/',
  authenticate,
  authorize('ORGANIZER', 'GOVERNMENT_AUTHORITY', 'ADMIN'),
  [
    body('name').trim().notEmpty(),
    body('date').isISO8601(),
    body('startTime').notEmpty(),
    body('endTime').notEmpty(),
    body('venue.name').trim().notEmpty(),
    body('expectedAttendance').isInt({ min: 1 }),
  ],
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await createEvent(req, res);
  })
);

router.patch(
  '/:id',
  authenticate,
  authorize('ORGANIZER', 'GOVERNMENT_AUTHORITY', 'ADMIN'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await updateEvent(req, res);
  })
);

router.delete(
  '/:id',
  authenticate,
  authorize('ORGANIZER', 'GOVERNMENT_AUTHORITY', 'ADMIN'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await deleteEvent(req, res);
  })
);

export default router;

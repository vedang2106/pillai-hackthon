import { Router } from 'express';
import { body, param } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createZone,
  deleteZone,
  listZonesByEvent,
  updateZone,
} from '../controllers/zones.controller.js';

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

router.get(
  '/:eventId',
  param('eventId').isMongoId(),
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await listZonesByEvent(req, res);
  })
);

router.post(
  '/',
  authenticate,
  authorize('ORGANIZER', 'GOVERNMENT_AUTHORITY', 'ADMIN'),
  [
    body('eventId').isMongoId(),
    body('name').trim().notEmpty(),
    body('capacity').isInt({ min: 1 }),
    body('type').optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await createZone(req, res);
  })
);

router.patch(
  '/:id',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await updateZone(req, res);
  })
);

router.delete(
  '/:id',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await deleteZone(req, res);
  })
);

export default router;

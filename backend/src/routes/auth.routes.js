import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { login, me, register, listOrganizers } from '../controllers/auth.controller.js';

const router = Router();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['VISITOR', 'ORGANIZER', 'GOVERNMENT_AUTHORITY']),
];

const loginValidation = [
  body('email').isEmail(),
  body('password').notEmpty(),
];

router.post(
  '/register',
  registerValidation,
  asyncHandler(async (req, res, next) => {
    const { validationResult } = await import('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await register(req, res);
  })
);

router.post(
  '/login',
  loginValidation,
  asyncHandler(async (req, res) => {
    const { validationResult } = await import('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await login(req, res);
  })
);

router.get('/me', authenticate, asyncHandler(me));
router.get('/organizers', authenticate, asyncHandler(listOrganizers));

export default router;

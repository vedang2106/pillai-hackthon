import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

function signToken(user) {
  return jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    subject: user._id.toString(),
  });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function register(req, res) {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const allowedRoles = ['VISITOR', 'ORGANIZER', 'GOVERNMENT_AUTHORITY'];
  const userRole = allowedRoles.includes(role) ? role : 'VISITOR';
  const user = await User.create({ name, email, password, role: userRole });
  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ user: publicUser(user) });
}

export async function listOrganizers(_req, res) {
  const organizers = await User.find({ role: 'ORGANIZER' }).select('name email role').lean();
  res.json({ organizers });
}

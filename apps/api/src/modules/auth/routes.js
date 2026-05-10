import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AuthSession, User } from './model.js';
import { HttpError } from '../../common/http-error.js';
import { asyncHandler } from '../../common/async-handler.js';
import { authMiddleware } from '../../common/auth-middleware.js';

export const authRouter = Router();

const ACCESS_TOKEN_TTL = '1h';
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

function issueAccessToken(user) {
  return jwt.sign({ sub: user.id, tenantId: user.tenantId, role: user.role }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

function hashTokenId(tokenId) {
  return crypto.createHash('sha256').update(tokenId).digest('hex');
}

async function createSession(userId) {
  const tokenId = crypto.randomUUID();
  const tokenIdHash = hashTokenId(tokenId);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

  await AuthSession.create({ userId, tokenIdHash, expiresAt });

  const refreshToken = jwt.sign({ sub: String(userId), tid: tokenId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL_SECONDS
  });

  return refreshToken;
}

function validateSignupPayload(body) {
  const { email, password, tenantId } = body;
  if (!email || !password || !tenantId) throw new HttpError(400, 'Missing required fields');
  if (typeof password !== 'string' || password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
}

authRouter.post('/signup', asyncHandler(async (req, res) => {
  validateSignupPayload(req.body);
  const email = String(req.body.email).toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) throw new HttpError(409, 'Email already exists');

  const passwordHash = await bcrypt.hash(req.body.password, 12);
  const user = await User.create({ email, passwordHash, tenantId: req.body.tenantId });
  const token = issueAccessToken(user);
  const refreshToken = await createSession(user.id);

  res.status(201).json({ token, refreshToken, user: { id: user.id, email: user.email, tenantId: user.tenantId, role: user.role } });
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, 'Email and password are required');

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) throw new HttpError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new HttpError(401, 'Invalid credentials');

  const token = issueAccessToken(user);
  const refreshToken = await createSession(user.id);

  res.json({ token, refreshToken, user: { id: user.id, email: user.email, tenantId: user.tenantId, role: user.role } });
}));

authRouter.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new HttpError(400, 'Refresh token is required');

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Invalid refresh token');
  }

  const tokenIdHash = hashTokenId(payload.tid);
  const session = await AuthSession.findOne({ tokenIdHash, userId: payload.sub, expiresAt: { $gt: new Date() } });
  if (!session) throw new HttpError(401, 'Invalid refresh token');

  const user = await User.findById(payload.sub);
  if (!user) throw new HttpError(401, 'Invalid refresh token');

  await AuthSession.deleteOne({ _id: session._id });
  const nextRefreshToken = await createSession(user.id);
  const token = issueAccessToken(user);

  res.json({ token, refreshToken: nextRefreshToken });
}));

authRouter.post('/logout', authMiddleware, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new HttpError(400, 'Refresh token is required');

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Invalid refresh token');
  }

  if (String(payload.sub) !== String(req.user.sub)) throw new HttpError(403, 'Forbidden');

  const tokenIdHash = hashTokenId(payload.tid);
  await AuthSession.deleteOne({ tokenIdHash, userId: req.user.sub });

  res.status(204).send();
}));

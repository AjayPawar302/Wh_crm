import { Router } from 'express';
import { Contact } from './model.js';
import { asyncHandler } from '../../common/async-handler.js';
import { HttpError } from '../../common/http-error.js';

export const contactsRouter = Router();

contactsRouter.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const skip = (page - 1) * limit;

  const filter = { tenantId: req.user.tenantId };
  const [items, total] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Contact.countDocuments(filter)
  ]);

  res.json({ items, pagination: { page, limit, total } });
}));

contactsRouter.post('/', asyncHandler(async (req, res) => {
  const { name, phone, attributes = {}, tags = [] } = req.body;
  if (!name || !phone) throw new HttpError(400, 'name and phone are required');

  const contact = await Contact.create({ tenantId: req.user.tenantId, name, phone, attributes, tags });
  res.status(201).json(contact);
}));

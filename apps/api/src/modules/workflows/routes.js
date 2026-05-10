import { Router } from 'express';
import { Workflow } from './model.js';
import { asyncHandler } from '../../common/async-handler.js';
import { HttpError } from '../../common/http-error.js';

export const workflowsRouter = Router();

workflowsRouter.get('/', asyncHandler(async (req, res) => {
  const list = await Workflow.find({ tenantId: req.user.tenantId }).sort({ updatedAt: -1 });
  res.json(list);
}));

workflowsRouter.post('/', asyncHandler(async (req, res) => {
  const { name, graph } = req.body;
  if (!name || !graph) throw new HttpError(400, 'name and graph are required');

  const workflow = await Workflow.create({ ...req.body, tenantId: req.user.tenantId });
  res.status(201).json(workflow);
}));

workflowsRouter.patch('/:id', asyncHandler(async (req, res) => {
  const updated = await Workflow.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    { ...req.body },
    { new: true }
  );

  if (!updated) throw new HttpError(404, 'Workflow not found');
  res.json(updated);
}));

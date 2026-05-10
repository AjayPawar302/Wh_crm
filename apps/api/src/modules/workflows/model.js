import mongoose from 'mongoose';

const NodeSchema = new mongoose.Schema({ id: String, type: String, config: Object }, { _id: false });
const EdgeSchema = new mongoose.Schema({ from: String, to: String, condition: Object }, { _id: false });

const WorkflowSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    trigger: { type: String, required: true },
    nodes: { type: [NodeSchema], default: [] },
    edges: { type: [EdgeSchema], default: [] },
    active: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Workflow = mongoose.model('Workflow', WorkflowSchema);

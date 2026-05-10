import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    attributes: { type: Object, default: {} },
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const Contact = mongoose.model('Contact', ContactSchema);

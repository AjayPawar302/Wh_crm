import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    tenantId: { type: String, required: true, index: true },
    role: { type: String, enum: ['owner', 'admin', 'agent'], default: 'owner' }
  },
  { timestamps: true }
);

const authSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenIdHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const User = mongoose.model('User', userSchema);
export const AuthSession = mongoose.model('AuthSession', authSessionSchema);

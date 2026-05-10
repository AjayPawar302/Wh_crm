import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import { authRouter } from './modules/auth/routes.js';
import { contactsRouter } from './modules/contacts/routes.js';
import { workflowsRouter } from './modules/workflows/routes.js';
import { authMiddleware } from './common/auth-middleware.js';
import { errorMiddleware, notFoundMiddleware } from './common/error-middleware.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_, res) => res.json({ ok: true, service: 'api' }));
app.use('/auth', authRouter);
app.use('/contacts', authMiddleware, contactsRouter);
app.use('/workflows', authMiddleware, workflowsRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_ORIGIN || '*' } });

io.on('connection', (socket) => {
  socket.emit('connected', { id: socket.id, ts: Date.now() });
});

async function bootstrap() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');

  const port = Number(process.env.PORT || 4000);
  await mongoose.connect(process.env.MONGO_URI);
  server.listen(port, () => console.log(`API running on ${port}`));
}

bootstrap().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});

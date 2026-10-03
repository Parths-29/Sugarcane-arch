import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { register as promRegister, collectDefaultMetrics } from 'prom-client';
import { authRouter } from './modules/auth/auth.router';
import { advisoryRouter } from './modules/advisory/advisory.router';
import { metricsMiddleware, httpErrorsTotal } from './middleware/metrics';
import { requestIdMiddleware } from './middleware/requestId';

collectDefaultMetrics();

const app = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sugarcane_monolith';

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(metricsMiddleware);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/advisory', advisoryRouter);

// Health
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'sugarcane-monolith' });
});

// Metrics
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', promRegister.contentType);
  res.end(await promRegister.metrics());
});

// 404
app.use((_req, res) => {
  httpErrorsTotal.inc({ method: 'UNKNOWN', route: 'unknown', status_code: '404' });
  res.status(404).json({ code: 'NOT_FOUND', message: 'Route not found' });
});

async function start() {
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected');
  const server = app.listen(PORT, () => {
    console.log(`Monolith running on port ${PORT}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    server.close(() => {
      mongoose.disconnect().then(() => process.exit(0));
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});

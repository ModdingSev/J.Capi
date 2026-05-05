import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import productRouter from './routes/products';
import categoryRouter from './routes/categories';
import filterRouter from './routes/filters';
import blogRouter from './routes/blog';
import searchRouter from './routes/search';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── SEGURIDAD ────────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origen no permitido → ${origin}`));
      }
    },
    credentials: true,
  }),
);

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Inténtalo más tarde.' },
});
app.use('/api/', limiter);

// ─── MIDDLEWARE GENERAL ───────────────────────────────────────────────────────
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── RUTAS API ────────────────────────────────────────────────────────────────
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/filters', filterRouter);
app.use('/api/blog', blogRouter);
app.use('/api/search', searchRouter);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
      error:
        process.env.NODE_ENV === 'production'
          ? 'Error interno del servidor'
          : err.message,
    });
  },
);

// ─── ARRANQUE ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 J. Capi API corriendo en http://localhost:${PORT}`);
  console.log(`📄 Health check: http://localhost:${PORT}/api/health`);
});

export default app;

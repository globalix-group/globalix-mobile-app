import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import 'dotenv/config';
import rateLimit from 'express-rate-limit';
import mainRoutes from './routes/index';
import adminRoutes from './routes/admin';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import sequelize from './models';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

const requiredEnv = isProduction ? ['JWT_SECRET', 'JWT_REFRESH_SECRET'] : [];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`Missing required env vars: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// ===== MIDDLEWARE =====
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
app.use(morgan('combined'));
app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin || allowedOrigins.length === 0) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ===== ROUTES =====
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', mainRoutes);
app.use('/admin/api', adminRoutes);

type DbHealthStatus = {
  enabled: boolean;
  connected: boolean;
  lastError: string | null;
  checkedAt: string | null;
};

const dbHealth: DbHealthStatus = {
  enabled: false,
  connected: false,
  lastError: null,
  checkedAt: null,
};

// ===== HEALTH CHECK =====
app.get('/health', (req: Request, res: Response) => {
  const dbStatus = dbHealth.enabled
    ? dbHealth.connected
      ? 'connected'
      : 'not_connected'
    : 'disabled';

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message:
      dbStatus === 'connected'
        ? 'Backend is running! PostgreSQL is connected.'
        : 'Backend is running! Connect PostgreSQL to enable database features.',
    db: {
      status: dbStatus,
      checkedAt: dbHealth.checkedAt,
      lastError: dbHealth.lastError,
    },
  });
});

// ===== ERROR HANDLING =====
app.use(notFoundHandler);
app.use(errorHandler);

// ===== SERVER START =====
async function startServer() {
  try {
    // Attempt DB connection if env is present (non-blocking for local dev)
    const shouldConnectDb = !!process.env.DB_HOST;
    dbHealth.enabled = shouldConnectDb;
    if (shouldConnectDb) {
      try {
        await sequelize.authenticate();
        // Sync models if requested; default to safe "alter" in dev only
        if (process.env.NODE_ENV !== 'production') {
          await sequelize.sync({ alter: true });
        }
        console.log('🔌 PostgreSQL connected successfully');
        dbHealth.connected = true;
        dbHealth.lastError = null;
        dbHealth.checkedAt = new Date().toISOString();
      } catch (dbErr) {
        console.warn('⚠️  PostgreSQL connection failed:', dbErr);
        console.warn('   Backend will still run. Check your .env DB_* values.');
        dbHealth.connected = false;
        dbHealth.lastError = dbErr instanceof Error ? dbErr.message : 'Unknown error';
        dbHealth.checkedAt = new Date().toISOString();
      }
    } else {
      console.log('\n⚠️  Database connection skipped');
      console.log('   To enable: Install PostgreSQL and set DB_HOST in .env');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log(`📝 API Base: http://localhost:${PORT}/api/v1`);
      console.log(`📱 Mobile access: http://192.168.2.173:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer();

export default app;

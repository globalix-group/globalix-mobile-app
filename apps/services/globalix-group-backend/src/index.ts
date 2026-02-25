import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import 'dotenv/config';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import path from 'path';
import mainRoutes from './routes/index';
import adminRoutes from './routes/admin';
import mediaRoutes from './routes/media.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import sequelize, { Tenant, User, Property, Car, Inquiry, Notification, Contact, CarReservation, ChatMessage, UserMedia, Subscription, FeatureFlag, AiInsight, AuditLog } from './models';
import { BillingService } from './services/billingService';
import { ActivityLog, Analytics, Transaction } from './models/admin';
import { initSocket } from './socket';

const app = express();
const httpServer = http.createServer(app);
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
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }
      // If no specific origins configured, allow all
      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // In development, allow localhost variants
      if (!isProduction && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return callback(null, true);
      }
      console.warn(`❌ CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    exposedHeaders: ['Content-Range', 'X-Content-Range', 'Content-Length'],
  })
);

// Stripe webhook needs raw body BEFORE JSON parsing
app.use('/api/v1/billing/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Serve uploaded files with scoped CORS headers
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (
    allowedOrigins.length === 0 ||
    allowedOrigins.includes(origin) ||
    (!isProduction && (origin.includes('localhost') || origin.includes('127.0.0.1')))
  ) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
  res.header('Accept-Ranges', 'bytes');
  next();
}, express.static(path.join(__dirname, '../uploads')));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const tenantKey = (req: express.Request): string => {
  const headerTenant = req.headers['x-tenant-id'];
  const tenantId = Array.isArray(headerTenant) ? headerTenant[0] : headerTenant;
  return tenantId || ipKeyGenerator(req);
};

const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: tenantKey,
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: tenantKey,
});

app.use((req, res, next) => {
  if (!req.path.startsWith('/api/v1')) return next();
  if (req.path.startsWith('/api/v1/auth')) return next();
  if (req.method === 'GET' || req.method === 'HEAD') {
    return readLimiter(req, res, next);
  }
  return writeLimiter(req, res, next);
});

// Serve uploaded media files (handled above with CORS headers)

// ===== ROUTES =====
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', mainRoutes);
app.use('/api/v1/media', mediaRoutes);
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
        console.log('🔌 PostgreSQL connected successfully');
        dbHealth.connected = true;
        dbHealth.lastError = null;
        dbHealth.checkedAt = new Date().toISOString();

        // Sync models if requested; default to safe "alter" in dev only
        if (process.env.NODE_ENV !== 'production') {
          try {
            await sequelize.sync({ alter: true });
          } catch (syncError) {
            console.warn('⚠️  Sequelize sync warning:', syncError);
          }
        }

        const defaultTenantName = process.env.DEFAULT_TENANT_NAME || 'Globalix Default';
        const [tenant] = await Tenant.findOrCreate({
          where: { name: defaultTenantName },
          defaults: { name: defaultTenantName, status: 'active' },
        });

        if (!process.env.DEFAULT_TENANT_ID) {
          process.env.DEFAULT_TENANT_ID = tenant.id;
        }

        console.log(`🏢 Default tenant: ${tenant.name} (${tenant.id})`);

        const defaultTenantId = tenant.id;
        await Promise.all([
          User.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          Property.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          Car.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          Inquiry.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          Notification.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          Contact.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          CarReservation.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          ChatMessage.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          UserMedia.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          Subscription.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          FeatureFlag.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          AiInsight.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          AuditLog.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          ActivityLog.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          Analytics.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
          Transaction.update({ tenantId: defaultTenantId }, { where: { tenantId: null } }),
        ]);

        await BillingService.ensureDefaultPlans();
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

    initSocket(httpServer);

    httpServer.listen(PORT, '0.0.0.0', () => {
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

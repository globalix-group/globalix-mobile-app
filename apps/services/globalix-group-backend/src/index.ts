import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import 'dotenv/config';
import mainRoutes from './routes/index';
import adminRoutes from './routes/admin';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import sequelize from './models';

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ===== ROUTES =====
app.use('/api/v1', mainRoutes);
app.use('/admin/api', adminRoutes);

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Backend is running! Connect PostgreSQL to enable database features.',
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
    if (shouldConnectDb) {
      try {
        await sequelize.authenticate();
        // Sync models if requested; default to safe "alter" in dev only
        if (process.env.NODE_ENV !== 'production') {
          await sequelize.sync({ alter: true });
        }
        console.log('🔌 PostgreSQL connected successfully');
      } catch (dbErr) {
        console.warn('⚠️  PostgreSQL connection failed:', dbErr);
        console.warn('   Backend will still run. Check your .env DB_* values.');
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

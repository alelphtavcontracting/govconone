const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const { aiUsageTracking } = require('./middleware/aiUsageTracking');

const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenants');
const opportunityRoutes = require('./routes/opportunities');
const contractRoutes = require('./routes/contracts');
const subcontractorRoutes = require('./routes/subcontractors');
const documentRoutes = require('./routes/documents');
const aiRoutes = require('./routes/ai');
const capabilitiesRoutes = require('./routes/capabilities');

const logger = require('./utils/logger');
const MigrationManager = require('./database/migrations');

const app = express();

if (process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://saas-application-app-tunnel-xtkbq7ws.devinapps.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More lenient in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(requestLogger);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(aiUsageTracking);

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/subcontractors', subcontractorRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/capabilities', capabilitiesRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health/ready', async (req, res) => {
  try {
    const db = require('./database/connection');
    await db.query('SELECT 1');
    
    res.json({ 
      status: 'ready', 
      timestamp: new Date().toISOString(),
      checks: {
        database: 'healthy'
      }
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({ 
      status: 'not ready', 
      timestamp: new Date().toISOString(),
      checks: {
        database: 'unhealthy'
      }
    });
  }
});

if (process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  app.use(Sentry.Handlers.errorHandler());
}

app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    if (process.env.DATABASE_URL && process.env.NODE_ENV !== 'test') {
      logger.info('Running database migrations...');
      const migrationManager = new MigrationManager(process.env.DATABASE_URL);
      await migrationManager.runMigrations();
      await migrationManager.close();
      logger.info('Database migrations completed');
    }

    app.listen(PORT, () => {
      logger.info(`GovConOne Backend running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();

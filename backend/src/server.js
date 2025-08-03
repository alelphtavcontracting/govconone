const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenants');
const opportunityRoutes = require('./routes/opportunities');
const contractRoutes = require('./routes/contracts');
const subcontractorRoutes = require('./routes/subcontractors');
const documentRoutes = require('./routes/documents');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/subcontractors', subcontractorRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`GovConOne Backend running on port ${PORT}`);
});

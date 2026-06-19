require('./config');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { frontendUrl, nodeEnv } = require('./config');
const apiRoutes = require('./routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: frontendUrl }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/v1', (req, res) => {
  res.json({
    service: 'Community Response Hub API',
    status: 'running',
    environment: nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// app.use('/api/v1', apiRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;

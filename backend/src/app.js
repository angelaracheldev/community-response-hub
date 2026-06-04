require('./config');

const express = require('express');
const cors = require('cors');
const { frontendUrl, nodeEnv } = require('./config');
const apiRoutes = require('./routes');

const app = express();

app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.get('/api/v1', (req, res) => {
  res.json({
    service: 'Community Response Hub API',
    status: 'running',
    environment: nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1', apiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;

require('./config');

const express = require('express');
const cors = require('cors');
const { frontendUrl, nodeEnv } = require('./config');
const apiRoutes = require('./routes');
const adminRoutes = require('./routes/admin.routes');


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

// app.use('/api/v1', apiRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use('/activity-logs', require('./routes/activityLogs.routes'));

module.exports = app;

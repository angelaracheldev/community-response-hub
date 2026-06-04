const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const healthRoutes = require('./routes/health');
const dbRoutes = require('./routes/db');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const complaintsRoutes = require('./routes/complaints');
const activityLogsRoutes = require('./routes/activityLogs');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.API_PORT || 5000;
const host = process.env.API_HOST || '0.0.0.0';

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/api/v1', (req, res) => {
  res.json({
    service: 'Community Response Hub API',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/db', dbRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/complaints', complaintsRoutes);
app.use('/api/v1/activity-logs', activityLogsRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

if (require.main === module) {
  app.listen(port, host, () => {
    console.log(`Backend service running at http://${host}:${port}`);
  });
}

module.exports = app;

function getHealth(req, res) {
  res.json({
    service: 'Community Response Hub Backend',
    status: 'healthy',
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getHealth,
};

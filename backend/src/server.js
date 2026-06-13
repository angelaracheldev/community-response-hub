const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { port, host, frontendUrl } = require('./config');
const initSocket = require('./socket');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: frontendUrl, credentials: true },
});

initSocket(io);

const cors = require('cors');

app.use(cors({
  origin: '*', // for development only
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));

server.listen(port, host, () => {
  console.log(`Backend service running at http://${host}:${port}`);
});

app.use('/activity-logs', require('./routes/activityLogs.routes'));
module.exports = { server, io };

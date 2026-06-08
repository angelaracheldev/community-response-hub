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

server.listen(port, host, () => {
  console.log(`Backend service running at http://${host}:${port}`);
});

module.exports = { server, io };
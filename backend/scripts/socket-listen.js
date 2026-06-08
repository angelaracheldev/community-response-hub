#!/usr/bin/env node
/**
 * Manual Socket.IO listener for Step 5 testing.
 *
 * Usage:
 *   TOKEN=<jwt> npm run socket:listen
 *   EMAIL=admin@example.com PASSWORD=Admin123! npm run socket:listen
 *
 * In another terminal, trigger a notification (e.g. Postman: Update Complaint Status).
 */
require('../src/config');

const { io } = require('socket.io-client');

const API_URL = process.env.API_URL || 'http://localhost:5000';

function getArg(name) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

async function login(email, password) {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  const accessToken = data?.data?.tokens?.accessToken;
  if (!accessToken) {
    throw new Error('Login response did not include accessToken');
  }

  return accessToken;
}

async function main() {
  let token = process.env.TOKEN || getArg('token');

  if (!token) {
    const email = process.env.EMAIL || process.env.SOCKET_TEST_EMAIL;
    const password = process.env.PASSWORD || process.env.SOCKET_TEST_PASSWORD;
    if (email && password) {
      token = await login(email, password);
      console.log(`Logged in as ${email}`);
    }
  }

  if (!token) {
    console.error('Provide a JWT token or login credentials.\n');
    console.error('  TOKEN=<jwt> npm run socket:listen');
    console.error('  EMAIL=admin@example.com PASSWORD=Admin123! npm run socket:listen');
    process.exit(1);
  }

  const socket = io(API_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log(`Connected (socket id: ${socket.id})`);
  });

  socket.on('connect_error', (error) => {
    console.error(`Connect error: ${error.message}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Disconnected: ${reason}`);
  });

  socket.on('notification:new', (notification) => {
    console.log('\n--- notification:new ---');
    console.log(JSON.stringify(notification, null, 2));
  });

  console.log(`Listening on ${API_URL} for notification:new (Ctrl+C to exit)\n`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

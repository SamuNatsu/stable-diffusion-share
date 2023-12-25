'use strict';

// Import modules
const dotenv = require('dotenv');
const assert = require('assert');
const express = require('express');
const ws = require('ws');

// Get environment
dotenv.config();

const PORT = parseInt(process.env.PORT ?? '3000');
const SD_API = process.env.SD_API;

assert.ok(
  !isNaN(PORT) && Number.isInteger(PORT) && PORT > 0 && PORT < 65536,
  'Environment PORT invalid'
);
assert.ok(typeof SD_API === 'string', 'Environment SD_API not found');

// Create express server
const app = express();
app.use(express.static('./www'));

// Create WebSocket server
const wss = new ws.Server({ noServer: true });
wss.on('connection', (socket, req) => {
  const remoteAddr = `[${req.socket.remoteAddress}:${req.socket.remotePort}]`;
  console.log(`[WebSocket] New connection from ${remoteAddr}`);

  socket.on('close', (code) => {
    console.log(`[WebSocket] Disconnected from ${remoteAddr} (${code})`);
  });
  socket.on('error', (err) => {
    console.error(`[WebSocket] Error from ${remoteAddr}`);
    console.error(err);
  });
  socket.on('message', (data) => {
    try {
      data = JSON.parse(data.toString('utf-8'));
      console.log(data);
    } catch (err) {
      socket.emit('error', err);
    }
  });
});

// Start listening
app
  .listen(PORT, () => {
    console.log(`[Core] Server listening on port ${PORT}`);
  })
  .on('upgrade', (req, sock, head) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname !== '/ws') {
      req.destroy();
      sock.destroy();
      return;
    }

    wss.handleUpgrade(req, sock, head, (socket) => {
      wss.emit('connection', socket, req);
    });
  });

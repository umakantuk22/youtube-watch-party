import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { createApp } from './app';
import { SocketManager } from './sockets/SocketManager';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = createApp();
const server = http.createServer(app);

// Initialize Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Initialize Socket Manager Handlers
const socketManager = new SocketManager(io);
socketManager.initialize();

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`================================================`);
  console.log(`🚀 Watch Party Backend running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`================================================`);
});

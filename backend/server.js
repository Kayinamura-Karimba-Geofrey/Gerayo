const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const aedes = require('aedes')();
const aedesServer = require('net').createServer(aedes.handle);

const PORT = 3000;
const MQTT_PORT = 1883; // Back to standard port if possible

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Setup Express and HTTP Server
const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/alerts', require('./routes/alerts'));

const server = http.createServer(app);

// 2. Setup Socket.io for Mobile App (Frontend)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach io to app so it can be accessed in routes
app.set('io', io);

// Middleware for socket authentication
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) {
    console.log('[Socket] Connection rejected: No token');
    return next(new Error('Authentication error: No token provided'));
  }

  // For visualization/development purposes, allow a mock token
  if (token === 'mock-jwt-token') {
    socket.user = { id: 'ed15c263-093c-4157-b6a7-554b6fb5a6db' };
    console.log('[Socket] Visualization mode: Accepting mock-jwt-token for Test Driver');
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production', (err, decoded) => {
    if (err) {
      console.log('[Socket] Connection rejected: Invalid token');
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.user = decoded.user;
    next();
  });
});

io.on('connection', (socket) => {
  const userId = socket.user?.id;
  console.log(`[Socket] New connection: ${socket.id} | User: ${userId}`);

  if (userId) {
    socket.join(`user_${userId}`);
    console.log(`[Socket] Socket ${socket.id} joined room user_${userId}`);

    // Diagnostic: List all rooms this socket is in
    console.log(`[Socket] Socket ${socket.id} is now in rooms:`, Array.from(socket.rooms));

    // Diagnostic: Check global room occupancy
    const room = io.sockets.adapter.rooms.get(`user_${userId}`);
    console.log(`[Socket] Global check: Room user_${userId} has ${room ? room.size : 0} members`);
  }

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Client disconnected: ${socket.id} | Reason: ${reason}`);
  });
});

// 3. Setup embedded MQTT Broker using Aedes for ESP32
aedesServer.listen(MQTT_PORT, () => {
  console.log(`[MQTT] Aedes broker is running and listening on port ${MQTT_PORT}`);
});

aedes.on('client', (client) => {
  console.log(`[MQTT] ESP32 device connected: ${client ? client.id : client}`);
});

aedes.on('clientDisconnect', (client) => {
  console.log(`[MQTT] ESP32 device disconnected: ${client ? client.id : client}`);
});

// 4. The Bridge: Listen to MQTT and broadcast to WebSockets
aedes.on('publish', (packet, client) => {
  if (client) {
    const topicParts = packet.topic.split('/');
    // device/{macAddress}/sensor_data
    if (topicParts.length === 3 && topicParts[0] === 'device' && topicParts[2] === 'sensor_data') {
      const macAddress = topicParts[1];
      const messageStr = packet.payload.toString();

      try {
        const data = JSON.parse(messageStr);
        console.log(`[MQTT -> WebSocket] Forwarding data for device ${macAddress}:`, data);

        // Find the device and its vehicle to determine the owner (userId)
        prisma.device.findUnique({
          where: { macAddress: macAddress.toUpperCase().replace(/:/g, '') },
          include: { vehicle: true }
        }).then(device => {
          if (device && device.vehicle) {
            // Broadcast to the specific user's socket room
            const userId = device.vehicle.userId;
            io.to(`user_${userId}`).emit('sensor_update', data);
          }
        }).catch(err => console.error('[MQTT DB Query Error]', err.message));

      } catch (err) {
        console.error('[MQTT] Error processing sensor data:', err.message);
      }
    }
  }
});

// Start the HTTP / WebSocket server
server.listen(PORT, () => {
  console.log(`[HTTP/WebSocket] Server is running on port ${PORT}`);
});

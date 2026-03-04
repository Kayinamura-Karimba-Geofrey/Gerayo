const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const aedes = require('aedes')();
const aedesServer = require('net').createServer(aedes.handle);

const PORT = 3000;
const MQTT_PORT = 1883;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Setup Express and HTTP Server
const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/announcements', require('./routes/announcements')); // Legacy global scope
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

io.on('connection', (socket) => {
  console.log(`[Socket.io] Mobile app client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
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
// Expected topic format: device/{macAddress}/sensor_data
aedes.on('publish', (packet, client) => {
  if (client) {
    const topicParts = packet.topic.split('/');
    if (topicParts.length === 3 && topicParts[0] === 'device' && topicParts[2] === 'sensor_data') {
      const macAddress = topicParts[1];
      const messageStr = packet.payload.toString();

      try {
        const data = JSON.parse(messageStr);
        console.log(`[MQTT -> WebSocket] Forwarding data for device ${macAddress}:`, data);

        // Find the device and its vehicle to determine the owner (userId)
        prisma.device.findUnique({
          where: { macAddress },
          include: { vehicle: true }
        }).then(device => {
          if (device) {
            // Save to database
            prisma.sensorData.create({
              data: {
                deviceId: device.id,
                rawData: messageStr,
              }
            }).then(() => {
              // Broadcast to the specific user's socket room
              const userId = device.vehicle.userId;
              io.to(`user_${userId}`).emit('sensor_update', data);
            }).catch(err => console.error('[MQTT DB Save Error]', err.message));
          } else {
            console.warn(`[MQTT] Unregistered device MAC: ${macAddress}`);
          }
        }).catch(err => console.error('[MQTT DB Query Error]', err.message));

      } catch (err) {
        console.error('[MQTT] Error processing sensor data:', err.message);
      }
    }
  }
});

// Require JWT for sockets
const jwt = require('jsonwebtoken');
io.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.user = decoded.user;
      next();
    });
  } else {
    next(new Error('Authentication error'));
  }
}).on('connection', (socket) => {
  console.log(`[Socket.io] Authenticated user ${socket.user.id} connected: ${socket.id}`);

  // Join a room specifically for this user to receive their vehicle's data
  socket.join(`user_${socket.user.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Start the HTTP / WebSocket server
server.listen(PORT, () => {
  console.log(`[HTTP/WebSocket] Server is running on port ${PORT}`);
});

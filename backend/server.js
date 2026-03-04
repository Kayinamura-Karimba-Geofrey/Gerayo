const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const aedes = require('aedes')();
const aedesServer = require('net').createServer(aedes.handle);
const cors = require('cors');

const PORT = 3000;
const MQTT_PORT = 1883;

// 1. Setup Express and HTTP Server
const app = express();
app.use(cors());
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
const SENSOR_TOPIC = 'esp32/sensor_data';

aedes.on('publish', (packet, client) => {
  if (client) {
    if (packet.topic === SENSOR_TOPIC) {
      const messageStr = packet.payload.toString();
      try {
        // Parse the JSON data from ESP32
        const data = JSON.parse(messageStr);
        console.log(`[MQTT -> WebSocket] Forwarding data:`, data);
        
        // Broadcast the parsed data to all connected React Native clients
        io.emit('sensor_update', data);
      } catch (err) {
        console.error('[MQTT] Error parsing sensor data:', err.message);
        // Fallback: send as raw string if it's not JSON
        io.emit('sensor_update', { raw: messageStr });
      }
    }
  }
});

// Start the HTTP / WebSocket server
server.listen(PORT, () => {
  console.log(`[HTTP/WebSocket] Server is running on port ${PORT}`);
});

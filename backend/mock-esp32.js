const mqtt = require('mqtt');

// Connect to the local MQTT broker running in server.js
const client = mqtt.connect('mqtt://localhost:1883', {
    clientId: 'mock_esp32_device'
});

const SENSOR_TOPIC = 'device/ABC123DEF456/sensor_data';

client.on('connect', () => {
    console.log('[Mock ESP32] Connected to local MQTT broker.');

    // Simulate reading sensor data every 3 seconds
    setInterval(() => {
        const mockData = {
            status: 'active',
            timestamp: new Date().toISOString()
        };

        console.log(`[Mock ESP32] Publishing data to ${SENSOR_TOPIC}:`, mockData);
        client.publish(SENSOR_TOPIC, JSON.stringify(mockData));
    }, 3000);
});

client.on('error', (err) => {
    console.error('[Mock ESP32] Connection error:', err);
});

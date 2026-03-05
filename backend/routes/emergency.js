const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get emergency alerts for user
router.get('/', auth, async (req, res) => {
    try {
        const alerts = await prisma.emergencyAlert.findMany({
            where: { userId: req.user.id },
            orderBy: { timestamp: 'desc' }
        });
        res.json(alerts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create an emergency alert
router.post('/', auth, async (req, res) => {
    try {
        const { locationLat, locationLng, locationAccuracy, type, severity } = req.body;

        const alert = await prisma.emergencyAlert.create({
            data: {
                userId: req.user.id,
                locationLat: locationLat ? parseFloat(locationLat) : null,
                locationLng: locationLng ? parseFloat(locationLng) : null,
                locationAccuracy: locationAccuracy ? parseFloat(locationAccuracy) : null,
                type: type || 'accident',      // 'accident', 'brake_failure', 'other'
                severity: severity || 'high',  // 'low', 'medium', 'high'
                status: 'active'
            }
        });

        res.json(alert);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST api/emergency/hardware
 * @desc    Hardware (ESP32/ESP8266) trigger for emergency alerts
 * @access  Public (identified by mac)
 */
router.post('/hardware', async (req, res) => {
    try {
        let { mac, message } = req.body;

        if (!mac) {
            return res.status(400).json({ message: 'MAC address is required' });
        }

        // Normalize MAC address (remove colons if present)
        mac = mac.replace(/:/g, '').toUpperCase();

        // 1. Find the device and its owner
        const device = await prisma.device.findUnique({
            where: { macAddress: mac },
            include: { vehicle: true }
        });

        if (!device) {
            console.warn(`[Hardware Alert] Unregistered MAC: ${mac}`);
            return res.status(404).json({ message: `Device with MAC ${mac} not found in database.` });
        }

        if (!device.vehicle) {
            console.warn(`[Hardware Alert] Device ${mac} not associated with any vehicle.`);
            return res.status(400).json({ message: `Device ${mac} is registered but not linked to a vehicle.` });
        }

        const userId = device.vehicle.userId;
        const io = req.app.get('io');

        console.log(`[Hardware Alert] Found Device: ${device.id}, Vehicle: ${device.vehicle.id}, Owner: ${userId}`);

        // 2. Create the alert
        const alert = await prisma.emergencyAlert.create({
            data: {
                userId,
                type: 'accident',
                severity: 'high',
                status: 'active'
            }
        });

        // 3. Emit socket event to the specific user's room
        if (io) {
            console.log(`[Hardware Alert] io instance found. Emitting hardware_emergency to room: user_${userId}`);
            const clientsInRoom = io.sockets.adapter.rooms.get(`user_${userId}`);
            console.log(`[Hardware Alert] Clients currently in room user_${userId}:`, clientsInRoom ? clientsInRoom.size : 0);

            io.to(`user_${userId}`).emit('hardware_emergency', {
                alertId: alert.id,
                mac: mac
            });
        } else {
            console.error('[Hardware Alert] io instance NOT found in req.app');
        }

        console.log(`[Hardware Alert] Emergency detected for User: ${userId} (MAC: ${mac})`);

        res.json({ success: true, alertId: alert.id });
    } catch (err) {
        console.error('[Hardware Alert Error]', err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   PATCH api/emergency/confirm/:id
 * @desc    Confirm emergency from mobile app with GPS coordinates
 * @access  Public (for simplicity in hardware flow, or identified by user room)
 */
router.patch('/confirm/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { locationLat, locationLng, locationAccuracy, timestamp } = req.body;

        // 1. Update the alert in our database
        const alert = await prisma.emergencyAlert.update({
            where: { id },
            include: { user: { include: { devices: true } } }
        });

        const updatedAlert = await prisma.emergencyAlert.update({
            where: { id },
            data: {
                locationLat: locationLat ? parseFloat(locationLat) : alert.locationLat,
                locationLng: locationLng ? parseFloat(locationLng) : alert.locationLng,
                locationAccuracy: locationAccuracy ? parseFloat(locationAccuracy) : alert.locationAccuracy,
                status: 'confirmed'
            }
        });

        // 2. Get the MAC address from the user's records (assuming one device for now)
        const mac = alert.user?.devices[0]?.macAddress || 'UNKNOWN';

        // 3. Forward to the external dashboard
        try {
            const dashboardData = {
                mac,
                message: 'Emergency Confirmed',
                timestamp: timestamp || new Date().toISOString(),
                location: {
                    lat: locationLat,
                    lng: locationLng,
                    accuracy: locationAccuracy
                }
            };

            console.log('[Backend -> Dashboard] Forwarding confirmed alert:', JSON.stringify(dashboardData));

            const response = await fetch('http://10.12.75.198:3001/api/accidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dashboardData)
            });

            if (!response.ok) {
                console.error('[Dashboard Error]', await response.text());
            }
        } catch (dashErr) {
            console.error('[Dashboard Forwarding Error]', dashErr.message);
        }

        res.json({ success: true, alert: updatedAlert });
    } catch (err) {
        console.error('[Confirm Alert Error]', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

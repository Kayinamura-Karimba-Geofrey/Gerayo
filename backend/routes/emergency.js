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
            const clientCount = clientsInRoom ? clientsInRoom.size : 0;
            console.log(`[Hardware Alert] Clients currently in room user_${userId}: ${clientCount}`);

            // Broadcast to the specific user
            io.to(`user_${userId}`).emit('hardware_emergency', {
                alertId: alert.id,
                mac: mac
            });

            // DEBUG: Also broadcast to EVERYONE just in case room joining failed
            console.log('[Hardware Alert] DEBUG: Also broadcasting to ALL clients');
            io.emit('hardware_emergency', {
                alertId: alert.id,
                mac: mac,
                debug: 'broadcast_to_all'
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
        const { locationLat, locationLng, locationAccuracy, timestamp, address, locationCity } = req.body;

        // 1. First fetch the existing alert to get user/device info
        const alert = await prisma.emergencyAlert.findUnique({
            where: { id },
            include: { user: { include: { vehicles: { include: { devices: true } } } } }
        });

        if (!alert) return res.status(404).json({ error: 'Alert not found' });

        // 2. Update the alert status and location in OUR database
        const updatedAlert = await prisma.emergencyAlert.update({
            where: { id },
            data: {
                locationLat: locationLat ? parseFloat(locationLat) : alert.locationLat,
                locationLng: locationLng ? parseFloat(locationLng) : alert.locationLng,
                locationAccuracy: locationAccuracy ? parseFloat(locationAccuracy) : alert.locationAccuracy,
                status: 'confirmed'
            }
        });

        // 3. Prepare payload for EXTERNAL DASHBOARD
        // Format time as HH:MM
        const now = timestamp ? new Date(timestamp) : new Date();
        const timeFormatted = now.toTimeString().slice(0, 5);

        const mac = alert.user?.vehicles?.[0]?.devices?.[0]?.macAddress || 'UNKNOWN';
        const coordsString = locationLat && locationLng
            ? `${locationLat.toFixed(4)}, ${locationLng.toFixed(4)}`
            : 'Unknown';

        const dashboardData = {
            time: timeFormatted,
            location: locationCity || 'Unknown',
            coordinates: coordsString,
            address: address || 'Unknown'
        };

        // 3. Forward to the external dashboard
        try {
            console.log('[Backend -> Dashboard] Forwarding confirmed alert:', JSON.stringify(dashboardData));

            const response = await fetch('http://10.12.75.198:3001/api/accidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dashboardData)
            });

            if (!response.ok) {
                console.error('[Dashboard Error]', await response.text());
            } else {
                console.log('[Dashboard Success] Confirmed alert received by dashboard');
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

/**
 * @route   POST api/emergency/update/:id
 * @desc    Receive real-time location updates and forward to dashboard
 * @access  Public
 */
router.post('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { locationLat, locationLng, locationAccuracy, timestamp, address, locationCity } = req.body;

        // 1. Get alert info
        const alert = await prisma.emergencyAlert.findUnique({
            where: { id },
            include: { user: { include: { vehicles: { include: { devices: true } } } } }
        });

        if (!alert) return res.status(404).send('Alert not found');

        // 2. Format for EXTERNAL DASHBOARD
        const now = timestamp ? new Date(timestamp) : new Date();
        const timeFormatted = now.toTimeString().slice(0, 5);
        const coordsString = locationLat && locationLng
            ? `${locationLat.toFixed(4)}, ${locationLng.toFixed(4)}`
            : 'Unknown';

        const dashboardData = {
            time: timeFormatted,
            location: locationCity || 'Unknown',
            coordinates: coordsString,
            address: address || 'Unknown'
        };

        console.log('[Backend -> Dashboard] Forwarding real-time update:', JSON.stringify(dashboardData));

        fetch('http://10.12.75.198:3001/api/accidents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dashboardData)
        }).then(async r => {
            if (!r.ok) console.error('[Dashboard Error Update]', await r.text());
            else console.log('[Dashboard Success Update] Real-time data received by dashboard');
        }).catch(err => console.error('[Dashboard Forwarding Error]', err.message));

        res.json({ success: true });
    } catch (err) {
        console.error('[Update Alert Error]', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

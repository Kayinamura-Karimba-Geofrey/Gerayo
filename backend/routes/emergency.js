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
                locationLat,
                locationLng,
                locationAccuracy,
                type: type || 'accident',      // 'accident', 'brake_failure', 'other'
                severity: severity || 'high',  // 'low', 'medium', 'high'
                status: 'active'
            }
        });

        // Broadcast to user socket if possible (logic normally in server.js but we can emit if we had the io instance)
        // For now we just return the alert.

        res.json(alert);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST api/emergency/hardware
 * @desc    Hardware (ESP32/ESP8266) trigger for emergency alerts
 * @access  Public (identified by deviceId)
 */
router.post('/hardware', async (req, res) => {
    try {
        const { mac, message } = req.body;

        if (!mac) {
            return res.status(400).json({ message: 'MAC address is required' });
        }

        // 1. Find the device and its owner
        const device = await prisma.device.findUnique({
            where: { macAddress: mac },
            include: { vehicle: true }
        });

        if (!device || !device.vehicle) {
            console.warn(`[Hardware Alert] Unregistered MAC: ${mac}`);
            return res.status(404).json({ message: 'Unregistered device' });
        }

        const userId = device.vehicle.userId;

        // 2. Create the alert
        const alert = await prisma.emergencyAlert.create({
            data: {
                userId,
                type: 'accident',
                severity: 'high',
                status: 'active'
            }
        });

        console.log(`[Hardware Alert] Emergency detected for User: ${userId} (MAC: ${mac})`);

        res.json({ success: true, alertId: alert.id });
    } catch (err) {
        console.error('[Hardware Alert Error]', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

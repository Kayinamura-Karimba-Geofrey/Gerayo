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
                type,      // 'accident', 'brake_failure', 'other'
                severity,  // 'low', 'medium', 'high'
                status: 'active'
            }
        });
        res.json(alert);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

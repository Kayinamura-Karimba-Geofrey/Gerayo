const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get historical sensor data for a specific device
router.get('/history/:deviceId', auth, async (req, res) => {
    try {
        const deviceId = parseInt(req.params.deviceId, 10);

        // Verify the user owns the vehicle that this device is attached to
        const device = await prisma.device.findUnique({
            where: { id: deviceId },
            include: { vehicle: true }
        });

        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        if (device.vehicle.userId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized access to this device' });
        }

        // Get last 24 hours of data
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const history = await prisma.sensorData.findMany({
            where: {
                deviceId: deviceId,
                timestamp: { gte: last24h }
            },
            orderBy: { timestamp: 'asc' }
        });

        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

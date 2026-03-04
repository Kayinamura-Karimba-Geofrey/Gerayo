const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user alerts
router.get('/', auth, async (req, res) => {
    try {
        const alerts = await prisma.alert.findMany({
            where: { userId: req.user.id },
            orderBy: { timestamp: 'desc' },
            take: 20
        });
        res.json(alerts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Mark alert as read
router.put('/read/:id', auth, async (req, res) => {
    try {
        const alertId = req.params.id;

        let alert = await prisma.alert.findUnique({ where: { id: alertId } });
        if (!alert || alert.userId !== req.user.id) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        alert = await prisma.alert.update({
            where: { id: alertId },
            data: { read: true }
        });

        res.json(alert);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

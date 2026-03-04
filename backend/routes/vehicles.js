const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's vehicles
router.get('/', auth, async (req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            where: { userId: req.user.id },
            include: {
                devices: true
            }
        });
        res.json(vehicles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get upcoming inspections for user
router.get('/inspections', auth, async (req, res) => {
    try {
        const today = new Date();
        const upTo2MonthsStr = new Date();
        upTo2MonthsStr.setMonth(today.getMonth() + 2);

        const vehicles = await prisma.vehicle.findMany({
            where: {
                userId: req.user.id,
                nextInspection: {
                    lte: upTo2MonthsStr,
                    gte: today
                }
            }
        });
        res.json(vehicles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

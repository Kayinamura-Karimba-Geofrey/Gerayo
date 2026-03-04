const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get active trips for user
router.get('/', auth, async (req, res) => {
    try {
        const trips = await prisma.trip.findMany({
            where: { userId: req.user.id },
            orderBy: { startTime: 'desc' }
        });
        res.json(trips);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Start a trip
router.post('/start', auth, async (req, res) => {
    try {
        const { vehicleId, startLat, startLng } = req.body;

        const trip = await prisma.trip.create({
            data: {
                userId: req.user.id,
                vehicleId,
                startLat,
                startLng,
                status: 'ongoing'
            }
        });
        res.json(trip);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// End a trip
router.put('/end/:id', auth, async (req, res) => {
    try {
        const { endLat, endLng, distanceKm, durationMinutes } = req.body;
        const tripId = req.params.id;

        let trip = await prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip || trip.userId !== req.user.id) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        trip = await prisma.trip.update({
            where: { id: tripId },
            data: {
                endTime: new Date(),
                endLat,
                endLng,
                distanceKm,
                durationMinutes,
                status: 'completed'
            }
        });

        res.json(trip);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

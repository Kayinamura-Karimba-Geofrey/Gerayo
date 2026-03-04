const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user appointments
router.get('/', auth, async (req, res) => {
    try {
        const appointments = await prisma.appointment.findMany({
            where: { userId: req.user.id },
            include: { vehicle: true },
            orderBy: { scheduledDate: 'asc' }
        });
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create an appointment
router.post('/', auth, async (req, res) => {
    try {
        const { vehicleId, type, scheduledDate, durationMinutes, notes } = req.body;

        const appointment = await prisma.appointment.create({
            data: {
                userId: req.user.id,
                vehicleId,
                type, // 'inspection', 'maintenance', 'repair'
                scheduledDate: new Date(scheduledDate),
                durationMinutes,
                notes,
                status: 'scheduled'
            }
        });
        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

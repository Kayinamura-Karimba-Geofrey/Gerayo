const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get announcements
router.get('/', auth, async (req, res) => {
    try {
        // Return latest 10 announcements
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        res.json(announcements);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

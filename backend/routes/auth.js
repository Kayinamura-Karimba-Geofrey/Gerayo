const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();

// Register a new user
router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Enter a valid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('name').notEmpty().withMessage('Name is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, name } = req.body;

        try {
            let user = await prisma.user.findUnique({ where: { email } });
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = await prisma.user.create({
                data: {
                    email,
                    passwordHash: hashedPassword,
                    name,
                },
            });

            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '7d' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// Login user
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Enter a valid email address'),
        body('password').exists().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '7d' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// Get current user profile
router.get('/me', async (req, res) => {
    // To be implemented with auth middleware
    res.status(200).json({ message: "me route" });
});

module.exports = router;

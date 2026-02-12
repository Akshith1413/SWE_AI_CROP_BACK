import express from 'express';
import User from '../models/User.js';
import AppSettings from '../models/AppSettings.js';

const router = express.Router();

// Mock OTP generation and verification
// IN REAL APP: Integrate with SMS Gateway

// @desc    Register/Login user
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    try {
        let user = await User.findOne({ phoneNumber });

        if (!user) {
            user = await User.create({ phoneNumber });
            // Initialize settings for new user
            await AppSettings.create({ user: user._id });
        }

        // Generate Mock OTP
        const otp = "123456"; // Fixed for demo

        res.json({
            message: 'OTP sent successfully',
            otp: otp, // Sending back for demo purposes
            userId: user._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify
router.post('/verify', async (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (otp === "123456") {
        const user = await User.findOne({ phoneNumber });
        if (user) {
            res.json({
                _id: user._id,
                phoneNumber: user.phoneNumber,
                name: user.name,
                token: "dummy_jwt_token_" + user._id
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
});

export default router;

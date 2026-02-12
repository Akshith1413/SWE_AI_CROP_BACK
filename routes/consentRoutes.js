import express from 'express';
import ConsentLog from '../models/ConsentLog.js';

const router = express.Router();

// @desc    Log consent
// @route   POST /api/consent
router.post('/', async (req, res) => {
    const { userId, agreed, ipAddress } = req.body;

    try {
        const consent = await ConsentLog.create({
            user: userId,
            agreed,
            ipAddress
        });
        res.status(201).json(consent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

import express from 'express';
import CropPreference from '../models/CropPreference.js';

const router = express.Router();

// @desc    Get user crops
// @route   GET /api/crops/:userId
router.get('/:userId', async (req, res) => {
    try {
        const crops = await CropPreference.findOne({ user: req.params.userId });
        res.json(crops ? crops.selectedCrops : []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update user crops
// @route   POST /api/crops
router.post('/', async (req, res) => {
    const { userId, selectedCrops } = req.body;

    try {
        let preference = await CropPreference.findOne({ user: userId });

        if (preference) {
            preference.selectedCrops = selectedCrops;
            await preference.save();
        } else {
            preference = await CropPreference.create({
                user: userId,
                selectedCrops
            });
        }
        res.json(preference.selectedCrops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

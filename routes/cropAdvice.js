import express from 'express';
import llmService from '../services/llmService.js';
import { validateCropAndDisease, getValidCrops, getDiseasesForCrop } from '../utils/cropValidator.js';

const router = express.Router();

/**
 * POST /api/crop-advice
 * Generate crop disease advice from disease detection
 * 
 * Request body:
 * {
 *   "crop": "Tomato",
 *   "disease": "Early Blight",
 *   "severity": "medium",
 *   "confidence": 0.93,
 *   "language": "en"
 * }
 */
router.post('/crop-advice', async (req, res) => {
    try {
        const { crop, disease, severity, confidence, language } = req.body;

        // Validate input
        if (!crop || !disease) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: crop and disease are required'
            });
        }

        // Validate crop and disease using the validation utility
        const validationResult = validateCropAndDisease(crop, disease);

        if (!validationResult.success) {
            // Invalid crop or disease - provide helpful error message
            return res.status(400).json({
                success: false,
                error: validationResult.error,
                message: validationResult.message,
                suggestions: validationResult.suggestions,
                userGuidance: validationResult.validCrops
                    ? 'Please provide a correct crop name from the list of valid crops.'
                    : `Please provide a correct disease name for ${validationResult.crop}.`,
                validCrops: validationResult.validCrops,
                validDiseases: validationResult.crop ? getDiseasesForCrop(validationResult.crop) : null
            });
        }

        // Validate confidence (should be between 0 and 1)
        if (confidence !== undefined && (confidence < 0 || confidence > 1)) {
            return res.status(400).json({
                success: false,
                error: 'Confidence must be between 0 and 1'
            });
        }

        // Use validated/normalized crop and disease names
        const validatedCrop = validationResult.crop;
        const validatedDisease = validationResult.disease;

        console.log(`📝 Request: Generating advice for ${validatedCrop} - ${validatedDisease}` + (language ? ` in ${language}` : ''));

        // Log warnings if any (e.g., fuzzy matching occurred)
        if (validationResult.warnings && validationResult.warnings.length > 0) {
            validationResult.warnings.forEach(warning => console.log(`⚠️  ${warning}`));
        }

        // Generate advice using Gemini AI with language support
        const advice = await llmService.generateCropAdvice({
            crop: validatedCrop,
            disease: validatedDisease,
            severity: severity || 'unknown',
            confidence: confidence || 0.0,
            language: language || 'en'  // Default to English if no language specified
        });

        res.json({
            success: true,
            data: advice,
            warnings: validationResult.warnings
        });

    } catch (error) {
        console.error('Error in /crop-advice endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate crop advice'
        });
    }
});

/**
 * POST /api/crop-advice/batch
 * Generate advice for multiple diseases at once
 * 
 * Request body:
 * {
 *   "diseases": [
 *     { "crop": "Tomato", "disease": "Early Blight", "severity": "medium", "confidence": 0.93 },
 *     { "crop": "Potato", "disease": "Late Blight", "severity": "high", "confidence": 0.87 }
 *   ]
 * }
 */
router.post('/crop-advice/batch', async (req, res) => {
    try {
        const { diseases } = req.body;

        if (!diseases || !Array.isArray(diseases) || diseases.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid diseases array'
            });
        }

        // Validate all entries first
        const validatedDiseases = [];

        for (let i = 0; i < diseases.length; i++) {
            const diseaseData = diseases[i];

            if (!diseaseData.crop || !diseaseData.disease) {
                return res.status(400).json({
                    success: false,
                    error: `Entry ${i + 1}: Missing crop or disease fields`,
                    index: i
                });
            }

            // Validate each crop and disease
            const validationResult = validateCropAndDisease(diseaseData.crop, diseaseData.disease);

            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    error: `Entry ${i + 1}: ${validationResult.error}`,
                    message: validationResult.message,
                    suggestions: validationResult.suggestions,
                    index: i,
                    userGuidance: validationResult.validCrops
                        ? 'Please provide a correct crop name from the list of valid crops.'
                        : `Please provide a correct disease name for ${validationResult.crop}.`,
                    validCrops: validationResult.validCrops,
                    validDiseases: validationResult.crop ? getDiseasesForCrop(validationResult.crop) : null
                });
            }

            // Store validated data
            validatedDiseases.push({
                crop: validationResult.crop,
                disease: validationResult.disease,
                severity: diseaseData.severity || 'unknown',
                confidence: diseaseData.confidence || 0.0,
                warnings: validationResult.warnings
            });
        }

        console.log(`📝 Batch Request: Generating advice for ${validatedDiseases.length} diseases`);

        // Generate advice for all validated entries
        const adviceList = await llmService.generateBatchAdvice(validatedDiseases);

        res.json({
            success: true,
            data: adviceList
        });

    } catch (error) {
        console.error('Error in /crop-advice/batch endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate batch crop advice'
        });
    }
});

/**
 * GET /api/crop-advice/valid-crops
 * Get list of all valid crops
 */
router.get('/crop-advice/valid-crops', (req, res) => {
    try {
        const crops = getValidCrops();
        res.json({
            success: true,
            data: {
                count: crops.length,
                crops: crops
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve valid crops'
        });
    }
});

/**
 * GET /api/crop-advice/diseases/:crop
 * Get list of diseases for a specific crop
 */
router.get('/crop-advice/diseases/:crop', (req, res) => {
    try {
        const { crop } = req.params;
        const diseases = getDiseasesForCrop(crop);

        if (!diseases) {
            return res.status(404).json({
                success: false,
                error: `No specific diseases found for crop: ${crop}`,
                message: 'This crop may not be in our database, or only generic diseases apply.',
                validCrops: getValidCrops()
            });
        }

        res.json({
            success: true,
            data: {
                crop: crop,
                count: diseases.length,
                diseases: diseases
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve diseases'
        });
    }
});


/**
 * GET /api/test
 * Test endpoint to verify API is working
 */
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Crop Advice API is working!',
        timestamp: new Date().toISOString(),
        endpoints: [
            'POST /api/crop-advice',
            'POST /api/crop-advice/batch',
            'GET /api/crop-advice/valid-crops',
            'GET /api/crop-advice/diseases/:crop',
            'GET /api/test'
        ]
    });
});

export default router;

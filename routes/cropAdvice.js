import express from "express";
import multer from "multer";
import llmService from "../services/llmService.js";
import { predictDisease } from "../services/cnnService.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/crop-advice
 * Generate crop disease advice from disease detection (Text/JSON input)
 * Used by LLMAdvicePage.jsx
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

    // Validate confidence (should be between 0 and 1)
    if (confidence !== undefined && (confidence < 0 || confidence > 1)) {
      return res.status(400).json({
        success: false,
        error: 'Confidence must be between 0 and 1'
      });
    }

    console.log(`📝 Request: Generating advice for ${crop} - ${disease} in ${language || 'en'}`);

    // Generate advice using Gemini AI
    const advice = await llmService.generateCropAdvice({
      crop,
      disease,
      severity: severity || 'unknown',
      confidence: confidence || 0.0,
      language: language || 'en'
    });

    res.json({
      success: true,
      data: advice
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
 * POST /api/analyze
 * Analyze crop image using CNN and generate advice
 * Supports image file upload
 */
router.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file required" });
    }

    console.log("Sending image to CNN service...");

    // Call the CNN service
    const prediction = await predictDisease(req.file.buffer, req.file.originalname);

    // ---------- IMPORTANT CHECK ----------
    if (!prediction.success) {
      return res.json({
        success: false,
        message: prediction.error
      });
    }
    // -------------------------------------

    console.log("CNN Prediction:", prediction.class_index);

    // TODO: Map class_index to disease name properly.
    // Currently hardcoded as placeholder based on remote commit.
    const disease = "Leaf_Mold"; // map later properly

    const advice = await llmService.generateCropAdvice({
      crop: "Tomato", // TODO: Detect crop type or accept as param
      disease,
      severity: "Moderate",
      confidence: prediction.confidence
    });

    res.json({
      success: true,
      disease,
      confidence: prediction.confidence,
      advice
    });

  } catch (error) {
    console.error("Prediction pipeline error:", error.message);
    res.status(500).json({ error: "Prediction pipeline failed" });
  }
});

export default router;

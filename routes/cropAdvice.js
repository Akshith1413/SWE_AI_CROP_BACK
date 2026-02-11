/**
 * Crop Advice API Routes
 * Handles HTTP endpoints for crop disease detection and treatment advice
 * Integrates CNN service (image classification) with LLM service (treatment advice)
 * Accepts plant images, predicts disease, and returns AI-generated recommendations
 */

// Import required dependencies
import express from "express";        // Web framework for routing
import multer from "multer";          // Middleware for handling multipart/form-data (file uploads)
import axios from "axios";            // HTTP client for making requests to CNN service
import FormData from "form-data";     // Library for creating multipart form data
import llmService from "../services/llmService.js";  // AI service for treatment advice

// Initialize Express router
// Router allows us to define routes in a modular way
const router = express.Router();

// Configure Multer for file uploads
// memoryStorage() keeps uploaded files in RAM (not saved to disk)
// This is efficient for temporary processing of images
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/crop-advice
 * Main endpoint for crop disease detection and treatment advice
 * 
 * Flow:
 * 1. Receive plant image from frontend
 * 2. Forward image to CNN service for disease detection
 * 3. Send detection results to LLM service for treatment advice
 * 4. Return combined results to frontend
 * 
 * Request:
 * - Method: POST
 * - Content-Type: multipart/form-data
 * - Body: file (image of diseased plant)
 * 
 * Response:
 * - success: boolean indicating operation success
 * - disease: detected disease name
 * - confidence: CNN detection confidence (0-1)
 * - advice: structured treatment recommendations from LLM
 */
router.post("/crop-advice", upload.single("file"), async (req, res) => {
  try {
    // Validate that a file was uploaded
    // Multer attaches uploaded file to req.file
    if (!req.file) {
      // Return 400 Bad Request if no file provided
      return res.status(400).json({ error: "Image file required" });
    }

    // Log the start of CNN processing
    console.log("Sending image to CNN service...");

    // Prepare form data for CNN service request
    // FormData handles multipart encoding automatically
    const form = new FormData();

    // Append the image buffer with original filename
    // req.file.buffer contains the raw image data in memory
    form.append("file", req.file.buffer, req.file.originalname);

    // Send image to CNN (Convolutional Neural Network) service
    // CNN service is a separate Python Flask server running on port 5001
    // It handles image classification using a trained ML model
    const cnnResponse = await axios.post(
      "http://127.0.0.1:5001/predict",  // CNN service endpoint (local Python server)
      form,                              // Form data with image
      { headers: form.getHeaders() }    // Content-Type: multipart/form-data headers
    );

    // Extract prediction results from CNN response
    const prediction = cnnResponse.data;

    // ========================================
    // CRITICAL: Check if CNN prediction succeeded
    // ========================================
    // CNN service might fail if:
    // - Image is corrupted or invalid format
    // - ML model encounters an error
    // - Insufficient confidence in prediction
    if (!prediction.success) {
      // Return early with error message from CNN service
      return res.json({
        success: false,
        message: prediction.error  // Error message from CNN service
      });
    }

    // Log the CNN prediction result
    console.log("CNN Prediction:", prediction.class_index);

    // ========================================
    // TODO: Implement proper disease mapping
    // ========================================
    // Currently hardcoded to "Leaf_Mold"
    // Should map CNN class_index to actual disease name
    // Example: Use prediction.class_name or a lookup table
    const disease = "Leaf_Mold";

    // Generate treatment advice using LLM (Gemini AI)
    // Send disease information to AI service for structured recommendations
    const advice = await llmService.generateCropAdvice({
      crop: "Tomato",                    // TODO: Make crop type dynamic based on user input
      disease,                           // Disease name from CNN (currently hardcoded)
      severity: "Moderate",              // TODO: Calculate severity based on confidence or other factors
      confidence: prediction.confidence  // CNN detection confidence score (0-1)
    });

    // Return successful response with disease info and treatment advice
    res.json({
      success: true,                     // Indicates successful processing
      disease,                           // Detected disease name
      confidence: prediction.confidence, // CNN confidence score
      advice                            // LLM-generated treatment recommendations
    });

  } catch (error) {
    // Handle any errors in the prediction pipeline
    // Errors could come from:
    // - File upload issues
    // - CNN service unavailable (connection refused)
    // - LLM service errors (API key invalid, rate limit)
    // - Network timeouts
    console.error("Prediction pipeline error:", error.message);

    // Return 500 Internal Server Error
    res.status(500).json({ error: "Prediction pipeline failed" });
  }
});

// Export the router to be used in server.js
// This allows the routes to be mounted at /api
export default router;

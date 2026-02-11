import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import llmService from "../services/llmService.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/crop-advice", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file required" });
    }

    console.log("Sending image to CNN service...");

    const form = new FormData();
    form.append("file", req.file.buffer, req.file.originalname);

    const cnnResponse = await axios.post(
      "http://127.0.0.1:5001/predict",
      form,
      { headers: form.getHeaders() }
    );

    const prediction = cnnResponse.data;

    // ---------- IMPORTANT CHECK ----------
    if (!prediction.success) {
      return res.json({
        success: false,
        message: prediction.error
      });
    }
    // -------------------------------------

    console.log("CNN Prediction:", prediction.class_index);

    const disease = "Leaf_Mold"; // map later properly

    const advice = await llmService.generateCropAdvice({
      crop: "Tomato",
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

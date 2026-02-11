# 🌱 SWE_AI_CROP_BACK — AI Crop Disease Detection Backend

Backend services for the SWE_AI_CROP system.  
This repository handles **CNN inference, AI advisory generation, and API orchestration** between the frontend and machine learning services.

---

## 🚜 Overview

This backend powers the AI pipeline that allows farmers to:

- Upload crop leaf images
- Detect plant diseases using a CNN model
- Receive AI-generated treatment advice
- Get structured responses for frontend display

The system integrates **Computer Vision + Generative AI** into a single API.

---

## 🧠 System Pipeline

Upload image
↓
Node Backend API
↓
FastAPI CNN Service
↓
Disease prediction
↓
Gemini AI Advisory
↓
Single JSON response


---

## 🧰 Tech Stack

### Backend API
- Node.js
- Express.js
- Axios
- Multer

### AI Inference Service
- FastAPI
- TensorFlow / Keras
- Pillow
- NumPy

### AI Advisory
- Google Gemini API (@google/genai)

---

## 🏗️ Project Structure


---

## 🧰 Tech Stack

### Backend API
- Node.js
- Express.js
- Axios
- Multer

### AI Inference Service
- FastAPI
- TensorFlow / Keras
- Pillow
- NumPy

### AI Advisory
- Google Gemini API (@google/genai)

---

## 🏗️ Project Structure

SWE_AI_CROP_BACK
│
├── ai_service/
│ ├── app.py
│ ├── class_names.py
│ ├── model.weights.h5
│ └── requirements.txt
│
├── routes/
│ └── cropAdvice.js
│
├── services/
│ ├── cnnService.js
│ └── llmService.js
│
├── server.js
├── test_upload.py
├── package.json
└── .env


---

## ✨ Features

### CNN Disease Detection
- MobileNetV2 transfer learning model
- PlantVillage dataset
- 38 disease classes supported
- Image preprocessing pipeline

---

### Leaf Validation

Rejects invalid uploads such as:
- Humans
- Objects
- Non-plant images

Response example:

```json
{
  "success": false,
  "message": "Uploaded image does not appear to be a plant leaf"
}
AI Advisory System

Uses Gemini AI to generate:

Cause

Symptoms

Immediate action

Chemical treatment

Organic treatment

Prevention

🔌 API Endpoints
Test Backend
GET /api/test

Crop Disease Detection + Advice
POST /api/crop-advice


Form-data:

file → image

Example Response
{
  "success": true,
  "disease": "Leaf_Mold",
  "confidence": 0.99,
  "advice": {
    "cause": "...",
    "symptoms": "...",
    "immediate": "...",
    "chemical": "...",
    "organic": "...",
    "prevention": "..."
  }
}

▶️ Running Locally
Install Node dependencies
npm install

Install Python dependencies
cd ai_service
pip install -r requirements.txt

Start CNN service
cd ai_service
python -m uvicorn app:app --reload --port 5001

Start backend server
npm start

🔑 Environment Variables

Create .env in the root folder:

GEMINI_API_KEY=your_api_key_here
MONGO_URL=your_mongodb_connection

🧪 Test Script

You can test the full pipeline using:

python test_upload.py

📊 Dataset

Model trained using:

PlantVillage Dataset
https://www.kaggle.com/datasets/emmarex/plantdisease

Supported crops include:

Apple

Corn

Grape

Potato

Tomato

Pepper

Strawberry

Peach

Orange

Squash

Soybean

Raspberry

Blueberry

Cherry

👨‍💻 Contributors
Name	Role
Dhanuja	Backend Engineer
Bhuvaneshwari	DevOps Engineer
Ramaroshinee	Full Stack Developer
Akshith	Frontend Developer
Saketh	Testing Engineer
🔮 Future Improvements

Docker deployment

Offline CNN inference

Confidence calibration

Model quantization

Regional crop advisory tuning

Logging and monitoring

🌾 Vision

Build an AI-powered agriculture assistant that enables farmers to detect crop diseases quickly and receive understandable treatment guidance.

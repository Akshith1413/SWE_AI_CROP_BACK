# FastAPI service for crop disease prediction using TensorFlow
from fastapi import FastAPI, File, UploadFile
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = FastAPI()

# Path to trained Keras model for crop disease classification
MODEL_PATH = "crop_disease_model.keras"   

# Load the pre-trained model
model = tf.keras.models.load_model(MODEL_PATH)

# List of disease classes the model can predict
CLASS_NAMES = [
    "Tomato_Early_blight",
    "Tomato_Late_blight",
    "Tomato_Healthy"
]

# Required image size for the model
IMG_SIZE = 224

# Preprocess image for model input
def preprocess(img):
    # Resize to model input size
    img = img.resize((IMG_SIZE, IMG_SIZE))
    # Normalize pixel values to 0-1 range
    img = np.array(img) / 255.0
    # Add batch dimension
    img = np.expand_dims(img, axis=0)

    return img

# API endpoint for disease prediction
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read uploaded image file
    data = await file.read()

    # Convert to PIL Image
    img = Image.open(io.BytesIO(data)).convert("RGB")

    # Preprocess for model
    img = preprocess(img)

    # Get model predictions
    preds = model.predict(img)

    # Extract predicted class and confidence
    idx = np.argmax(preds)
    conf = float(np.max(preds))

    return {
        "disease": CLASS_NAMES[idx],
        "confidence": round(conf, 3)
    }

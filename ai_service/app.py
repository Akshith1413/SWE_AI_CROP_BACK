from fastapi import FastAPI, UploadFile, File
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = FastAPI()

IMG_SIZE = 224
NUM_CLASSES = 38

print("Loading CNN model...")

data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.1),
])

normalization = tf.keras.layers.Rescaling(1./255)

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights="imagenet"
)

base_model.trainable = False

model = tf.keras.Sequential([
    data_augmentation,
    normalization,
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(NUM_CLASSES, activation="softmax")
])

model(np.zeros((1, IMG_SIZE, IMG_SIZE, 3)))
model.load_weights("model.weights.h5")

print("CNN READY")

# ---------- LEAF VALIDATION ----------
def is_leaf_image(image):
    arr = np.array(image)
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    green_pixels = np.sum((g > r) & (g > b))
    total_pixels = arr.shape[0] * arr.shape[1]
    return (green_pixels / total_pixels) > 0.08
# -------------------------------------

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    # leaf validation
    if not is_leaf_image(image):
        return {
            "success": False,
            "error": "Uploaded image does not appear to be a plant leaf"
        }

    image = image.resize((IMG_SIZE, IMG_SIZE))
    img = np.array(image)
    img = np.expand_dims(img, axis=0)

    pred = model.predict(img)

    return {
        "success": True,
        "class_index": int(np.argmax(pred)),
        "confidence": float(np.max(pred))
    }

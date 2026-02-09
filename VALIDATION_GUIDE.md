# Crop and Disease Validation System

## Overview
This system prevents nonsensical crop names and diseases from being processed by the AI. It validates all inputs against a comprehensive database of known crops and their associated diseases.

## Features

### 1. **Crop Validation**
- Validates against a list of 40+ recognized crops including vegetables, fruits, grains, and cash crops
- Fuzzy matching to handle minor typos (e.g., "tomatoe" → "tomato")
- Provides suggestions for similar crops when an invalid crop is entered

### 2. **Disease Validation**
- Validates diseases against crop-specific disease databases
- Supports 100+ known crop diseases
- Falls back to generic disease terms when crop-specific diseases aren't available
- Provides helpful suggestions when an invalid disease is detected

### 3. **User-Friendly Error Messages**
When invalid inputs are detected, the API returns:
- Clear error messages explaining what went wrong
- Suggestions for valid alternatives
- Complete lists of valid crops or diseases for reference

## API Endpoints

### POST `/api/crop-advice`
Generate crop disease advice with validation

**Request Body:**
```json
{
  "crop": "Tomato",
  "disease": "Early Blight",
  "severity": "medium",
  "confidence": 0.93
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "cause": "...",
    "symptoms": "...",
    "immediate": "...",
    "chemical": "...",
    "organic": "...",
    "prevention": "...",
    "metadata": {...}
  },
  "warnings": []
}
```

**Error Response (Invalid Crop):**
```json
{
  "success": false,
  "error": "Invalid crop name: \"xyz\"",
  "message": "Please provide a valid crop name.",
  "suggestions": ["tomato", "potato", "pepper"],
  "userGuidance": "Please provide a correct crop name from the list of valid crops.",
  "validCrops": ["tomato", "potato", "pepper", "..."]
}
```

**Error Response (Invalid Disease):**
```json
{
  "success": false,
  "error": "Invalid disease for tomato: \"random disease\"",
  "message": "\"random disease\" is not a recognized disease for tomato",
  "suggestions": ["early blight", "late blight", "leaf mold", "septoria leaf spot", "bacterial spot"],
  "userGuidance": "Please provide a correct disease name for tomato.",
  "crop": "tomato",
  "validDiseases": ["early blight", "late blight", "..."]
}
```

### POST `/api/crop-advice/batch`
Generate advice for multiple crops with validation

**Request Body:**
```json
{
  "diseases": [
    {
      "crop": "Tomato",
      "disease": "Early Blight",
      "severity": "medium",
      "confidence": 0.93
    },
    {
      "crop": "Potato",
      "disease": "Late Blight",
      "severity": "high",
      "confidence": 0.87
    }
  ]
}
```

**Error Response (Invalid Entry):**
```json
{
  "success": false,
  "error": "Entry 2: Invalid disease for potato: \"fake disease\"",
  "message": "\"fake disease\" is not a recognized disease for potato",
  "suggestions": ["early blight", "late blight", "common scab"],
  "index": 1,
  "userGuidance": "Please provide a correct disease name for potato.",
  "crop": "potato",
  "validDiseases": ["early blight", "late blight", "..."]
}
```

### GET `/api/crop-advice/valid-crops`
Get list of all valid crops

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 40,
    "crops": ["tomato", "potato", "pepper", "apple", "grape", "..."]
  }
}
```

### GET `/api/crop-advice/diseases/:crop`
Get list of diseases for a specific crop

**Example:** `/api/crop-advice/diseases/tomato`

**Response:**
```json
{
  "success": true,
  "data": {
    "crop": "tomato",
    "count": 14,
    "diseases": [
      "early blight",
      "late blight",
      "leaf mold",
      "septoria leaf spot",
      "bacterial spot",
      "target spot",
      "yellow leaf curl virus",
      "mosaic virus",
      "spider mites",
      "tomato yellow leaf curl disease",
      "fusarium wilt",
      "verticillium wilt",
      "powdery mildew",
      "anthracnose"
    ]
  }
}
```

## Supported Crops

### Vegetables
tomato, potato, pepper, bell pepper, chili, cucumber, eggplant, brinjal, cabbage, cauliflower, lettuce, spinach, carrot, onion, garlic, pumpkin, squash

### Fruits
apple, grape, orange, lemon, strawberry, blueberry, raspberry, peach, cherry, mango, banana, papaya

### Grains & Cereals
corn, maize, wheat, rice, barley, soybean, soy

### Cash Crops
cotton, sugarcane, tobacco, tea, coffee

### Others
groundnut, peanut, sunflower, mustard

## Validation Logic

1. **Normalize Input**: Convert to lowercase, trim whitespace
2. **Exact Match**: Check if input exactly matches valid crops/diseases
3. **Fuzzy Match**: Check for partial matches (e.g., substring matching)
4. **Suggestions**: If invalid, provide similar valid options
5. **Generic Fallback**: For diseases, accept generic terms like "blight", "rot", "wilt"

## Testing Examples

### Valid Request
```bash
curl -X POST http://localhost:3000/api/crop-advice \
  -H "Content-Type: application/json" \
  -d '{
    "crop": "Tomato",
    "disease": "Early Blight",
    "severity": "medium",
    "confidence": 0.93
  }'
```

### Invalid Crop
```bash
curl -X POST http://localhost:3000/api/crop-advice \
  -H "Content-Type: application/json" \
  -d '{
    "crop": "xyz123",
    "disease": "Early Blight"
  }'
```

**Expected**: Error with list of valid crops

### Invalid Disease
```bash
curl -X POST http://localhost:3000/api/crop-advice \
  -H "Content-Type: application/json" \
  -d '{
    "crop": "Tomato",
    "disease": "random nonsense disease"
  }'
```

**Expected**: Error with list of valid diseases for tomato

### Fuzzy Matching (Typo)
```bash
curl -X POST http://localhost:3000/api/crop-advice \
  -H "Content-Type: application/json" \
  -d '{
    "crop": "tomatoe",
    "disease": "early blt"
  }'
```

**Expected**: Success with warning about interpretation

## Benefits

1. **Prevents Nonsensical Inputs**: Blocks garbage data from reaching the AI
2. **Farmer-Friendly**: Provides clear guidance on correct inputs
3. **Educational**: Shows farmers what crops and diseases are recognized
4. **Flexible**: Fuzzy matching handles minor typos and variations
5. **Scalable**: Easy to add new crops and diseases to the database

## Implementation Files

- **`utils/cropValidator.js`**: Core validation logic and crop/disease database
- **`routes/cropAdvice.js`**: API routes with validation integration

/**
 * Crop and Disease Validation Utility
 * Validates user input against known crops and diseases
 */

// List of valid crops
const VALID_CROPS = [
    // Vegetables
    'tomato', 'potato', 'pepper', 'bell pepper', 'chili', 'cucumber',
    'eggplant', 'brinjal', 'cabbage', 'cauliflower', 'lettuce',
    'spinach', 'carrot', 'onion', 'garlic', 'pumpkin', 'squash',

    // Fruits
    'apple', 'grape', 'orange', 'lemon', 'strawberry', 'blueberry',
    'raspberry', 'peach', 'cherry', 'mango', 'banana', 'papaya',

    // Grains & Cereals
    'corn', 'maize', 'wheat', 'rice', 'barley', 'soybean', 'soy',

    // Cash Crops
    'cotton', 'sugarcane', 'tobacco', 'tea', 'coffee',

    // Others
    'groundnut', 'peanut', 'sunflower', 'mustard'
];

// Common crop diseases mapped to their crops
const CROP_DISEASES = {
    'tomato': [
        'early blight', 'late blight', 'leaf mold', 'septoria leaf spot',
        'bacterial spot', 'target spot', 'yellow leaf curl virus', 'mosaic virus',
        'spider mites', 'tomato yellow leaf curl disease', 'fusarium wilt',
        'verticillium wilt', 'powdery mildew', 'anthracnose'
    ],
    'potato': [
        'early blight', 'late blight', 'common scab', 'black scurf',
        'pink rot', 'powdery scab', 'verticillium wilt', 'bacterial wilt',
        'potato virus y', 'potato leaf roll virus', 'blackleg'
    ],
    'pepper': [
        'bacterial spot', 'cercospora leaf spot', 'anthracnose',
        'phytophthora blight', 'powdery mildew', 'mosaic virus',
        'leaf curl', 'blossom end rot', 'tobacco mosaic virus'
    ],
    'bell pepper': [
        'bacterial spot', 'cercospora leaf spot', 'anthracnose',
        'phytophthora blight', 'powdery mildew', 'mosaic virus',
        'leaf curl', 'blossom end rot'
    ],
    'apple': [
        'apple scab', 'fire blight', 'powdery mildew', 'cedar apple rust',
        'black rot', 'bitter rot', 'brown rot', 'flyspeck',
        'sooty blotch', 'alternaria leaf blotch'
    ],
    'grape': [
        'powdery mildew', 'downy mildew', 'black rot', 'anthracnose',
        'botrytis bunch rot', 'esca', 'pierce\'s disease', 'crown gall',
        'eutypa dieback', 'phomopsis cane and leaf spot'
    ],
    'corn': [
        'northern corn leaf blight', 'southern corn leaf blight',
        'common rust', 'southern rust', 'gray leaf spot', 'eyespot',
        'anthracnose', 'stalk rot', 'ear rot', 'smut', 'stewart\'s wilt',
        'northern leaf spot'
    ],
    'rice': [
        'blast', 'brown spot', 'bacterial leaf blight', 'sheath blight',
        'tungro virus', 'bacterial leaf streak', 'stem rot',
        'false smut', 'bakanae disease'
    ],
    'wheat': [
        'stripe rust', 'leaf rust', 'stem rust', 'powdery mildew',
        'septoria tritici blotch', 'tan spot', 'fusarium head blight',
        'common bunt', 'loose smut', 'take-all'
    ],
    'cotton': [
        'bacterial blight', 'verticillium wilt', 'fusarium wilt',
        'anthracnose', 'alternaria leaf spot', 'powdery mildew',
        'root rot', 'seedling disease', 'boll rot'
    ],
    'soybean': [
        'frogeye leaf spot', 'brown spot', 'bacterial blight',
        'pod and stem blight', 'anthracnose', 'sudden death syndrome',
        'white mold', 'downy mildew', 'rust', 'charcoal rot'
    ],
    'cucumber': [
        'anthracnose', 'bacterial wilt', 'downy mildew', 'powdery mildew',
        'angular leaf spot', 'belly rot', 'gummy stem blight',
        'mosaic virus', 'scab'
    ]
};

// Generic diseases that can affect multiple crops
const GENERIC_DISEASES = [
    'fungal infection', 'bacterial infection', 'viral infection',
    'root rot', 'leaf spot', 'blight', 'wilt', 'mildew',
    'rust', 'scab', 'canker', 'rot', 'anthracnose', 'mosaic'
];

/**
 * Normalize input string for comparison
 * @param {string} input - User input
 * @returns {string} - Normalized string
 */
function normalizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.toLowerCase().trim();
}

/**
 * Check if a crop is valid
 * @param {string} crop - Crop name to validate
 * @returns {Object} - { isValid: boolean, suggestedCrop: string|null }
 */
export function validateCrop(crop) {
    const normalizedCrop = normalizeInput(crop);

    // Check exact match
    if (VALID_CROPS.includes(normalizedCrop)) {
        return { isValid: true, suggestedCrop: normalizedCrop };
    }

    // Check partial match
    const partialMatch = VALID_CROPS.find(validCrop =>
        normalizedCrop.includes(validCrop) || validCrop.includes(normalizedCrop)
    );

    if (partialMatch) {
        return {
            isValid: true,
            suggestedCrop: partialMatch,
            warning: `Interpreted "${crop}" as "${partialMatch}"`
        };
    }

    // Find similar crops (fuzzy matching based on first few characters)
    const suggestions = VALID_CROPS.filter(validCrop => {
        const cropStart = normalizedCrop.substring(0, 3);
        return validCrop.startsWith(cropStart) && cropStart.length >= 3;
    });

    return {
        isValid: false,
        suggestedCrop: null,
        suggestions: suggestions.length > 0 ? suggestions : null
    };
}

/**
 * Check if a disease is valid for the given crop
 * @param {string} crop - Crop name
 * @param {string} disease - Disease name
 * @returns {Object} - { isValid: boolean, message: string|null }
 */
export function validateDisease(crop, disease) {
    const normalizedCrop = normalizeInput(crop);
    const normalizedDisease = normalizeInput(disease);

    // Check if crop has specific diseases listed
    if (CROP_DISEASES[normalizedCrop]) {
        const cropSpecificDiseases = CROP_DISEASES[normalizedCrop];

        // Check exact match
        if (cropSpecificDiseases.includes(normalizedDisease)) {
            return { isValid: true, message: null };
        }

        // Check partial match
        const partialMatch = cropSpecificDiseases.find(validDisease =>
            normalizedDisease.includes(validDisease) || validDisease.includes(normalizedDisease)
        );

        if (partialMatch) {
            return {
                isValid: true,
                message: `Interpreted "${disease}" as "${partialMatch}"`,
                suggestedDisease: partialMatch
            };
        }

        // Check generic diseases
        const genericMatch = GENERIC_DISEASES.find(genericDisease =>
            normalizedDisease.includes(genericDisease) || genericDisease.includes(normalizedDisease)
        );

        if (genericMatch) {
            return {
                isValid: true,
                message: `Accepted generic disease: "${disease}"`,
                warning: 'This is a generic disease term. More specific information would help provide better advice.'
            };
        }

        // Find similar diseases
        const suggestions = cropSpecificDiseases.filter(validDisease => {
            const diseaseStart = normalizedDisease.substring(0, 4);
            return validDisease.includes(diseaseStart) && diseaseStart.length >= 4;
        });

        return {
            isValid: false,
            message: `"${disease}" is not a recognized disease for ${crop}`,
            suggestions: suggestions.length > 0 ? suggestions : cropSpecificDiseases.slice(0, 5)
        };
    }

    // For crops without specific disease list, check generic diseases
    const genericMatch = GENERIC_DISEASES.find(genericDisease =>
        normalizedDisease.includes(genericDisease) || genericDisease.includes(normalizedDisease)
    );

    if (genericMatch) {
        return {
            isValid: true,
            warning: 'This is a generic disease term. More specific information would help provide better advice.'
        };
    }

    // If no match found
    return {
        isValid: false,
        message: `"${disease}" is not a recognized disease`,
        suggestions: GENERIC_DISEASES.slice(0, 5)
    };
}

/**
 * Comprehensive validation of crop and disease
 * @param {string} crop - Crop name
 * @param {string} disease - Disease name
 * @returns {Object} - Validation result with suggestions
 */
export function validateCropAndDisease(crop, disease) {
    // Validate crop first
    const cropValidation = validateCrop(crop);

    if (!cropValidation.isValid) {
        return {
            success: false,
            error: `Invalid crop name: "${crop}"`,
            message: 'Please provide a valid crop name.',
            suggestions: cropValidation.suggestions,
            validCrops: VALID_CROPS.slice(0, 20) // Return first 20 crops as examples
        };
    }

    // Use the suggested/normalized crop for disease validation
    const validatedCrop = cropValidation.suggestedCrop;

    // Validate disease
    const diseaseValidation = validateDisease(validatedCrop, disease);

    if (!diseaseValidation.isValid) {
        return {
            success: false,
            error: `Invalid disease for ${validatedCrop}: "${disease}"`,
            message: diseaseValidation.message,
            suggestions: diseaseValidation.suggestions,
            crop: validatedCrop
        };
    }

    // Both are valid
    return {
        success: true,
        crop: validatedCrop,
        disease: diseaseValidation.suggestedDisease || disease,
        warnings: [cropValidation.warning, diseaseValidation.warning].filter(Boolean)
    };
}

/**
 * Get list of all valid crops
 * @returns {Array} - List of valid crops
 */
export function getValidCrops() {
    return [...VALID_CROPS];
}

/**
 * Get diseases for a specific crop
 * @param {string} crop - Crop name
 * @returns {Array} - List of diseases or null
 */
export function getDiseasesForCrop(crop) {
    const normalizedCrop = normalizeInput(crop);
    return CROP_DISEASES[normalizedCrop] || null;
}

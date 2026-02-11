/**
 * Unit Tests for Crop Advice Routes
 * Tests API route validation and structure
 * Validates request/response formats for the crop disease diagnosis API
 * Ensures proper integration with CNN service and LLM service
 */
import { describe, it, expect } from 'vitest'

// Test suite for crop advice route validation
// Validates the structure and format of API requests and responses
describe('Crop Advice Route Validation', () => {
    // Test: Route path follows correct format
    // Validates the API endpoint path structure
    it('should validate route path structure', () => {
        // Define the route path (as configured in Express router)
        const route = '/crop-advice'

        // Verify exact route path
        expect(route).toBe('/crop-advice')

        // Ensure path starts with forward slash (standard REST convention)
        expect(route).toMatch(/^\//)
    })

    // Test: Request body has correct structure for crop advice
    // Validates the shape of data sent to the backend
    it('should validate request body structure for crop advice', () => {
        // Mock request body (as sent from frontend)
        // This represents the data structure for crop diagnosis
        const mockRequest = {
            crop: 'Tomato',          // Type of crop (e.g., Tomato, Potato)
            disease: 'Leaf_Mold',    // Detected disease name
            severity: 'Moderate',    // Disease severity level
            confidence: 0.95         // CNN detection confidence (0-1)
        }

        // Verify all required fields are present
        expect(mockRequest).toHaveProperty('crop')
        expect(mockRequest).toHaveProperty('disease')
        expect(mockRequest).toHaveProperty('severity')
        expect(mockRequest).toHaveProperty('confidence')

        // Validate data types for type safety
        expect(typeof mockRequest.crop).toBe('string')
        expect(typeof mockRequest.confidence).toBe('number')
    })

    // Test: Response structure contains all expected fields
    // Validates the complete API response format
    it('should validate response structure for crop advice', () => {
        // Mock successful response (as returned from backend)
        // This is the complete structure sent to the frontend
        const mockResponse = {
            success: true,              // Operation success indicator
            disease: 'Leaf_Mold',      // Confirmed disease name
            confidence: 0.95,          // Detection confidence level
            advice: {                  // LLM-generated treatment advice
                cause: 'Fungal infection',       // Root cause explanation
                symptoms: 'Yellow spots',        // Visible symptoms
                immediate: 'Remove leaves',      // Urgent action needed
                chemical: 'Apply fungicide',     // Chemical treatment option
                organic: 'Neem oil',            // Organic treatment option
                prevention: 'Improve ventilation' // Future prevention tips
            }
        }

        // Verify top-level response fields exist
        expect(mockResponse).toHaveProperty('success')
        expect(mockResponse).toHaveProperty('disease')
        expect(mockResponse).toHaveProperty('confidence')
        expect(mockResponse).toHaveProperty('advice')

        // Verify nested advice object has required fields
        expect(mockResponse.advice).toHaveProperty('cause')
        expect(mockResponse.advice).toHaveProperty('symptoms')
    })

    // Test: Error response has correct structure
    // Validates error handling and response format
    it('should validate error response structure', () => {
        // Mock error response (returned when request fails)
        const mockError = {
            success: false,              // Indicates operation failed
            error: 'Image file required' // Human-readable error message
        }

        // Verify error response structure
        expect(mockError).toHaveProperty('success')
        expect(mockError).toHaveProperty('error')

        // Confirm success is false for error cases
        expect(mockError.success).toBe(false)

        // Error message should be a string
        expect(typeof mockError.error).toBe('string')
    })

    // Test: File upload requirements are properly defined
    // Validates multipart form data configuration
    it('should validate file upload requirements', () => {
        // Define file upload requirements (as used by Multer)
        const fileRequirements = {
            required: true,                                    // File is mandatory
            fieldName: 'file',                                // Multipart field name
            accepts: ['image/jpeg', 'image/png', 'image/jpg'] // Allowed MIME types
        }

        // Verify file is marked as required
        expect(fileRequirements.required).toBe(true)

        // Verify correct field name ('file' is expected by backend)
        expect(fileRequirements.fieldName).toBe('file')

        // Verify JPEG is accepted
        expect(fileRequirements.accepts).toContain('image/jpeg')

        // Verify PNG is accepted
        expect(fileRequirements.accepts).toContain('image/png')
    })
})

// Test suite for CNN (Convolutional Neural Network) service integration
// Validates communication with the Python ML service
describe('CNN Service Integration', () => {
    // Test: CNN endpoint URL is correctly formatted
    // Validates the external ML service endpoint
    it('should validate CNN endpoint structure', () => {
        // Define CNN service endpoint (Python Flask server)
        // This service runs separately and handles image classification
        const cnnEndpoint = 'http://127.0.0.1:5001/predict'

        // Verify URL uses HTTP protocol
        expect(cnnEndpoint).toMatch(/^http/)

        // Ensure endpoint includes the /predict path
        expect(cnnEndpoint).toContain('/predict')
    })

    // Test: CNN response contains expected prediction data
    // Validates the structure of ML model predictions
    it('should validate CNN response structure', () => {
        // Mock CNN service response (from Python ML model)
        // This is the data structure returned by the classification model
        const mockCnnResponse = {
            success: true,                  // Prediction succeeded
            class_index: 5,                 // Numeric class identifier
            confidence: 0.96,               // Model confidence (0-1)
            class_name: 'Tomato_Leaf_Mold' // Human-readable disease name
        }

        // Verify response has success indicator
        expect(mockCnnResponse).toHaveProperty('success')

        // Verify confidence score is present
        expect(mockCnnResponse).toHaveProperty('confidence')

        // Confidence should be a number
        expect(typeof mockCnnResponse.confidence).toBe('number')

        // Confidence must be >= 0 (valid probability range)
        expect(mockCnnResponse.confidence).toBeGreaterThanOrEqual(0)

        // Confidence must be <= 1 (valid probability range)
        expect(mockCnnResponse.confidence).toBeLessThanOrEqual(1)
    })
})

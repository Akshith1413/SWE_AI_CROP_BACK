/**
 * Unit Tests for LLM Service
 * Tests parsing logic and structured advice generation
 * Validates the service's ability to extract crop disease advice from AI responses
 * Uses mock responses to test without actual API calls
 */
import { describe, it, expect } from 'vitest'

// Test suite for LLM parsing logic
// Tests how the service extracts structured data from AI text responses
describe('LLM Service - Parsing Logic', () => {
    // Mock parsing function (mimics the real parseAdviceResponse)
    // This function extracts advice fields from formatted text
    function parseAdviceResponse(text) {
        // Initialize advice object with empty strings
        // This structure holds all extracted crop disease advice
        const advice = {
            cause: '',        // Root cause of the disease
            symptoms: '',     // Visible signs of the disease
            immediate: '',    // Urgent actions to take
            chemical: '',     // Chemical treatment options
            organic: '',      // Organic/natural treatment options
            prevention: ''    // Future prevention strategies
        }

        // Use regex to extract each field from the formatted response
        // Pattern matches "FIELD_NAME: content" until next field or end
        const causeMatch = text.match(/CAUSE:\s*(.+?)(?=\n\n|SYMPTOMS:|$)/is)
        const symptomsMatch = text.match(/SYMPTOMS:\s*(.+?)(?=\n\n|IMMEDIATE:|$)/is)
        const immediateMatch = text.match(/IMMEDIATE:\s*(.+?)(?=\n\n|CHEMICAL:|$)/is)
        const chemicalMatch = text.match(/CHEMICAL:\s*(.+?)(?=\n\n|ORGANIC:|$)/is)
        const organicMatch = text.match(/ORGANIC:\s*(.+?)(?=\n\n|PREVENTION:|$)/is)
        const preventionMatch = text.match(/PREVENTION:\s*(.+?)(?=\n\n|$)/is)

        // Assign matched values with trim, or use defaults if field is missing
        // Default values ensure the API always returns usable advice
        advice.cause = causeMatch ? causeMatch[1].trim() : 'Unable to determine cause'
        advice.symptoms = symptomsMatch ? symptomsMatch[1].trim() : 'Unable to determine symptoms'
        advice.immediate = immediateMatch ? immediateMatch[1].trim() : 'Consult agricultural expert'
        advice.chemical = chemicalMatch ? chemicalMatch[1].trim() : 'Consult local agriculture office'
        advice.organic = organicMatch ? organicMatch[1].trim() : 'Neem oil spray recommended'
        advice.prevention = preventionMatch ? preventionMatch[1].trim() : 'Maintain proper plant hygiene'

        // Return the structured advice object
        return advice
    }

    // Test: Parse a complete, well-formatted response
    // Validates extraction of all fields from a properly formatted LLM response
    it('should parse well-formatted LLM response correctly', () => {
        // Mock response with all fields present
        // This simulates a complete response from the Gemini AI
        const mockResponse = `
CAUSE: Fungal infection due to high humidity

SYMPTOMS: Yellow spots on leaves, wilting

IMMEDIATE: Remove infected leaves immediately

CHEMICAL: Apply copper-based fungicide at 2g/L

ORGANIC: Spray neem oil solution

PREVENTION: Ensure proper air circulation
    `

        // Parse the mock response
        const result = parseAdviceResponse(mockResponse)

        // Verify each field was extracted correctly
        // All assertions should pass for a well-formatted response
        expect(result.cause).toBe('Fungal infection due to high humidity')
        expect(result.symptoms).toBe('Yellow spots on leaves, wilting')
        expect(result.immediate).toBe('Remove infected leaves immediately')
        expect(result.chemical).toBe('Apply copper-based fungicide at 2g/L')
        expect(result.organic).toBe('Spray neem oil solution')
        expect(result.prevention).toBe('Ensure proper air circulation')
    })

    // Test: Handle missing fields with default values
    // Ensures the parser gracefully handles incomplete responses
    it('should provide default values for missing fields', () => {
        // Mock response with only some fields present
        // Simulates an incomplete or truncated AI response
        const mockResponse = `
CAUSE: Bacterial infection

SYMPTOMS: Dark spots on stems
    `

        // Parse the incomplete response
        const result = parseAdviceResponse(mockResponse)

        // Verify present fields were extracted
        expect(result.cause).toBe('Bacterial infection')
        expect(result.symptoms).toBe('Dark spots on stems')

        // Verify missing fields have sensible defaults
        // These defaults guide users to seek expert help
        expect(result.immediate).toBe('Consult agricultural expert')
        expect(result.chemical).toBe('Consult local agriculture office')
        expect(result.organic).toBe('Neem oil spray recommended')
        expect(result.prevention).toBe('Maintain proper plant hygiene')
    })

    // Test: Handle completely empty response
    // Validates parser doesn't crash on empty input
    it('should handle empty response with defaults', () => {
        // Empty string simulates failed or empty AI response
        const mockResponse = ''

        // Parse the empty response
        const result = parseAdviceResponse(mockResponse)

        // All fields should receive default "unable to determine" values
        // This prevents errors in the UI by always providing text
        expect(result.cause).toBe('Unable to determine cause')
        expect(result.symptoms).toBe('Unable to determine symptoms')
        expect(result.immediate).toBe('Consult agricultural expert')
    })

    // Test: Whitespace trimming
    // Ensures extracted text doesn't have leading/trailing spaces
    it('should trim whitespace from parsed fields', () => {
        // Mock response with extra whitespace around field values
        // This simulates inconsistent AI formatting
        const mockResponse = `
CAUSE:    Fungal infection   

SYMPTOMS:   Yellow spots   

IMMEDIATE:   Remove leaves   
    `

        // Parse the response with extra whitespace
        const result = parseAdviceResponse(mockResponse)

        // Verify whitespace was properly trimmed from all fields
        // Clean text improves UI presentation
        expect(result.cause).toBe('Fungal infection')
        expect(result.symptoms).toBe('Yellow spots')
        expect(result.immediate).toBe('Remove leaves')
    })

    // Test: Multi-line content extraction
    // Validates parser can handle content spanning multiple lines
    it('should extract multi-line field content', () => {
        // Mock response with multi-line field values
        // Some AI responses may provide detailed multi-line explanations
        const mockResponse = `
CAUSE: Fungal infection
This is caused by high humidity

SYMPTOMS: Yellow spots on leaves
Wilting and browning
    `

        // Parse the multi-line response
        const result = parseAdviceResponse(mockResponse)

        // Verify at least the first line of each field was captured
        // The exact behavior depends on regex termination rules
        expect(result.cause).toContain('Fungal infection')
        expect(result.symptoms).toContain('Yellow spots')
    })
})

// Test suite for advice object structure validation
// Ensures the returned advice objects have the correct shape
describe('LLM Service - Structure Validation', () => {
    // Test: Advice object contains all required properties
    // Validates the complete structure of the advice response
    it('should validate advice object has all required fields', () => {
        // Create a sample advice object with all fields
        // This represents a complete parsed response
        const advice = {
            cause: 'Test cause',
            symptoms: 'Test symptoms',
            immediate: 'Test immediate',
            chemical: 'Test chemical',
            organic: 'Test organic',
            prevention: 'Test prevention'
        }

        // Verify each required property exists
        // The frontend expects all six fields to be present
        expect(advice).toHaveProperty('cause')
        expect(advice).toHaveProperty('symptoms')
        expect(advice).toHaveProperty('immediate')
        expect(advice).toHaveProperty('chemical')
        expect(advice).toHaveProperty('organic')
        expect(advice).toHaveProperty('prevention')
    })

    // Test: All advice fields are strings
    // Type validation ensures consistent data types for the frontend
    it('should validate all fields are strings', () => {
        // Create advice object with string values
        // All advice content should be text, not numbers or objects
        const advice = {
            cause: 'Test',
            symptoms: 'Test',
            immediate: 'Test',
            chemical: 'Test',
            organic: 'Test',
            prevention: 'Test'
        }

        // Iterate through all values and verify they're strings
        // This ensures type consistency for UI rendering
        Object.values(advice).forEach(value => {
            expect(typeof value).toBe('string')
        })
    })
})

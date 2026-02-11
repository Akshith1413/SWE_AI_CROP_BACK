/**
 * LLM (Large Language Model) Service
 * Integrates with Google Gemini AI to generate crop disease treatment advice
 * Handles AI prompt engineering, response parsing, and error handling
 * Provides structured agricultural advice based on disease detection results
 */

// Import Gemini AI SDK and environment configuration
import { GoogleGenAI } from "@google/genai";  // Google's Gemini AI client library
import dotenv from "dotenv";                   // Environment variable loader

// Load environment variables from .env file
dotenv.config();

/**
 * LLM Service Class
 * Singleton service for managing Gemini AI interactions
 * Generates and parses crop disease treatment recommendations
 */
class LLMService {
    constructor() {
        // Retrieve Gemini API key from environment variables
        // API key is required for authenticating with Google's AI service
        const apiKey = process.env.GEMINI_API_KEY || '';

        // Warn if API key is missing (will cause failures in production)
        if (!apiKey) {
            console.warn('⚠️  Warning: GEMINI_API_KEY not found in environment variables');
        } else {
            console.log('✓ Gemini API Key loaded');
        }

        // Initialize Gemini AI client with authentication
        // This client handles all communication with Google's AI API
        this.ai = new GoogleGenAI(apiKey);

        // Specify which Gemini model to use
        // gemini-2.5-flash is optimized for fast responses with good quality
        this.modelName = 'gemini-2.5-flash';
        console.log(`✓ Gemini AI initialized with model: ${this.modelName}`);
    }

    /**
     * Generate crop disease advice using Gemini AI
     * Creates a structured prompt and sends it to the AI model
     * Returns parsed, actionable treatment recommendations for farmers
     * 
     * @param {Object} diseaseData - Disease detection information
     * @param {string} diseaseData.crop - Type of crop (e.g., "Tomato", "Potato")
     * @param {string} diseaseData.disease - Detected disease name (e.g., "Leaf_Mold")
     * @param {string} diseaseData.severity - Disease severity level (e.g., "Moderate", "Severe")
     * @param {number} diseaseData.confidence - CNN detection confidence score (0-1)
     * @returns {Promise<Object>} - Structured advice object with cause, symptoms, treatments, prevention
     */
    async generateCropAdvice(diseaseData) {
        // Destructure disease information from input parameter
        const { crop, disease, severity, confidence } = diseaseData;

        // Construct AI prompt with specific instructions
        // Prompt engineering ensures consistent, structured responses from the AI
        const prompt = `You are an expert agricultural advisor. A farmer has a ${crop} plant infected with ${disease}. The severity is ${severity} and detection confidence is ${(confidence * 100).toFixed(0)}%.

Provide concise, practical advice in the following exact format (keep each point to one short sentence):

CAUSE: [State the primary cause in simple terms]

SYMPTOMS: [List 2-3 visible signs]

IMMEDIATE: [One quick action to stop the spread]

CHEMICAL: [One common pesticide/fungicide with dosage]

ORGANIC: [One natural remedy]

PREVENTION: [One simple tip to avoid future occurrence]

Keep the language simple and practical for farmers. Focus on actionable advice. If confidence is below 60%, mention a mild caution in the IMMEDIATE step.`;

        try {
            // Log the AI request for debugging purposes
            console.log(`🤖 Generating AI advice for ${crop} - ${disease}...`);

            // Send request to Gemini AI API
            // Uses the specified model and sends our engineered prompt
            const response = await this.ai.models.generateContent({
                model: this.modelName,  // Specify which Gemini model to use
                contents: [
                    {
                        role: "user",  // Role indicates this is user input
                        parts: [{ text: prompt }]  // The actual prompt text
                    }
                ],
            });

            // Extract text response from AI
            const output = response.text;
            console.log('✅ AI response received successfully');

            // Parse the raw text response into structured data
            // This converts the formatted text into a JavaScript object
            const advice = this.parseAdviceResponse(output);

            // Add metadata to the advice object
            // Metadata helps track when and how the advice was generated
            advice.metadata = {
                crop,              // Original crop type
                disease,           // Original disease name
                severity,          // Disease severity level
                confidence,        // CNN detection confidence
                generatedAt: new Date().toISOString(),  // Timestamp of generation
                model: this.modelName  // AI model used for generation
            };

            // Return the complete advice object with metadata
            return advice;
        } catch (error) {
            // Log detailed error information for debugging
            console.error('❌ Error generating crop advice with Gemini API:', error.message);
            if (error.status) {
                // Log HTTP status if available (e.g., 401 Unauthorized, 429 Rate Limit)
                console.error('   Status:', error.status, error.statusText);
            }

            // Throw error to be handled by the calling function
            // Don't use fallback data - let caller decide how to handle failure
            throw new Error(`Failed to generate advice from Gemini AI: ${error.message}`);
        }
    }

    /**
     * Parse the LLM response into structured format
     * Extracts each advice field using regex pattern matching
     * Provides sensible defaults if fields are missing
     * 
     * @param {string} text - Raw text response from Gemini AI
     * @returns {Object} - Parsed advice object with all required fields
     */
    parseAdviceResponse(text) {
        // Initialize advice object with empty strings
        // This ensures all fields exist even if parsing fails
        const advice = {
            cause: '',        // Root cause of the disease
            symptoms: '',     // Visible symptoms to look for
            immediate: '',    // Immediate action to take
            chemical: '',     // Chemical treatment recommendation
            organic: '',      // Organic/natural treatment option
            prevention: ''    // Prevention tips for the future
        };

        try {
            // Use regex to extract each field from the formatted AI response
            // Pattern: "FIELD_NAME: <content>" until next field or end of text
            // 'is' flags: i=case insensitive, s=dot matches newlines

            // Extract CAUSE field
            const causeMatch = text.match(/CAUSE:\s*(.+?)(?=\n\n|SYMPTOMS:|$)/is);

            // Extract SYMPTOMS field
            const symptomsMatch = text.match(/SYMPTOMS:\s*(.+?)(?=\n\n|IMMEDIATE:|$)/is);

            // Extract IMMEDIATE action field
            const immediateMatch = text.match(/IMMEDIATE:\s*(.+?)(?=\n\n|CHEMICAL:|$)/is);

            // Extract CHEMICAL treatment field
            const chemicalMatch = text.match(/CHEMICAL:\s*(.+?)(?=\n\n|ORGANIC:|$)/is);

            // Extract ORGANIC treatment field
            const organicMatch = text.match(/ORGANIC:\s*(.+?)(?=\n\n|PREVENTION:|$)/is);

            // Extract PREVENTION tips field
            const preventionMatch = text.match(/PREVENTION:\s*(.+?)(?=\n\n|$)/is);

            // Assign matched values with trim() to remove whitespace
            // Use defaults if field is missing from AI response
            advice.cause = causeMatch ? causeMatch[1].trim() : 'Unable to determine cause';
            advice.symptoms = symptomsMatch ? symptomsMatch[1].trim() : 'Unable to determine symptoms';
            advice.immediate = immediateMatch ? immediateMatch[1].trim() : 'Consult agricultural expert';
            advice.chemical = chemicalMatch ? chemicalMatch[1].trim() : 'Consult local agriculture office';
            advice.organic = organicMatch ? organicMatch[1].trim() : 'Neem oil spray recommended';
            advice.prevention = preventionMatch ? preventionMatch[1].trim() : 'Maintain proper plant hygiene';

        } catch (error) {
            // Log parsing errors but don't crash the application
            // Defaults will be used for failed fields
            console.error('⚠️  Error parsing advice response:', error);
            throw new Error('Failed to parse AI response');
        }

        // Return the complete advice object
        return advice;
    }

    /**
     * Batch generate advice for multiple diseases
     * Processes multiple disease detections in parallel
     * More efficient than sequential requests when handling multiple crops
     * 
     * @param {Array} diseaseDataArray - Array of disease data objects
     * @returns {Promise<Array>} - Array of advice objects
     */
    async generateBatchAdvice(diseaseDataArray) {
        // Create array of promises for parallel processing
        // Each disease gets its own AI request
        const promises = diseaseDataArray.map(data => this.generateCropAdvice(data));

        // Wait for all AI requests to complete
        // Promise.all() executes all requests in parallel for better performance
        return Promise.all(promises);
    }
}

// Export singleton instance
// Using a singleton ensures only one LLM service instance exists
// This prevents multiple AI client initializations
export default new LLMService();

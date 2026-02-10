// Service for integrating Google Gemini AI to generate crop disease advice
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { getHardcodedAdvice, simulateNetworkDelay } from "../data/hardcodedAdvice.js";

dotenv.config();

class LLMService {
    constructor() {
        // Initialize Gemini AI client with API key from environment
        const apiKey = process.env.GEMINI_API_KEY || '';
        if (!apiKey) {
            console.warn('⚠️  Warning: GEMINI_API_KEY not found in environment variables');
        } else {
            console.log('✓ Gemini API Key loaded');
        }

        this.ai = new GoogleGenAI(apiKey);
        this.modelName = 'gemini-2.5-flash';
        console.log(`✓ Gemini AI initialized with model: ${this.modelName}`);
    }

    /**
     * Language code to full name mapping
     * Maps ISO language codes to their full names for clear Gemini instructions
     */
    getLanguageName(code) {
        const languageMap = {
            'en': 'English',
            'hi': 'Hindi',
            'ta': 'Tamil',
            'te': 'Telugu',
            'kn': 'Kannada',
            'bn': 'Bengali',
            'mr': 'Marathi',
            'gu': 'Gujarati',
            'pa': 'Punjabi',
            'ml': 'Malayalam',
            'or': 'Odia',
            'as': 'Assamese',
            'ur': 'Urdu',
            'ne': 'Nepali',
            'sa': 'Sanskrit'
        };
        return languageMap[code];
    }

    /**
     * Generate comprehensive crop disease advice using Gemini AI
     * Creates a detailed prompt and sends to Gemini to get treatment recommendations
     * @param {Object} diseaseData - { crop, disease, severity, confidence, language }
     * @returns {Promise<Object>} - Structured advice object
     */
    async generateCropAdvice(diseaseData) {
        const { crop, disease, severity, confidence, language } = diseaseData;

        // Get full language name for clear prompt instruction
        const languageName = this.getLanguageName(language);

        console.log(`🌐 Requested Language: ${languageName} (${language})`);

        // For all languages except English, use hardcoded data
        if (language && language !== 'en') {
            console.log(`📚 Using hardcoded data for ${languageName}`);
            console.log(`⏳ Simulating network delay (3-4 seconds)...`);

            // Simulate network delay of 3-4 seconds
            await simulateNetworkDelay();

            // Get hardcoded advice
            const hardcodedData = getHardcodedAdvice(language, crop, disease);

            console.log('✅ Hardcoded data retrieved successfully');
            console.log('📝 Hardcoded Response:');
            console.log('─'.repeat(80));
            console.log(JSON.stringify(hardcodedData, null, 2));
            console.log('─'.repeat(80));

            // Add metadata and return
            const advice = {
                ...hardcodedData,
                metadata: {
                    crop,
                    disease,
                    severity,
                    confidence,
                    generatedAt: new Date().toISOString(),
                    model: 'hardcoded-data',
                    language: languageName
                }
            };

            return advice;
        }

        // For English, use Gemini AI
        console.log('🤖 Using Gemini AI for English');

        // Create structured prompt for AI to generate farmer-friendly advice
        // IMPORTANT: Instruct AI to respond in the specified language
        const prompt = `You are an expert agricultural advisor. A farmer has a ${crop} plant infected with ${disease}. The severity is ${severity} and detection confidence is ${(confidence * 100).toFixed(0)}%.

**IMPORTANT: Provide your ENTIRE response in ${languageName} language. All advice, explanations, and recommendations must be in ${languageName}.**

Provide concise, practical advice in the following exact format (keep each point to one short sentence):

CAUSE: [State the primary cause in simple terms in ${languageName}]

SYMPTOMS: [List 2-3 visible signs in ${languageName}]

IMMEDIATE: [One quick action to stop the spread in ${languageName}]

CHEMICAL: [One common pesticide/fungicide with dosage in ${languageName}]

ORGANIC: [One natural remedy in ${languageName}]

PREVENTION: [One simple tip to avoid future occurrence in ${languageName}]

Keep the language simple and practical for farmers. Focus on actionable advice. If confidence is below 60%, mention a mild caution in the IMMEDIATE step. Remember: Write everything in ${languageName}.`;

        try {
            console.log(`🤖 Generating AI advice for ${crop} - ${disease}...`);

            // Call Gemini API to generate advice
            const response = await this.ai.models.generateContent({
                model: this.modelName,
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }]
                    }
                ],
            });

            const output = response.text;
            console.log('✅ AI response received successfully');
            console.log('📝 LLM Response:');
            console.log('─'.repeat(80));
            console.log(output);
            console.log('─'.repeat(80));

            // Parse the AI response into structured format
            const advice = this.parseAdviceResponse(output);

            // Add metadata for tracking and display
            advice.metadata = {
                crop,
                disease,
                severity,
                confidence,
                generatedAt: new Date().toISOString(),
                // source: 'gemini-ai',
                model: this.modelName
            };

            return advice;
        } catch (error) {
            console.error('❌ Error generating crop advice with Gemini API:', error.message);
            if (error.status) {
                console.error('   Status:', error.status, error.statusText);
            }

            // Throw error to be handled by the API route
            throw new Error(`Failed to generate advice from Gemini AI: ${error.message}`);
        }
    }

    /**
     * Parse the LLM response into structured format
     * Extracts specific sections like CAUSE, SYMPTOMS, etc. using regex
     * @param {string} text - Raw LLM response
     * @returns {Object} - Parsed advice object
     */
    parseAdviceResponse(text) {
        const advice = {
            cause: '',
            symptoms: '',
            immediate: '',
            chemical: '',
            organic: '',
            prevention: ''
        };

        try {
            // Extract each field using regex pattern matching
            const causeMatch = text.match(/CAUSE:\s*(.+?)(?=\n\n|SYMPTOMS:|$)/is);
            const symptomsMatch = text.match(/SYMPTOMS:\s*(.+?)(?=\n\n|IMMEDIATE:|$)/is);
            const immediateMatch = text.match(/IMMEDIATE:\s*(.+?)(?=\n\n|CHEMICAL:|$)/is);
            const chemicalMatch = text.match(/CHEMICAL:\s*(.+?)(?=\n\n|ORGANIC:|$)/is);
            const organicMatch = text.match(/ORGANIC:\s*(.+?)(?=\n\n|PREVENTION:|$)/is);
            const preventionMatch = text.match(/PREVENTION:\s*(.+?)(?=\n\n|$)/is);

            // Extract matched text or use fallback
            advice.cause = causeMatch ? causeMatch[1].trim() : 'Unable to determine cause';
            advice.symptoms = symptomsMatch ? symptomsMatch[1].trim() : 'Unable to determine symptoms';
            advice.immediate = immediateMatch ? immediateMatch[1].trim() : 'Consult agricultural expert';
            advice.chemical = chemicalMatch ? chemicalMatch[1].trim() : 'Consult local agriculture office';
            advice.organic = organicMatch ? organicMatch[1].trim() : 'Neem oil spray recommended';
            advice.prevention = preventionMatch ? preventionMatch[1].trim() : 'Maintain proper plant hygiene';

        } catch (error) {
            console.error('⚠️  Error parsing advice response:', error);
            throw new Error('Failed to parse AI response');
        }

        return advice;
    }

    /**
     * Batch generate advice for multiple diseases
     * @param {Array} diseaseDataArray
     * @returns {Promise<Array>}
     */
    async generateBatchAdvice(diseaseDataArray) {
        const promises = diseaseDataArray.map(data => this.generateCropAdvice(data));
        return Promise.all(promises);
    }
}

// Export singleton instance
export default new LLMService();

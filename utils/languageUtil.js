/**
 * Language mappings for multilingual support
 */

// Map of language codes to their full names for Gemini AI
export const LANGUAGE_NAMES = {
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

/**
 * Get the full language name from language code
 * @param {string} langCode - Language code (e.g., 'hi', 'ta')
 * @returns {string} - Full language name or 'English' as default
 */
export function getLanguageName(langCode) {
    return LANGUAGE_NAMES[langCode] || 'English';
}

/**
 * Check if a language code is supported
 * @param {string} langCode - Language code to check
 * @returns {boolean} - True if supported
 */
export function isLanguageSupported(langCode) {
    return langCode in LANGUAGE_NAMES;
}

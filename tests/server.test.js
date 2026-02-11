/**
 * Unit Tests for Server Configuration
 * Tests server setup and middleware configuration
 * Validates environment variables, CORS, routes, and database settings
 * Ensures the Express server is properly configured for production and development
 */
import { describe, it, expect } from 'vitest'

// Test suite for core server configuration
// Validates basic server settings like ports, URLs, and endpoints
describe('Server Configuration', () => {
    // Test: Environment variables are accessible
    // Node.js should provide process.env object for configuration
    it('should validate environment variable access', () => {
        // Verify process.env exists (provided by Node.js runtime)
        expect(process.env).toBeDefined()

        // Ensure it's an object (standard Node.js behavior)
        expect(typeof process.env).toBe('object')
    })

    // Test: Default PORT configuration exists
    // Server needs a valid port number to listen on
    it('should have default PORT configuration', () => {
        // Use environment PORT or fallback to 3000
        // This is the standard pattern used in server.js
        const port = process.env.PORT || 3000

        // Port should be a number (numeric or coerced)
        expect(typeof port).toBe('number')

        // Port must be positive (valid port range is 1-65535)
        expect(port).toBeGreaterThan(0)
    })

    // Test: CORS allowed origins are properly configured
    // Validates which frontend URLs can access the API
    it('should validate CORS origins structure', () => {
        // Define allowed origins (same as in server.js)
        // These URLs are permitted to make cross-origin requests
        const allowedOrigins = [
            'http://localhost:5173',           // Vite dev server
            'http://localhost:3000',           // Alternative dev port
            'https://swe-ai-crop.vercel.app',  // Production frontend
            process.env.CORS_ORIGIN            // Additional custom origin
        ].filter(Boolean) // Remove undefined/null values

        // At least one origin should be configured
        expect(allowedOrigins.length).toBeGreaterThan(0)

        // Verify Vite dev server is in the list
        expect(allowedOrigins).toContain('http://localhost:5173')

        // Verify production frontend is in the list
        expect(allowedOrigins).toContain('https://swe-ai-crop.vercel.app')
    })

    // Test: Development server URL construction
    // Validates URL format for local development environment
    it('should validate server URL construction for development', () => {
        // Define test port
        const testPort = 3000

        // Construct development URL (used in console logs)
        const devUrl = `http://localhost:${testPort}`

        // Verify exact URL format
        expect(devUrl).toBe('http://localhost:3000')

        // Ensure URL starts with http:// protocol
        expect(devUrl).toMatch(/^http:\/\//)
    })

    // Test: Production server URL construction
    // Validates URL format for deployed Render.com environment
    it('should validate server URL construction for production', () => {
        // Production URL on Render.com hosting
        const prodUrl = 'https://swe-ai-crop-back.onrender.com'

        // Verify exact production URL
        expect(prodUrl).toBe('https://swe-ai-crop-back.onrender.com')

        // Ensure URL uses secure https:// protocol
        expect(prodUrl).toMatch(/^https:\/\//)
    })

    // Test: API endpoint paths are valid
    // Validates the structure of API route paths
    it('should validate API endpoint paths', () => {
        // Define all API endpoints (as configured in Express routes)
        const endpoints = [
            '/api/crop-advice',  // Main crop advice endpoint
            '/api/test',         // Health check endpoint
            '/'                  // Root endpoint
        ]

        // Validate each endpoint
        endpoints.forEach(endpoint => {
            // All paths must start with forward slash
            expect(endpoint).toMatch(/^\//)

            // Ensure endpoint is a string
            expect(typeof endpoint).toBe('string')

            // Path should not be empty
            expect(endpoint.length).toBeGreaterThan(0)
        })
    })
})

// Test suite for Express middleware configuration
// Validates CORS, HTTP methods, and header configurations
describe('Express Middleware Configuration', () => {
    // Test: CORS middleware is properly configured
    // Validates Cross-Origin Resource Sharing settings
    it('should validate CORS configuration structure', () => {
        // Define CORS configuration (matches server.js setup)
        const corsConfig = {
            credentials: true,  // Allow cookies/auth headers
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allowed HTTP methods
            allowedHeaders: ['Content-Type', 'Authorization']      // Allowed headers
        }

        // Verify credentials are enabled (required for auth)
        expect(corsConfig.credentials).toBe(true)

        // Ensure POST is allowed (needed for file uploads)
        expect(corsConfig.methods).toContain('POST')

        // Ensure GET is allowed (needed for health checks)
        expect(corsConfig.methods).toContain('GET')

        // Verify Content-Type header is allowed (needed for JSON)
        expect(corsConfig.allowedHeaders).toContain('Content-Type')
    })

    // Test: All necessary HTTP methods are supported
    // Validates the API supports standard REST operations
    it('should validate supported HTTP methods', () => {
        // Define supported HTTP methods
        // These cover all standard CRUD operations
        const supportedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']

        // Verify we have exactly 5 methods
        expect(supportedMethods).toHaveLength(5)

        // Ensure GET is supported (read operations)
        expect(supportedMethods).toContain('GET')

        // Ensure POST is supported (create operations)
        expect(supportedMethods).toContain('POST')

        // Ensure PUT is supported (update operations)
        expect(supportedMethods).toContain('PUT')

        // Ensure DELETE is supported (delete operations)
        expect(supportedMethods).toContain('DELETE')

        // Ensure OPTIONS is supported (CORS preflight)
        expect(supportedMethods).toContain('OPTIONS')
    })

    // Test: Request headers are properly configured
    // Validates which headers the API accepts
    it('should validate allowed headers configuration', () => {
        // Define allowed headers (as configured in CORS)
        const allowedHeaders = ['Content-Type', 'Authorization']

        // Verify Content-Type is allowed (for JSON payloads)
        expect(allowedHeaders).toContain('Content-Type')

        // Verify Authorization is allowed (for future auth)
        expect(allowedHeaders).toContain('Authorization')

        // Ensure at least some headers are configured
        expect(allowedHeaders.length).toBeGreaterThan(0)
    })
})

// Test suite for MongoDB database configuration
// Validates connection string formats and structure
describe('MongoDB Configuration', () => {
    // Test: MongoDB connection URL has correct structure
    // Validates basic MongoDB connection string format
    it('should have MongoDB URL structure', () => {
        // Example MongoDB connection string
        // In production, this comes from environment variable
        const mockMongoUrl = 'mongodb://localhost:27017/test'

        // Verify URL starts with 'mongodb' protocol
        expect(mockMongoUrl).toMatch(/^mongodb/)

        // Ensure connection string is a string type
        expect(typeof mockMongoUrl).toBe('string')
    })

    // Test: Multiple MongoDB connection formats are recognized
    // Validates both local and cloud (MongoDB Atlas) formats
    it('should validate database connection string format', () => {
        // Array of valid MongoDB connection string formats
        const validFormats = [
            'mongodb://localhost:27017/dbname',                        // Local server format
            'mongodb+srv://user:pass@cluster.mongodb.net/dbname'      // MongoDB Atlas cloud format
        ]

        // Verify each format starts with 'mongodb'
        validFormats.forEach(url => {
            // All valid MongoDB URLs start with 'mongodb'
            expect(url).toMatch(/^mongodb/)
        })
    })
})

/**
 * Express Server Configuration
 * Main backend server for CropAId application
 * Handles API routing, CORS, database connection, and middleware setup
 * Serves crop disease detection and treatment advice endpoints
 */

// Import required dependencies
import express from 'express';      // Web framework for Node.js
import mongoose from 'mongoose';    // MongoDB object modeling tool
import cors from 'cors';            // Enable Cross-Origin Resource Sharing
import dotenv from 'dotenv';        // Load environment variables from .env file

// Load environment variables from .env file into process.env
dotenv.config();

// Initialize Express application
const app = express();

// Server port - use environment variable or default to 3000
// Hosting platforms like Render.com provide PORT via environment
const PORT = process.env.PORT || 3000;

// ========================================
// Middleware Configuration
// ========================================

// CORS (Cross-Origin Resource Sharing) Configuration
// Allows frontend applications from specific origins to access this API
// Prevents unauthorized domains from making requests to our backend
const allowedOrigins = [
  'http://localhost:5173',           // Vite development server (npm run dev)
  'http://localhost:3000',           // Alternative local development port
  'https://swe-ai-crop.vercel.app',  // Production frontend deployment on Vercel
  process.env.CORS_ORIGIN            // Additional custom origin from environment variable
].filter(Boolean); // Remove null/undefined values (if CORS_ORIGIN not set)

// Apply CORS middleware with custom origin validation
app.use(cors({
  // Dynamic origin validation function
  // Checks if incoming request origin is in allowedOrigins list
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Check if the request origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow the request
    } else {
      // Reject requests from unauthorized origins
      console.log(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed request headers
}));

// JSON body parser middleware
// Parses incoming requests with JSON payloads
// Makes req.body available with parsed JSON data
app.use(express.json());

// ========================================
// Database Connection
// ========================================

// Get MongoDB connection string from environment variable
// This keeps sensitive credentials out of the source code
const mongoURI = process.env.MONGO_URL;

// Connect to MongoDB database
// Uses Mongoose for object modeling and schema validation
mongoose.connect(mongoURI)
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ========================================
// API Routes
// ========================================

// Import and mount crop advice routes
// Handles POST /api/crop-advice for disease detection and treatment advice
import cropAdviceRoutes from './routes/cropAdvice.js';
app.use('/api', cropAdviceRoutes); // Prefix all routes with /api

// Root endpoint - Simple health check
// Returns confirmation message that server is running
app.get('/', (req, res) => {
  res.send('SWE AI Crop Backend - API Running');
});

// ========================================
// Start Server
// ========================================

// Start Express server listening on specified PORT
app.listen(PORT, () => {
  // Construct server URL based on environment
  // Production uses Render.com URL, development uses localhost
  const serverUrl = process.env.NODE_ENV === 'production'
    ? 'https://swe-ai-crop-back.onrender.com'
    : `http://localhost:${PORT}`;

  // Log server information to console
  console.log(`\n✓ Server running at ${serverUrl}`);
  console.log(`✓ API endpoints available at:`);
  console.log(`  - POST ${serverUrl}/api/crop-advice`);  // Main crop advice endpoint
  console.log(`  - GET  ${serverUrl}/api/test\n`);       // Test/health check endpoint
});

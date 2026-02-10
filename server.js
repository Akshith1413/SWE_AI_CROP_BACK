// Backend server for CropAId - handles LLM crop advice generation
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware - allows frontend to communicate with backend
const allowedOrigins = [
  'http://localhost:5173',           // Local development
  'http://localhost:3000',           // Alternative local port
  'https://swe-ai-crop.vercel.app',  // Production Vercel deployment
  process.env.CORS_ORIGIN            // Additional origin from env if specified
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Connect to MongoDB database
const mongoURI = process.env.MONGO_URL;

mongoose.connect(mongoURI)
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Mount API routes
import cropAdviceRoutes from './routes/cropAdvice.js';
app.use('/api', cropAdviceRoutes);

// Root endpoint for health check
app.get('/', (req, res) => {
  res.send('SWE AI Crop Backend - API Running');
});

// Start the server and log available endpoints
app.listen(PORT, () => {
  const serverUrl = process.env.NODE_ENV === 'production'
    ? 'https://swe-ai-crop-back.onrender.com'
    : `http://localhost:${PORT}`;

  console.log(`\n✓ Server running at ${serverUrl}`);
  console.log(`✓ API endpoints available at:`);
  console.log(` - POST ${serverUrl}/api/crop-advice`);
  console.log(`  - GET  ${serverUrl}/api/test\n`);
});

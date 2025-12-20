const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // load .env

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Use env variable for MongoDB connection
const mongoURI = process.env.MONGO_URL;

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('hi');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

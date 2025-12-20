// server.js
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Correct connection (no extra options needed in Mongoose 6+)
mongoose.connect('mongodb://127.0.0.1:27017/testdb')
  .then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.error(' MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.send('hi');
});

app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});

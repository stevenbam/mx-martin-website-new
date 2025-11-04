const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import routes
const songsRoutes = require('./routes/songs');
const lyricsRoutes = require('./routes/lyrics');
const photosRoutes = require('./routes/photos');
const videosRoutes = require('./routes/videos');

// Use routes
app.use('/api/songs', songsRoutes);
app.use('/api/lyrics', lyricsRoutes);
app.use('/api/photos', photosRoutes);
app.use('/api/videos', videosRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

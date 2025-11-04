import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import songsRoutes from './routes/songs';
import lyricsRoutes from './routes/lyrics';
import photosRoutes from './routes/photos';
import videosRoutes from './routes/videos';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import database connection to ensure it's initialized
import './db';

// Use routes
app.use('/api/songs', songsRoutes);
app.use('/api/lyrics', lyricsRoutes);
app.use('/api/photos', photosRoutes);
app.use('/api/videos', videosRoutes);

// Test route
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'API is working!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

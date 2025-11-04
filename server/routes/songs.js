const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/songs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// GET all songs
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM songs ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// GET single song
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM songs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ error: 'Failed to fetch song' });
  }
});

// POST new song
router.post('/', async (req, res) => {
  try {
    const { title, file_path } = req.body;
    const [result] = await db.query(
      'INSERT INTO songs (title, file_path) VALUES (?, ?)',
      [title, file_path]
    );
    res.status(201).json({ id: result.insertId, title, file_path });
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ error: 'Failed to create song' });
  }
});

// PUT update song
router.put('/:id', async (req, res) => {
  try {
    const { title, file_path } = req.body;
    await db.query(
      'UPDATE songs SET title = ?, file_path = ? WHERE id = ?',
      [title, file_path, req.params.id]
    );
    res.json({ id: req.params.id, title, file_path });
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// POST upload song file
router.post('/upload', upload.single('song'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Store the file path relative to uploads directory
    const file_path = `/uploads/songs/${req.file.filename}`;

    const [result] = await db.query(
      'INSERT INTO songs (title, file_path) VALUES (?, ?)',
      [title, file_path]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      file_path,
      message: 'Song uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading song:', error);
    res.status(500).json({ error: 'Failed to upload song' });
  }
});

// DELETE song
router.delete('/:id', async (req, res) => {
  try {
    // Get song info to delete file
    const [rows] = await db.query('SELECT file_path FROM songs WHERE id = ?', [req.params.id]);

    if (rows.length > 0) {
      const filePath = path.join(__dirname, '../../', rows[0].file_path);
      // Delete file if it exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.query('DELETE FROM songs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

module.exports = router;

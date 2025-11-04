const express = require('express');
const router = express.Router();
const db = require('../db');

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

// DELETE song
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM songs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

module.exports = router;

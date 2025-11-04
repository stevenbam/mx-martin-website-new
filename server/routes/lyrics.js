const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all lyrics
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM lyrics ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
});

// GET single lyric
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM lyrics WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Lyrics not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
});

// POST new lyrics
router.post('/', async (req, res) => {
  try {
    const { title, lyrics } = req.body;
    const [result] = await db.query(
      'INSERT INTO lyrics (title, lyrics) VALUES (?, ?)',
      [title, lyrics]
    );
    res.status(201).json({ id: result.insertId, title, lyrics });
  } catch (error) {
    console.error('Error creating lyrics:', error);
    res.status(500).json({ error: 'Failed to create lyrics' });
  }
});

// PUT update lyrics
router.put('/:id', async (req, res) => {
  try {
    const { title, lyrics } = req.body;
    await db.query(
      'UPDATE lyrics SET title = ?, lyrics = ? WHERE id = ?',
      [title, lyrics, req.params.id]
    );
    res.json({ id: req.params.id, title, lyrics });
  } catch (error) {
    console.error('Error updating lyrics:', error);
    res.status(500).json({ error: 'Failed to update lyrics' });
  }
});

// DELETE lyrics
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM lyrics WHERE id = ?', [req.params.id]);
    res.json({ message: 'Lyrics deleted successfully' });
  } catch (error) {
    console.error('Error deleting lyrics:', error);
    res.status(500).json({ error: 'Failed to delete lyrics' });
  }
});

module.exports = router;

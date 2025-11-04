const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all videos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM videos ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// GET single video
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM videos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// POST new video
router.post('/', async (req, res) => {
  try {
    const { title, url, isEmbed } = req.body;
    const [result] = await db.query(
      'INSERT INTO videos (title, url, is_embed) VALUES (?, ?, ?)',
      [title, url, isEmbed || false]
    );
    res.status(201).json({ id: result.insertId, title, url, isEmbed });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ error: 'Failed to create video' });
  }
});

// PUT update video
router.put('/:id', async (req, res) => {
  try {
    const { title, url, isEmbed } = req.body;
    await db.query(
      'UPDATE videos SET title = ?, url = ?, is_embed = ? WHERE id = ?',
      [title, url, isEmbed, req.params.id]
    );
    res.json({ id: req.params.id, title, url, isEmbed });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// DELETE video
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM videos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

module.exports = router;

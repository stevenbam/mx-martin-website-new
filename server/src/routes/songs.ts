import express, { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../db';
import { Song, CreateSongRequest, UpdateSongRequest } from '../types/models';

const router = express.Router();

// GET all songs
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM songs ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// GET single song
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM songs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ error: 'Failed to fetch song' });
  }
});

// POST new song
router.post('/', async (req: Request<{}, {}, CreateSongRequest>, res: Response): Promise<void> => {
  try {
    const { title, file_path } = req.body;
    const [result] = await db.query<ResultSetHeader>(
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
router.put('/:id', async (req: Request<{ id: string }, {}, UpdateSongRequest>, res: Response): Promise<void> => {
  try {
    const { title, file_path } = req.body;
    await db.query<ResultSetHeader>(
      'UPDATE songs SET title = ?, file_path = ? WHERE id = ?',
      [title, file_path, req.params.id]
    );
    res.json({ id: parseInt(req.params.id), title, file_path });
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// DELETE song
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await db.query<ResultSetHeader>('DELETE FROM songs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

export default router;

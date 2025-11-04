import express, { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../db';
import { Lyric, CreateLyricRequest, UpdateLyricRequest } from '../types/models';

const router = express.Router();

// GET all lyrics
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM lyrics ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
});

// GET single lyric
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM lyrics WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Lyrics not found' });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
});

// POST new lyrics
router.post('/', async (req: Request<{}, {}, CreateLyricRequest>, res: Response): Promise<void> => {
  try {
    const { title, lyrics } = req.body;
    const [result] = await db.query<ResultSetHeader>(
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
router.put('/:id', async (req: Request<{ id: string }, {}, UpdateLyricRequest>, res: Response): Promise<void> => {
  try {
    const { title, lyrics } = req.body;
    await db.query<ResultSetHeader>(
      'UPDATE lyrics SET title = ?, lyrics = ? WHERE id = ?',
      [title, lyrics, req.params.id]
    );
    res.json({ id: parseInt(req.params.id), title, lyrics });
  } catch (error) {
    console.error('Error updating lyrics:', error);
    res.status(500).json({ error: 'Failed to update lyrics' });
  }
});

// DELETE lyrics
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await db.query<ResultSetHeader>('DELETE FROM lyrics WHERE id = ?', [req.params.id]);
    res.json({ message: 'Lyrics deleted successfully' });
  } catch (error) {
    console.error('Error deleting lyrics:', error);
    res.status(500).json({ error: 'Failed to delete lyrics' });
  }
});

export default router;

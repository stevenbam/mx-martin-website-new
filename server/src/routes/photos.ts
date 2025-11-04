import express, { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../db';
import { Photo, CreatePhotoRequest, UpdatePhotoRequest } from '../types/models';

const router = express.Router();

// GET all photos
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM photos ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// GET single photo
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM photos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

// POST new photo
router.post('/', async (req: Request<{}, {}, CreatePhotoRequest>, res: Response): Promise<void> => {
  try {
    const { url, caption } = req.body;
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO photos (url, caption) VALUES (?, ?)',
      [url, caption]
    );
    res.status(201).json({ id: result.insertId, url, caption });
  } catch (error) {
    console.error('Error creating photo:', error);
    res.status(500).json({ error: 'Failed to create photo' });
  }
});

// PUT update photo
router.put('/:id', async (req: Request<{ id: string }, {}, UpdatePhotoRequest>, res: Response): Promise<void> => {
  try {
    const { url, caption } = req.body;
    await db.query<ResultSetHeader>(
      'UPDATE photos SET url = ?, caption = ? WHERE id = ?',
      [url, caption, req.params.id]
    );
    res.json({ id: parseInt(req.params.id), url, caption });
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

// DELETE photo
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await db.query<ResultSetHeader>('DELETE FROM photos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

export default router;

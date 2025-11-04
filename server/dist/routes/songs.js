"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const router = express_1.default.Router();
// GET all songs
router.get('/', async (req, res) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM songs ORDER BY id DESC');
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching songs:', error);
        res.status(500).json({ error: 'Failed to fetch songs' });
    }
});
// GET single song
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM songs WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Song not found' });
            return;
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error('Error fetching song:', error);
        res.status(500).json({ error: 'Failed to fetch song' });
    }
});
// POST new song
router.post('/', async (req, res) => {
    try {
        const { title, file_path } = req.body;
        const [result] = await db_1.default.query('INSERT INTO songs (title, file_path) VALUES (?, ?)', [title, file_path]);
        res.status(201).json({ id: result.insertId, title, file_path });
    }
    catch (error) {
        console.error('Error creating song:', error);
        res.status(500).json({ error: 'Failed to create song' });
    }
});
// PUT update song
router.put('/:id', async (req, res) => {
    try {
        const { title, file_path } = req.body;
        await db_1.default.query('UPDATE songs SET title = ?, file_path = ? WHERE id = ?', [title, file_path, req.params.id]);
        res.json({ id: parseInt(req.params.id), title, file_path });
    }
    catch (error) {
        console.error('Error updating song:', error);
        res.status(500).json({ error: 'Failed to update song' });
    }
});
// DELETE song
router.delete('/:id', async (req, res) => {
    try {
        await db_1.default.query('DELETE FROM songs WHERE id = ?', [req.params.id]);
        res.json({ message: 'Song deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting song:', error);
        res.status(500).json({ error: 'Failed to delete song' });
    }
});
exports.default = router;

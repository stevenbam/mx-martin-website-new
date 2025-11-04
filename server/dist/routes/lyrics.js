"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const router = express_1.default.Router();
// GET all lyrics
router.get('/', async (req, res) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM lyrics ORDER BY id DESC');
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching lyrics:', error);
        res.status(500).json({ error: 'Failed to fetch lyrics' });
    }
});
// GET single lyric
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM lyrics WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Lyrics not found' });
            return;
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error('Error fetching lyrics:', error);
        res.status(500).json({ error: 'Failed to fetch lyrics' });
    }
});
// POST new lyrics
router.post('/', async (req, res) => {
    try {
        const { title, lyrics } = req.body;
        const [result] = await db_1.default.query('INSERT INTO lyrics (title, lyrics) VALUES (?, ?)', [title, lyrics]);
        res.status(201).json({ id: result.insertId, title, lyrics });
    }
    catch (error) {
        console.error('Error creating lyrics:', error);
        res.status(500).json({ error: 'Failed to create lyrics' });
    }
});
// PUT update lyrics
router.put('/:id', async (req, res) => {
    try {
        const { title, lyrics } = req.body;
        await db_1.default.query('UPDATE lyrics SET title = ?, lyrics = ? WHERE id = ?', [title, lyrics, req.params.id]);
        res.json({ id: parseInt(req.params.id), title, lyrics });
    }
    catch (error) {
        console.error('Error updating lyrics:', error);
        res.status(500).json({ error: 'Failed to update lyrics' });
    }
});
// DELETE lyrics
router.delete('/:id', async (req, res) => {
    try {
        await db_1.default.query('DELETE FROM lyrics WHERE id = ?', [req.params.id]);
        res.json({ message: 'Lyrics deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting lyrics:', error);
        res.status(500).json({ error: 'Failed to delete lyrics' });
    }
});
exports.default = router;

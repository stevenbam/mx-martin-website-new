"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const router = express_1.default.Router();
// GET all videos
router.get('/', async (req, res) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM videos ORDER BY id DESC');
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});
// GET single video
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM videos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Video not found' });
            return;
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
});
// POST new video
router.post('/', async (req, res) => {
    try {
        const { title, url, isEmbed } = req.body;
        const [result] = await db_1.default.query('INSERT INTO videos (title, url, is_embed) VALUES (?, ?, ?)', [title, url, isEmbed || false]);
        res.status(201).json({ id: result.insertId, title, url, isEmbed });
    }
    catch (error) {
        console.error('Error creating video:', error);
        res.status(500).json({ error: 'Failed to create video' });
    }
});
// PUT update video
router.put('/:id', async (req, res) => {
    try {
        const { title, url, isEmbed } = req.body;
        await db_1.default.query('UPDATE videos SET title = ?, url = ?, is_embed = ? WHERE id = ?', [title, url, isEmbed, req.params.id]);
        res.json({ id: parseInt(req.params.id), title, url, isEmbed });
    }
    catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ error: 'Failed to update video' });
    }
});
// DELETE video
router.delete('/:id', async (req, res) => {
    try {
        await db_1.default.query('DELETE FROM videos WHERE id = ?', [req.params.id]);
        res.json({ message: 'Video deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});
exports.default = router;

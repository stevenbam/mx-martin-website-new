"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const router = express_1.default.Router();
// GET all photos
router.get('/', async (req, res) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM photos ORDER BY id DESC');
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});
// GET single photo
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM photos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Photo not found' });
            return;
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error('Error fetching photo:', error);
        res.status(500).json({ error: 'Failed to fetch photo' });
    }
});
// POST new photo
router.post('/', async (req, res) => {
    try {
        const { url, caption } = req.body;
        const [result] = await db_1.default.query('INSERT INTO photos (url, caption) VALUES (?, ?)', [url, caption]);
        res.status(201).json({ id: result.insertId, url, caption });
    }
    catch (error) {
        console.error('Error creating photo:', error);
        res.status(500).json({ error: 'Failed to create photo' });
    }
});
// PUT update photo
router.put('/:id', async (req, res) => {
    try {
        const { url, caption } = req.body;
        await db_1.default.query('UPDATE photos SET url = ?, caption = ? WHERE id = ?', [url, caption, req.params.id]);
        res.json({ id: parseInt(req.params.id), url, caption });
    }
    catch (error) {
        console.error('Error updating photo:', error);
        res.status(500).json({ error: 'Failed to update photo' });
    }
});
// DELETE photo
router.delete('/:id', async (req, res) => {
    try {
        await db_1.default.query('DELETE FROM photos WHERE id = ?', [req.params.id]);
        res.json({ message: 'Photo deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});
exports.default = router;

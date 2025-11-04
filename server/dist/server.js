"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const songs_1 = __importDefault(require("./routes/songs"));
const lyrics_1 = __importDefault(require("./routes/lyrics"));
const photos_1 = __importDefault(require("./routes/photos"));
const videos_1 = __importDefault(require("./routes/videos"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Import database connection to ensure it's initialized
require("./db");
// Use routes
app.use('/api/songs', songs_1.default);
app.use('/api/lyrics', lyrics_1.default);
app.use('/api/photos', photos_1.default);
app.use('/api/videos', videos_1.default);
// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

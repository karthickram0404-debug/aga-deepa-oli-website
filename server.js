/* =========================================
   AGA DEEPA OLI — Server
   Node.js + Express + sql.js + Multer
   Serves the website and provides API
   for poems and gallery images.
   ========================================= */

const express = require('express');
const initSqlJs = require('sql.js');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS, existing images)
app.use(express.static(__dirname));

// Serve uploaded images
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// ---- Multer (Image/Video/PDF Upload) ----
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype.startsWith('image/') ||
            file.mimetype.startsWith('video/') ||
            file.mimetype === 'application/pdf'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only image, video, and PDF files are allowed'), false);
        }
    }
});

// ---- Database ----
const DB_PATH = path.join(UPLOADS_DIR, 'agadeepaoli.db');
let db;

function saveDatabase() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

async function initDatabase() {
    const SQL = await initSqlJs();

    // Load existing database or create new one
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
        console.log('📦 Loaded existing database.');
    } else {
        db = new SQL.Database();
        console.log('📦 Created new database.');
    }

    // Create tables
    db.run(`
    CREATE TABLE IF NOT EXISTS poems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'சந்திரசேகர் P',
      date TEXT NOT NULL,
      type TEXT NOT NULL
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      mimetype TEXT NOT NULL DEFAULT 'image/jpeg',
      alt TEXT DEFAULT 'அறக்கட்டளை நிகழ்வு',
      uploaded_at TEXT NOT NULL DEFAULT ''
    )
  `);

    // Schema migration: Add mimetype if it doesn't exist
    try {
        db.run(`ALTER TABLE gallery_images ADD COLUMN mimetype TEXT NOT NULL DEFAULT 'image/jpeg'`);
    } catch(e) { /* Column already exists */ }

    // Seed sample poems if the table is empty
    const result = db.exec('SELECT COUNT(*) as count FROM poems');
    const poemCount = result[0].values[0][0];

    if (poemCount === 0) {
        const samplePoems = [
            {
                title: 'காலை வணக்கம்',
                body: 'விடியலின் ஒளியில்\nபூக்கள் சிரிக்கின்றன\nகாற்றில் நறுமணம்\nமனதில் மகிழ்ச்சி',
                author: 'சந்திரசேகர் P',
                date: '2026-02-20',
                type: 'kavithai'
            },
            {
                title: 'அன்பின் மொழி',
                body: 'அன்பு ஒரு மொழி\nஅது இதயத்தின் பேச்சு\nவார்த்தைகள் இல்லாமல்\nஉணர்வுகள் பேசும்',
                author: 'சந்திரசேகர் P',
                date: '2026-02-19',
                type: 'kavithai'
            },
            {
                title: 'இயற்கையின் அழகு',
                body: 'மலைகளின் உயரம்\nஆறுகளின் ஓட்டம்\nவானவில்லின் வண்ணம்\nஇயற்கையின் கொடை',
                author: 'சந்திரசேகர் P',
                date: '2026-02-18',
                type: 'kavithai'
            },
            {
                title: 'அன்பின் வலிமை',
                body: 'அன்பு என்பது உலகின் மிகப் பெரிய சக்தி. அது மனிதர்களை இணைக்கிறது, குணப்படுத்துகிறது, மற்றும் மாற்றுகிறது. அன்பு இல்லாத வாழ்க்கை பூக்கள் இல்லாத தோட்டம் போன்றது.',
                author: 'சந்திரசேகர் P',
                date: '2026-02-16',
                type: 'katurai'
            }
        ];

        const stmt = db.prepare('INSERT INTO poems (title, body, author, date, type) VALUES (?, ?, ?, ?, ?)');
        for (const p of samplePoems) {
            stmt.run([p.title, p.body, p.author, p.date, p.type]);
        }
        stmt.free();
        saveDatabase();
        console.log('✅ Sample poems seeded into database.');
    }
}

// ---- Helper: query rows as objects ----
function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
}

function queryOne(sql, params = []) {
    const rows = queryAll(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

function runSql(sql, params = []) {
    db.run(sql, params);
    saveDatabase();
}

// ========== POEM API ==========

// GET /api/poems — get all poems (optionally filter by ?type=kavithai|katurai)
app.get('/api/poems', (req, res) => {
    try {
        const { type } = req.query;
        let poems;
        if (type) {
            poems = queryAll('SELECT * FROM poems WHERE type = ? ORDER BY id DESC', [type]);
        } else {
            poems = queryAll('SELECT * FROM poems ORDER BY id DESC');
        }
        res.json(poems);
    } catch (err) {
        console.error('Error fetching poems:', err);
        res.status(500).json({ error: 'Failed to fetch poems' });
    }
});

// POST /api/poems — add new poem
app.post('/api/poems', (req, res) => {
    try {
        const { title, body, author, date, type } = req.body;
        if (!title || !body || !type) {
            return res.status(400).json({ error: 'title, body, and type are required' });
        }
        const poemAuthor = author || 'சந்திரசேகர் P';
        const poemDate = date || new Date().toISOString().split('T')[0];

        db.run('INSERT INTO poems (title, body, author, date, type) VALUES (?, ?, ?, ?, ?)',
            [title, body, poemAuthor, poemDate, type]);
        saveDatabase();

        // Get the last inserted id
        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];

        res.status(201).json({ id, title, body, author: poemAuthor, date: poemDate, type });
    } catch (err) {
        console.error('Error adding poem:', err);
        res.status(500).json({ error: 'Failed to add poem' });
    }
});

// DELETE /api/poems/:id — delete a poem
app.delete('/api/poems/:id', (req, res) => {
    try {
        const { id } = req.params;
        const poem = queryOne('SELECT * FROM poems WHERE id = ?', [Number(id)]);
        if (!poem) {
            return res.status(404).json({ error: 'Poem not found' });
        }
        runSql('DELETE FROM poems WHERE id = ?', [Number(id)]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting poem:', err);
        res.status(500).json({ error: 'Failed to delete poem' });
    }
});

// ========== IMAGE API ==========

// GET /api/images — get all gallery images
app.get('/api/images', (req, res) => {
    try {
        const images = queryAll('SELECT * FROM gallery_images ORDER BY id DESC');
        const imagesWithUrl = images.map(img => ({
            ...img,
            url: `/uploads/${img.filename}`
        }));
        res.json(imagesWithUrl);
    } catch (err) {
        console.error('Error fetching images:', err);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// POST /api/images — upload a gallery file (image/video/pdf)
app.post('/api/images', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        const alt = req.body.alt || 'அறக்கட்டளை பதிவு (Media)';
        const now = new Date().toISOString();
        const mime = req.file.mimetype;

        db.run('INSERT INTO gallery_images (filename, mimetype, alt, uploaded_at) VALUES (?, ?, ?, ?)',
            [req.file.filename, mime, alt, now]);
        saveDatabase();

        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];

        res.status(201).json({
            id,
            filename: req.file.filename,
            mimetype: mime,
            alt,
            url: `/uploads/${req.file.filename}`
        });
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// DELETE /api/images/:id — delete an image
app.delete('/api/images/:id', (req, res) => {
    try {
        const { id } = req.params;
        const image = queryOne('SELECT * FROM gallery_images WHERE id = ?', [Number(id)]);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        // Delete the file from disk
        const filePath = path.join(UPLOADS_DIR, image.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        // Delete from database
        runSql('DELETE FROM gallery_images WHERE id = ?', [Number(id)]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting image:', err);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// ---- Start Server ----
async function start() {
    await initDatabase();

    app.listen(PORT, () => {
        console.log(`\n🪔 AGA DEEPA OLI Server is running!`);
        console.log(`🌐 Open in browser: http://localhost:${PORT}`);
        console.log(`📦 Database: agadeepaoli.db`);
        console.log(`📁 Uploads: ${UPLOADS_DIR}\n`);
    });
}

start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

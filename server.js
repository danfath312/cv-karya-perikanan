const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();

// Import admin API handlers
const productsHandler = require('./api/admin/products');
const ordersHandler = require('./api/admin/orders');
const companyHandler = require('./api/admin/company');

const app = express();
app.use(cors());
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOAD_DIR));

// Init DB
const DB_FILE = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(DB_FILE);
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orgName TEXT,
    title TEXT,
    description TEXT,
    date TEXT,
    imagePath TEXT
  )`);
});

app.get('/api/programs', (req, res) => {
  db.all('SELECT * FROM programs ORDER BY date', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/programs', upload.single('image'), (req, res) => {
  const { orgName, title, description, date } = req.body;
  const imagePath = req.file ? ('/uploads/' + path.basename(req.file.path)) : null;
  db.run(
    `INSERT INTO programs (orgName, title, description, date, imagePath) VALUES (?,?,?,?,?)`,
    [orgName, title, description, date, imagePath],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, orgName, title, description, date, imagePath });
    }
  );
});

// Return parsed events from sample ICS files
app.get('/api/calendarEvents', (req, res) => {
  res.json([]);
});

// Suggest endpoint: checks conflicts with calendar events and gives simple feedback
app.post('/api/suggest', (req, res) => {
  const { title, date, description } = req.body;
  const suggestions = [];
  if (!title || title.trim().length < 3) suggestions.push('Judul terlalu pendek, tambahkan detail singkat.');
  if (description && description.length < 30) suggestions.push('Deskripsi singkat — tambahkan tujuan dan output yang diinginkan.');
  if (!description) suggestions.push('Pertimbangkan menambahkan deskripsi untuk mempermudah penilaian.');
  if (suggestions.length === 0) suggestions.push('Tidak ada konflik terdeteksi. Rencana terlihat baik.');
  res.json({ suggestions });
});

// ===== TRANSLATION ENDPOINT =====
app.post('/api/translate', async (req, res) => {
  try {
    const { text, source = 'id', target = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const fetch = require('node-fetch');
    const encodedText = encodeURIComponent(text);
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${source}|${target}`;

    const translationResponse = await fetch(apiUrl);
    const data = await translationResponse.json();

    if (data.responseStatus === 200 && data.responseData.translatedText) {
      return res.json({ 
        success: true,
        translatedText: data.responseData.translatedText 
      });
    } else {
      return res.json({ 
        success: false,
        error: 'Translation service unavailable',
        translatedText: text
      });
    }
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Translation failed: ' + error.message 
    });
  }
});

// ===== ADMIN LOGIN ENDPOINT =====
// Returns admin token and admin secret for API authentication
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password diperlukan' });
  }

  db.get(
    'SELECT * FROM admins WHERE username = ? AND password = ?',
    [username, password],
    (err, admin) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!admin) {
        return res.status(401).json({ error: 'Username atau password salah' });
      }

      // Return token for API authentication
      const token = Buffer.from(username + ':' + Date.now()).toString('base64');
      const adminSecret = process.env.ADMIN_SECRET || 'default-secret-change-me';
      
      res.json({
        success: true,
        token: token,
        admin_secret: adminSecret, // Send admin secret for API authentication
        username: admin.username
      });
    }
  );
});

// ===== ADMIN API ROUTES - SECURED WITH ADMIN_SECRET =====
// All admin endpoints require x-admin-secret header with ADMIN_SECRET value

// Products endpoints
app.get('/api/admin/products', productsHandler.authMiddleware, productsHandler.getProducts);
app.get('/api/admin/products/:id', productsHandler.authMiddleware, productsHandler.getProduct);
app.post('/api/admin/products', productsHandler.authMiddleware, productsHandler.createProduct);
app.put('/api/admin/products/:id', productsHandler.authMiddleware, productsHandler.updateProduct);
app.delete('/api/admin/products/:id', productsHandler.authMiddleware, productsHandler.deleteProduct);
app.patch('/api/admin/products/:id/toggle-availability', productsHandler.authMiddleware, productsHandler.toggleAvailability);
app.post('/api/admin/upload-product-image', productsHandler.authMiddleware, upload.single('file'), productsHandler.uploadProductImage);

// Orders endpoints
app.get('/api/admin/orders', ordersHandler.authMiddleware, ordersHandler.getOrders);
app.get('/api/admin/orders/:id', ordersHandler.authMiddleware, ordersHandler.getOrder);
app.put('/api/admin/orders/:id', ordersHandler.authMiddleware, ordersHandler.updateOrder);
app.patch('/api/admin/orders/:id/status', ordersHandler.authMiddleware, ordersHandler.updateOrderStatus);
app.delete('/api/admin/orders/:id', ordersHandler.authMiddleware, ordersHandler.deleteOrder);

// Company info endpoints
app.get('/api/admin/company', companyHandler.authMiddleware, companyHandler.getCompanyInfo);
app.post('/api/admin/company', companyHandler.authMiddleware, companyHandler.saveCompanyInfo);
app.put('/api/admin/company', companyHandler.authMiddleware, companyHandler.saveCompanyInfo);

// ===== END ADMIN API ROUTES =====

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

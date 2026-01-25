// =====================================================
// API ROUTES UNTUK ADMIN PANEL
// Tambahkan ke server.js yang sudah ada
// =====================================================

// JANGAN COPY SEMUA, hanya tambahkan routes ini ke server.js yang sudah ada!

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const router = express.Router();
const DB_FILE = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(DB_FILE);

// ===== MULTER CONFIG UNTUK UPLOAD =====
const uploadDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ===== MIDDLEWARE AUTHENTICATION =====
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// ===== LOGIN =====
router.post('/api/admin/login', (req, res) => {
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
            
            // Return token (simplified, gunakan JWT di production)
            const token = Buffer.from(username).toString('base64');
            res.json({ 
                success: true, 
                token: token,
                username: admin.username
            });
        }
    );
});

// ===== PRODUK - GET ALL =====
router.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products ORDER BY name', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ===== PRODUK - GET BY ID =====
router.get('/api/products/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Produk tidak ditemukan' });
        res.json(row);
    });
});

// ===== PRODUK - CREATE =====
router.post('/api/products', authenticate, upload.single('image'), (req, res) => {
    const { name, description, stock, price, available } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : null;

    if (!name) {
        return res.status(400).json({ error: 'Nama produk diperlukan' });
    }

    db.run(
        `INSERT INTO products (name, description, image_path, stock, price, available)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description || '', imagePath, stock || 0, price || 0, available ? 1 : 0],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ 
                id: this.lastID, 
                name, 
                description, 
                image_path: imagePath,
                stock,
                price,
                available,
                message: 'Produk berhasil ditambahkan'
            });
        }
    );
});

// ===== PRODUK - UPDATE =====
router.put('/api/products/:id', authenticate, upload.single('image'), (req, res) => {
    const { name, description, stock, price, available } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : undefined;

    let query = 'UPDATE products SET ';
    let params = [];
    const updates = [];

    if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
    }
    if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
    }
    if (stock !== undefined) {
        updates.push('stock = ?');
        params.push(stock);
    }
    if (price !== undefined) {
        updates.push('price = ?');
        params.push(price);
    }
    if (available !== undefined) {
        updates.push('available = ?');
        params.push(available ? 1 : 0);
    }
    if (imagePath !== undefined) {
        updates.push('image_path = ?');
        params.push(imagePath);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'Tidak ada data yang diupdate' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    query += updates.join(', ') + ' WHERE id = ?';
    params.push(req.params.id);

    db.run(query, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
        
        res.json({ 
            id: req.params.id,
            message: 'Produk berhasil diupdate'
        });
    });
});

// ===== PRODUK - DELETE =====
router.delete('/api/products/:id', authenticate, (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
        
        res.json({ message: 'Produk berhasil dihapus' });
    });
});

// ===== COMPANY INFO - GET =====
router.get('/api/company', (req, res) => {
    db.get('SELECT * FROM company LIMIT 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

// ===== COMPANY INFO - UPDATE =====
router.put('/api/company', authenticate, upload.single('logo'), (req, res) => {
    const { name, description, phone, whatsapp, email, address, operating_hours } = req.body;
    const logoPath = req.file ? `/images/${req.file.filename}` : undefined;

    let query = 'UPDATE company SET ';
    let params = [];
    const updates = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
    if (whatsapp !== undefined) { updates.push('whatsapp = ?'); params.push(whatsapp); }
    if (email !== undefined) { updates.push('email = ?'); params.push(email); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address); }
    if (operating_hours !== undefined) { updates.push('operating_hours = ?'); params.push(operating_hours); }
    if (logoPath !== undefined) { updates.push('logo_path = ?'); params.push(logoPath); }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'Tidak ada data yang diupdate' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    query += updates.join(', ') + ' WHERE id = 1';

    db.run(query, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Informasi perusahaan berhasil diupdate' });
    });
});

// ===== PRODUCT AVAILABILITY - UPDATE (Quick Update) =====
router.patch('/api/products/:id/availability', authenticate, (req, res) => {
    const { available } = req.body;

    db.run(
        'UPDATE products SET available = ? WHERE id = ?',
        [available ? 1 : 0, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
            
            res.json({ 
                id: req.params.id,
                available: available,
                message: 'Status ketersediaan berhasil diupdate'
            });
        }
    );
});

// ===== PRODUCT STOCK - UPDATE (Quick Update) =====
router.patch('/api/products/:id/stock', authenticate, (req, res) => {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
        return res.status(400).json({ error: 'Stok harus angka >= 0' });
    }

    db.run(
        'UPDATE products SET stock = ? WHERE id = ?',
        [stock, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
            
            res.json({ 
                id: req.params.id,
                stock: stock,
                message: 'Stok berhasil diupdate'
            });
        }
    );
});

module.exports = router;

// =====================================================
// SETUP DATABASE UNTUK ADMIN PANEL
// =====================================================
// Jalankan file ini SEKALI untuk setup database:
// node admin-setup.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
    // ===== TABLE PRODUK =====
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image_path TEXT,
        price REAL,
        stock INTEGER DEFAULT 0,
        available BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating products table:', err);
        else console.log('✓ Tabel products berhasil dibuat');
    });

    // ===== TABLE ADMIN =====
    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating admins table:', err);
        else console.log('✓ Tabel admins berhasil dibuat');
    });

    // ===== TABLE COMPANY INFO =====
    db.run(`CREATE TABLE IF NOT EXISTS company (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        logo_path TEXT,
        description TEXT,
        phone TEXT,
        whatsapp TEXT,
        email TEXT,
        address TEXT,
        operating_hours TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating company table:', err);
        else console.log('✓ Tabel company berhasil dibuat');
    });

    // ===== INSERT DEFAULT DATA =====
    
    // Insert default admin (username: admin, password: admin123)
    db.run(`INSERT OR IGNORE INTO admins (username, password, email) VALUES (?, ?, ?)`,
        ['admin', 'admin123', 'admin@karyaperikanan.com'],
        (err) => {
            if (err) console.error('Error inserting admin:', err);
            else console.log('✓ Admin default berhasil ditambahkan (username: admin, password: admin123)');
        }
    );

    // Insert default products
    const defaultProducts = [
        {
            name: 'Sisik Ikan Kakap Merah',
            description: 'Sisik ikan kakap merah kering berkualitas premium untuk industri kosmetik dan farmasi',
            stock: 100,
            available: 1
        },
        {
            name: 'Sisik Ikan Nila',
            description: 'Sisik ikan nila kering berkualitas tinggi dengan kandungan kolagen alami',
            stock: 150,
            available: 1
        },
        {
            name: 'Kulit Ikan',
            description: 'Kulit ikan kering berkualitas premium untuk industri pakan dan kerajinan',
            stock: 200,
            available: 1
        }
    ];

    defaultProducts.forEach(product => {
        db.run(
            `INSERT OR IGNORE INTO products (name, description, stock, available) VALUES (?, ?, ?, ?)`,
            [product.name, product.description, product.stock, product.available],
            (err) => {
                if (err) console.error('Error inserting product:', err);
                else console.log(`✓ Produk "${product.name}" berhasil ditambahkan`);
            }
        );
    });

    // Insert company info
    db.run(
        `INSERT OR IGNORE INTO company (name, description, phone, whatsapp, email, address, operating_hours) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            'CV Karya Perikanan Indonesia',
            'Perusahaan pengolahan limbah perikanan berkualitas tinggi',
            '0878-0822-8699',
            '6287808228699',
            'info@karyaperikanan.com',
            'Blk. D No.14, Pengasinan, Kec. Tj. Priok, Jakarta Utara 14450',
            'Buka 24 Jam'
        ],
        (err) => {
            if (err) console.error('Error inserting company:', err);
            else console.log('✓ Info perusahaan berhasil ditambahkan');
        }
    );
});

db.close(() => {
    console.log('\n✅ Setup database selesai!');
    console.log('\nLogin Admin:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\nAkses Admin Panel di: http://localhost:3000/admin.html');
});

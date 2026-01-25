# 🔧 Setup Admin Panel & Database

## Apa yang Sudah Ditambahkan?

✅ **Admin Panel** - Dashboard untuk manage produk & company info
✅ **Database SQLite** - Menyimpan semua data produk
✅ **Upload Foto** - Bisa upload foto produk & logo
✅ **API Backend** - Untuk sinkronisasi data

---

## 📋 CARA SETUP

### 1. Install Dependencies yang Diperlukan

Pastikan sudah punya Node.js. Jalankan di terminal PowerShell:

```powershell
cd c:\Users\zidan\org-calendar-app

# Install dependencies
npm install sqlite3 express cors multer
```

### 2. Setup Database

Jalankan file setup sekali:

```powershell
node admin-setup.js
```

**Output yang diharapkan:**
```
✓ Tabel products berhasil dibuat
✓ Tabel admins berhasil dibuat
✓ Tabel company berhasil dibuat
✓ Admin default berhasil ditambahkan
✓ Produk default berhasil ditambahkan
✓ Info perusahaan berhasil ditambahkan

✅ Setup database selesai!

Login Admin:
Username: admin
Password: admin123
```

### 3. Update server.js

Buka file `server.js` dan tambahkan di bagian paling bawah (sebelum `app.listen`):

```javascript
// ===== IMPORT ADMIN ROUTES =====
const adminRoutes = require('./admin-routes');
app.use(adminRoutes);

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 Admin Panel: http://localhost:${PORT}/admin.html`);
});
```

### 4. Jalankan Server

```powershell
node server.js
```

**Output yang diharapkan:**
```
🚀 Server running at http://localhost:3000
📊 Admin Panel: http://localhost:3000/admin.html
```

---

## 🔐 Login ke Admin Panel

1. Buka browser → `http://localhost:3000/admin.html`
2. **Username:** `admin`
3. **Password:** `admin123`

---

## 📊 Fitur Admin Panel

### 🐟 TAB PRODUK

#### Update Ketersediaan (Quick Update)
- Klik tombol **Enable/Disable** untuk mengubah status produk
- Instant update - produk langsung tampil/hilang di website

#### Tambah Produk Baru
1. Klik tombol **"Tambah Produk"**
2. Isi detail produk:
   - Nama produk
   - Deskripsi
   - Stok
   - Harga
   - Status (Tersedia/Tidak)
   - Upload foto produk
3. Klik **Simpan**

#### Edit Produk
1. Klik tombol **Edit** pada produk
2. Ubah detail yang diperlukan
3. Klik **Simpan**

#### Hapus Produk
1. Klik tombol **Hapus** pada produk
2. Konfirmasi hapus
3. Produk terhapus dari database

### 🏢 TAB INFO PERUSAHAAN

Update informasi perusahaan:
- Nama perusahaan
- Deskripsi
- Telepon & WhatsApp
- Email
- Alamat lengkap
- Jam operasional
- Logo perusahaan (upload baru)

---

## 🗄️ STRUKTUR DATABASE

### TABLE: products
```
id (Primary Key)
name (Nama produk)
description (Deskripsi)
image_path (Path ke foto produk)
price (Harga)
stock (Jumlah stok)
available (1=Tersedia, 0=Tidak)
created_at (Waktu dibuat)
updated_at (Waktu update terakhir)
```

### TABLE: admins
```
id (Primary Key)
username (Username login)
password (Password)
email (Email admin)
created_at (Waktu dibuat)
```

### TABLE: company
```
id (Primary Key)
name (Nama perusahaan)
logo_path (Path ke logo)
description (Deskripsi)
phone (Telepon)
whatsapp (Nomor WhatsApp)
email (Email)
address (Alamat)
operating_hours (Jam operasional)
updated_at (Waktu update terakhir)
```

---

## 🔄 SINKRONISASI DENGAN WEBSITE

Untuk menampilkan produk dari database di website utama, tambahkan kode ini di `js/script.js`:

```javascript
// Load products dari database
async function loadProductsFromDatabase() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        
        // Gunakan data produk untuk update website
        console.log('Products loaded:', products);
        
        // Contoh: Update grid produk
        updateProductsDisplay(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Panggil saat page load
document.addEventListener('DOMContentLoaded', loadProductsFromDatabase);
```

---

## 🛡️ KEAMANAN

### Ubah Password Admin (Penting!)

1. Buka database dengan tool seperti **DB Browser for SQLite**
2. Atau ubah langsung via code

**Cara mengubah password:**

Edit file `admin-setup.js` sebelum jalankan:
```javascript
// Ubah dari:
db.run(`INSERT OR IGNORE INTO admins (username, password, email) VALUES (?, ?, ?)`,
    ['admin', 'admin123', 'admin@karyaperikanan.com'],
    
// Menjadi:
db.run(`INSERT OR IGNORE INTO admins (username, password, email) VALUES (?, ?, ?)`,
    ['admin', 'password-baru-anda', 'admin@karyaperikanan.com'],
```

---

## 📁 STRUKTUR FOLDER

```
org-calendar-app/
├── data.db                  ← Database SQLite
├── admin.html               ← Admin Panel UI
├── admin-setup.js           ← Setup database (jalankan 1x)
├── admin-routes.js          ← API routes
├── server.js                ← Server Express (update)
├── js/
│   ├── admin.js            ← Admin Panel JavaScript
│   └── script.js           ← Website JavaScript
├── css/
│   └── style.css           ← Website CSS
├── public/
│   └── images/             ← Upload folder untuk foto
└── uploads/                ← Upload folder
```

---

## 🚀 TESTING

### Test Admin Login
```
Username: admin
Password: admin123
```

### Test Upload Foto
1. Ke tab **PRODUK**
2. Klik **Tambah Produk**
3. Upload foto
4. Foto akan tersimpan di folder `public/images/`

### Test Ketersediaan Produk
1. Klik tombol **Disable** pada produk
2. Cek website - produk akan hilang dari tampilan

---

## 📞 TROUBLESHOOTING

### Error: "Cannot find module 'sqlite3'"
```powershell
npm install sqlite3 --save
```

### Error: "Port 3000 already in use"
```powershell
# Gunakan port berbeda
$env:PORT=3001; node server.js
```

### Database tidak muncul
- Hapus file `data.db`
- Jalankan ulang: `node admin-setup.js`

---

## 🎯 NEXT STEPS

1. ✅ Jalankan `admin-setup.js` untuk setup database
2. ✅ Update `server.js` dengan admin routes
3. ✅ Jalankan `node server.js`
4. ✅ Akses `http://localhost:3000/admin.html`
5. ✅ Login dengan `admin / admin123`
6. ✅ Tambah produk dan test

**Admin Panel siap digunakan!** 🎉

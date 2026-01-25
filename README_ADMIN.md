# 🐟 ADMIN PANEL - CV KARYA PERIKANAN INDONESIA

Sistem admin lengkap untuk manage produk, upload foto, dan database terhubung.

---

## 📦 FILE-FILE YANG DITAMBAHKAN

### Database & Backend
- `admin-setup.js` - Setup database (jalankan 1x)
- `admin-routes.js` - API backend untuk admin
- `SERVER_UPDATE.js` - Kode yang harus ditambahkan ke server.js
- `data.db` - Database SQLite (otomatis terbuat)

### Frontend Admin
- `admin.html` - Dashboard admin panel
- `js/admin.js` - Logic untuk admin panel

### Dokumentasi
- `SETUP_ADMIN.md` - Panduan lengkap setup
- `START_ADMIN.bat` - Quick start script (Windows)

---

## 🚀 QUICK START (WINDOWS)

### Cara Termudah - Double Click File

1. **Double click** file `START_ADMIN.bat`
2. Tunggu sampai selesai
3. Buka browser → `http://localhost:3000/admin.html`
4. Login dengan `admin / admin123`

---

## 🔧 SETUP MANUAL (Jika batch tidak berfungsi)

### Step 1: Install Dependencies

Buka PowerShell di folder aplikasi:

```powershell
cd c:\Users\zidan\org-calendar-app
npm install sqlite3 express cors multer
```

### Step 2: Setup Database

```powershell
node admin-setup.js
```

Hasilnya:
```
✓ Tabel products berhasil dibuat
✓ Tabel admins berhasil dibuat
✓ Tabel company berhasil dibuat
✓ Admin default berhasil ditambahkan
✓ Produk default berhasil ditambahkan
✓ Info perusahaan berhasil ditambahkan

✅ Setup database selesai!
```

### Step 3: Update server.js

Buka file `server.js` dan pergi ke baris terakhir (sebelum `app.listen`).

Copy isi file `SERVER_UPDATE.js` dan paste ke sana.

**BEFORE:**
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

**AFTER:**
```javascript
// ===== IMPORT ADMIN ROUTES =====
const adminRoutes = require('./admin-routes');
app.use(adminRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
app.use('/images', express.static(imagesDir));

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📊 Admin Panel: http://localhost:${PORT}/admin.html`);
});
```

### Step 4: Jalankan Server

```powershell
node server.js
```

Output:
```
🚀 Server: http://localhost:3000
📊 Admin Panel: http://localhost:3000/admin.html
```

### Step 5: Akses Admin Panel

1. Buka browser
2. Ketik: `http://localhost:3000/admin.html`
3. Login:
   - **Username:** admin
   - **Password:** admin123

---

## 🎯 FITUR ADMIN PANEL

### 1️⃣ TAB PRODUK - Manage Produk

#### Update Ketersediaan (Instant)
- Klik tombol **Enable/Disable** untuk toggle status produk
- Produk langsung tampil/hilang di website tanpa refresh

#### Tambah Produk Baru
```
Klik: Tombol "+ Tambah Produk"
Isi:
  - Nama Produk
  - Deskripsi
  - Stok (jumlah unit)
  - Harga (Rp)
  - Centang "Produk Tersedia" jika ada
  - Upload Foto Produk
Klik: Simpan
```

#### Edit Produk
```
Klik: Tombol "Edit" pada produk
Edit: Data yang ingin diubah
Klik: Simpan
```

#### Hapus Produk
```
Klik: Tombol "Hapus" pada produk
Konfirmasi: Klik OK
Produk terhapus dari database
```

### 2️⃣ TAB INFO PERUSAHAAN

Update informasi perusahaan yang muncul di website:
- Nama Perusahaan
- Deskripsi
- Nomor Telepon
- Nomor WhatsApp
- Email
- Alamat Lengkap
- Jam Operasional
- **Upload Logo Baru** (akan mengganti logo di semua halaman)

---

## 📊 STRUKTUR DATABASE

### Tabel: products
```
id ..................... Primary Key
name .................... Nama produk
description ............ Deskripsi
image_path ............. Path ke foto produk
price .................. Harga produk
stock .................. Jumlah stok
available .............. Status (1=Tersedia, 0=Tidak)
created_at ............ Waktu dibuat
updated_at ............ Waktu update terakhir
```

### Tabel: admins
```
id ..................... Primary Key
username ............... Username login
password ............... Password (minimal enkripsi)
email .................. Email admin
created_at ............ Waktu dibuat
```

### Tabel: company
```
id ..................... Primary Key
name .................... Nama perusahaan
logo_path .............. Path ke logo
description ............ Deskripsi
phone .................. Telepon
whatsapp ............... Nomor WhatsApp
email .................. Email
address ................ Alamat lengkap
operating_hours ....... Jam operasional
updated_at ............ Waktu update terakhir
```

---

## 🔄 API ENDPOINTS

### Public (Tidak butuh login)
```
GET  /api/products           - Daftar semua produk
GET  /api/products/:id       - Detail 1 produk
GET  /api/company            - Info perusahaan
```

### Admin (Butuh login - token di header Authorization)
```
POST   /api/admin/login                      - Login
POST   /api/products                         - Tambah produk
PUT    /api/products/:id                     - Edit produk
DELETE /api/products/:id                     - Hapus produk
PATCH  /api/products/:id/availability        - Update status
PATCH  /api/products/:id/stock               - Update stok
PUT    /api/company                          - Update info perusahaan
```

---

## 🖼️ UPLOAD HANDLING

### Folder Upload
- Semua foto produk & logo tersimpan di: `public/images/`
- File naming otomatis: `1704873600000-abc12345.png`
- Ukuran max: 5MB

### Access Upload
- URL: `http://localhost:3000/images/[filename].png`
- Bisa diakses dari website dan HTML

---

## 🔐 KEAMANAN

### Ubah Password Admin

**SEBELUM setup database**, edit file `admin-setup.js`:

```javascript
// Baris ~50, ubah:
db.run(`INSERT OR IGNORE INTO admins (username, password, email) VALUES (?, ?, ?)`,
    ['admin', 'PASSWORD-BARU-ANDA', 'admin@karyaperikanan.com'],
```

Kemudian jalankan ulang `admin-setup.js`.

### Tips Keamanan
- ⚠️ JANGAN share password admin
- 🔑 Gunakan password kuat (kombinasi huruf, angka, symbol)
- 📲 Untuk production, gunakan JWT token
- 🔒 Untuk online, gunakan HTTPS

---

## 🛠️ TROUBLESHOOTING

### Error: "Cannot find module 'sqlite3'"
```powershell
npm install sqlite3 --save
```

### Error: "EADDRINUSE :::3000" (Port sudah digunakan)
```powershell
# Gunakan port berbeda
$env:PORT=3001; node server.js
```

### Database corrupt / reset
```powershell
# Hapus database lama
del data.db

# Setup ulang
node admin-setup.js
```

### Admin Panel tidak load
1. Cek console browser (F12)
2. Pastikan server running
3. Cek URL: `http://localhost:3000/admin.html`
4. Restart server dengan `Ctrl+C` lalu `node server.js`

---

## 📱 Integrasi dengan Website

Data di database otomatis tersinkronisasi dengan website:

1. **Produk yang di-disable** akan hilang dari website
2. **Foto produk** baru langsung tampil
3. **Info perusahaan** otomatis update di semua halaman

---

## 🎓 NEXT STEPS

- ✅ Setup database & admin panel
- ⏭️ Tambah produk & upload foto
- ⏭️ Update ketersediaan produk
- ⏭️ Ganti logo/info perusahaan
- ⏭️ Deploy ke hosting online

---

## 📞 SUPPORT

Jika ada error atau pertanyaan:
1. Lihat console server (PowerShell)
2. Buka DevTools browser (F12)
3. Check dokumentasi `SETUP_ADMIN.md`

**Admin Panel siap digunakan!** 🚀✨

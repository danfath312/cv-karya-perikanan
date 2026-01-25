# 🚀 PANDUAN DEPLOY KE GITHUB & VERCEL

## 📌 OVERVIEW

Project ini memiliki:
- **Frontend**: HTML/CSS/JS (bisa di Vercel)
- **Backend**: Node.js/Express (bisa di Vercel dengan serverless)
- **Database**: SQLite (perlu diganti untuk production)

---

## PILIHAN DEPLOYMENT

### ✅ OPSI 1: FULL STACK DI VERCEL (RECOMMENDED)
Frontend + Backend di Vercel, database di Vercel Postgres

### ✅ OPSI 2: SPLIT DEPLOYMENT
Frontend di Vercel, Backend di Railway/Render

---

# 🎯 OPSI 1: DEPLOY FULL KE VERCEL

## STEP 1: PERSIAPAN PROJECT

### 1.1 Buat file `.gitignore`
```
node_modules/
data.db
.env
*.log
.DS_Store
```

### 1.2 Buat file `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 1.3 Update `package.json`
Pastikan ada scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

---

## STEP 2: UPLOAD KE GITHUB

### 2.1 Inisialisasi Git
```bash
# Buka PowerShell di folder project
cd c:\Users\zidan\org-calendar-app

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: CV Karya Perikanan website"
```

### 2.2 Buat Repository di GitHub
1. Buka https://github.com
2. Login
3. Klik tombol **[+]** → **New repository**
4. Nama: `cv-karya-perikanan`
5. Description: `Company profile website with admin panel`
6. **Public** atau **Private** (pilih sesuai kebutuhan)
7. **JANGAN** centang "Add README"
8. Klik **Create repository**

### 2.3 Connect & Push
```bash
# Ganti URL dengan repository Anda
git remote add origin https://github.com/USERNAME/cv-karya-perikanan.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

**Username/Password:** Gunakan Personal Access Token (bukan password biasa)

#### Cara Buat GitHub Token:
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token → Select scopes: `repo`
4. Copy token, simpan baik-baik
5. Gunakan sebagai password saat push

---

## STEP 3: DEPLOY KE VERCEL

### 3.1 Sign Up Vercel
1. Buka https://vercel.com
2. Klik **Sign Up**
3. Login dengan **GitHub** (recommended)
4. Authorize Vercel

### 3.2 Import Project
1. Dashboard Vercel → **Add New** → **Project**
2. Pilih repository: `cv-karya-perikanan`
3. Klik **Import**

### 3.3 Configure Project
- **Framework Preset:** Other
- **Root Directory:** ./
- **Build Command:** (kosongkan)
- **Output Directory:** public
- **Install Command:** `npm install`

### 3.4 Environment Variables
Klik **Environment Variables**, tambahkan:
```
NODE_ENV=production
DATABASE_URL=your-vercel-postgres-url
```

### 3.5 Deploy
Klik **Deploy** → Tunggu 2-3 menit

---

## STEP 4: SETUP VERCEL POSTGRES (untuk database)

### 4.1 Create Database
1. Dashboard Vercel → Project → **Storage**
2. Klik **Create Database**
3. Pilih **Postgres**
4. Nama: `cv-karya-db`
5. Region: Singapore (pilih terdekat)
6. Klik **Create**

### 4.2 Get Connection String
1. Database → **Settings** → **Connection String**
2. Copy **Postgres URL**
3. Simpan di Environment Variables sebagai `DATABASE_URL`

### 4.3 Migrate Database
Buat file `migrate-postgres.js`:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_path VARCHAR(500),
        price DECIMAL(10,2),
        stock INTEGER DEFAULT 0,
        available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS company (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        logo_path VARCHAR(500),
        description TEXT,
        phone VARCHAR(50),
        whatsapp VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        operating_hours VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✓ Tables created successfully');
    
    // Insert default data
    await client.query(`
      INSERT INTO admins (username, password, email) 
      VALUES ('admin', 'admin123', 'admin@karyaperikanan.com')
      ON CONFLICT (username) DO NOTHING;
    `);
    
    console.log('✓ Migration complete!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
```

Jalankan lokal:
```bash
DATABASE_URL="your-postgres-url" node migrate-postgres.js
```

---

## STEP 5: UPDATE CODE UNTUK POSTGRES

Ganti semua SQLite code dengan PostgreSQL:

**File: `admin-routes.js`** - Update database connection:
```javascript
// Ganti sqlite3 dengan pg
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/cvkarya',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Ganti db.all() dengan pool.query()
// Contoh:
router.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

## STEP 6: REDEPLOY

Setiap kali ada perubahan:
```bash
git add .
git commit -m "Update untuk production"
git push origin main
```

Vercel akan otomatis redeploy!

---

# 🎯 OPSI 2: DEPLOY TERPISAH (Alternatif)

## Frontend di Vercel + Backend di Railway

### STEP 1: Deploy Backend ke Railway

1. Buka https://railway.app
2. Sign up dengan GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Pilih repository
5. Add **PostgreSQL** plugin
6. Set environment: `DATABASE_URL` (auto dari Railway)
7. Deploy!

Railway URL: `https://your-app.railway.app`

### STEP 2: Deploy Frontend ke Vercel

1. Buka https://vercel.com
2. Import project
3. Set Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-app.railway.app
   ```
4. Deploy

### STEP 3: Update API Calls

File `js/admin.js` - Update BASE_URL:
```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

---

# 📋 CHECKLIST DEPLOYMENT

## Pre-Deploy
- [ ] `.gitignore` sudah ada
- [ ] `vercel.json` sudah ada
- [ ] `package.json` sudah lengkap
- [ ] Environment variables sudah disiapkan
- [ ] Test lokal semua fitur work

## GitHub
- [ ] Repository sudah dibuat
- [ ] Code sudah di push
- [ ] README.md sudah informatif

## Vercel
- [ ] Project sudah diimport
- [ ] Database sudah disetup
- [ ] Environment variables sudah diisi
- [ ] Deploy berhasil (status: Ready)

## Testing Production
- [ ] Website bisa diakses
- [ ] Admin panel bisa diakses
- [ ] Login admin work
- [ ] CRUD produk work
- [ ] Upload gambar work
- [ ] WhatsApp integration work

---

# 🔧 TROUBLESHOOTING

## Error: "Cannot find module"
**Solution:** Tambahkan dependency di `package.json`, commit & push

## Error: Database connection failed
**Solution:** 
- Check DATABASE_URL di environment variables
- Pastikan Postgres database sudah running
- Check network/firewall

## Error: Upload file tidak work
**Solution:**
- Vercel punya file system read-only
- Gunakan Vercel Blob Storage atau Cloudinary untuk upload
- Atau simpan di /tmp (temporary, akan hilang)

## Error: 404 Not Found
**Solution:**
- Check `vercel.json` routing
- Pastikan path API benar
- Check Vercel logs: Dashboard → Deployment → Runtime Logs

## Error: CORS blocked
**Solution:**
Add ke `server.js`:
```javascript
app.use(cors({
  origin: ['https://your-vercel-domain.vercel.app'],
  credentials: true
}));
```

---

# 🎉 SELESAI!

Website Anda sekarang live di:
- **Production URL:** https://cv-karya-perikanan.vercel.app
- **Admin Panel:** https://cv-karya-perikanan.vercel.app/admin.html

## Custom Domain (Optional)

1. Vercel Dashboard → Project → **Settings** → **Domains**
2. Tambahkan domain: `karyaperikanan.com`
3. Ikuti instruksi DNS
4. Tunggu propagasi (5-10 menit)

---

# 📱 SHARE WEBSITE

Setelah deploy, share URL:
- WhatsApp: Kirim link langsung
- Instagram: Link di bio
- Facebook: Post link
- Google My Business: Tambahkan website URL

Meta tags sudah setup, jadi preview akan muncul cantik! ✨

---

**Need Help?** 
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- GitHub Help: https://docs.github.com

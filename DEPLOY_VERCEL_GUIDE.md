# PANDUAN DEPLOYMENT ADMIN PANEL KE VERCEL

## 🎯 Ringkasan Perubahan

Admin panel telah diamankan dengan backend API. Semua akses Supabase sekarang melalui server, bukan langsung dari browser.

### Status Keamanan
- ✅ Service role key HANYA di server
- ✅ Frontend tidak bisa akses Supabase langsung
- ✅ Setiap API request dilindungi token
- ✅ Admin panel tetap berfungsi normal

---

## 📋 File yang Diubah/Dibuat

### ✅ File Baru (Dibuat)
```
api/admin/
├── products.js       # Product management API
├── orders.js         # Order management API
└── company.js        # Company info API

.env.example          # Environment variable template
ADMIN_SECURITY.md     # Security documentation
DEPLOY_GUIDE.md       # This file
```

### ✅ File Diupdate
```
server.js            # Tambah login endpoint + admin API routes
js/admin.js          # Hapus Supabase SDK, pakai fetch API
admin.html           # Hapus Supabase SDK script tag
```

---

## 🚀 Langkah-Langkah Deployment ke Vercel

### 1️⃣ Persiapan Lokal

Pastikan sudah installed:
```bash
npm install
```

Jika ada error, install dependencies yang kurang:
```bash
npm install express cors multer sqlite3 node-fetch @supabase/supabase-js
```

### 2️⃣ Test Lokal

Jalankan server lokal:
```bash
npm start
```

Test admin login di browser:
```
http://localhost:3000/admin.html
```

Pastikan bisa login dan tampil dashboard.

### 3️⃣ Setup Environment Variables Lokal (Optional)

Buat file `.env` lokal (jangan commit ke git):
```env
SUPABASE_URL=https://pmegvhlyabddfxxoyjrq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_SECRET=my-super-secret-admin-token-2024
PORT=3000
```

### 4️⃣ Setup di Vercel Dashboard

#### A. Import Project
1. Buka [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import repository GitHub
4. Select branch yang mau di-deploy

#### B. Set Environment Variables
1. Di project settings, buka **Environment Variables**
2. Tambahkan 3 variable:

| Nama Variable | Nilai | Keterangan |
|---|---|---|
| `SUPABASE_URL` | `https://pmegvhlyabddfxxoyjrq.supabase.co` | Copy dari Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1N...` | Copy dari Supabase API Keys |
| `ADMIN_SECRET` | `your-random-secret-123456` | Generate string random yang kuat |

#### C. Deploy
1. Click "Deploy"
2. Tunggu proses selesai
3. Terima link deployment

---

## 🔑 Mendapatkan SUPABASE_SERVICE_ROLE_KEY

1. Login ke [supabase.com](https://supabase.com)
2. Select project
3. Di sidebar, klik **Settings** → **API**
4. Copy `service_role key` (bukan anon key)
5. Paste ke environment variable `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔐 Generate ADMIN_SECRET

Generate random string untuk admin token:

### Option 1: Gunakan Terminal
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Count 32 -InputObject ([char[]]"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"))))
```

### Option 2: Online Generator
Buka https://www.random.org/strings/ dan generate random string 32 karakter

### Option 3: Simpel
```
your-admin-secret-change-this-to-something-random-2024
```

**PENTING:** 
- Gunakan string yang panjang dan random
- Ganti di production
- Jangan pakai string yang simple

---

## ✅ Verifikasi Deployment

### 1. Cek Server Running
Buka URL deployment di browser:
```
https://your-project.vercel.app/admin.html
```

Harus tampil login page.

### 2. Test Login
- Username: (sesuai database)
- Password: (sesuai database)

Harus bisa login dan tampil dashboard.

### 3. Test API Endpoints

Di browser console:
```javascript
// Test fetch tanpa token (harus 401)
fetch('https://your-project.vercel.app/api/admin/products')
  .then(r => r.json())
  .then(d => console.log(d));
// Result: { error: 'Unauthorized...' }
```

### 4. Verifikasi Keamanan

Cek bahwa service_role key TIDAK ada di frontend:

```javascript
// Di browser console, check localStorage
console.log(localStorage.getItem('adminSecret'));   // ✅ Admin token (tidak service_role)
console.log(localStorage.getItem('adminToken'));    // ✅ Auth token

// Check window variables - HARUS undefined
console.log(window.SUPABASE_SERVICE_ROLE_KEY);      // ❌ undefined (BAGUS)
console.log(window.supabaseOrderClient);            // ❌ undefined (BAGUS)
```

---

## 🔄 Update Code di Vercel

Setiap push ke GitHub:
1. Vercel auto-build & deploy
2. Check deployment logs
3. Test di live URL

Jika ada error, check Vercel logs:
1. Buka Vercel Dashboard
2. Project → Deployments
3. Click latest deployment
4. Lihat "Build Logs"

---

## 📞 Troubleshooting

### Problem: "Unauthorized" saat akses API
**Solution:**
- Check admin_secret di localStorage
- Verify ADMIN_SECRET di Vercel environment variables
- Jika beda, update environment variable dan re-deploy

### Problem: "Cannot find module '@supabase/supabase-js'"
**Solution:**
- Di terminal lokal: `npm install @supabase/supabase-js`
- Commit `package.json` dan `package-lock.json`
- Re-deploy

### Problem: Supabase connection failed
**Solution:**
- Verify SUPABASE_URL correct
- Verify SUPABASE_SERVICE_ROLE_KEY correct
- Check Supabase project status (ada di Supabase dashboard)

### Problem: Upload image returns 500
**Solution:**
- Check Supabase Storage bucket "product_images" exists
- Check bucket public read access enabled
- Check file size < 5MB

---

## 🛡️ Security Checklist

Sebelum live ke production:

- [ ] SUPABASE_SERVICE_ROLE_KEY set di Vercel environment
- [ ] ADMIN_SECRET di-generate dan di-set (bukan default)
- [ ] Test login & API endpoints
- [ ] Verify service_role key tidak ada di browser
- [ ] HTTPS enforced (Vercel default)
- [ ] Database credentials tidak di-commit ke GitHub
- [ ] .env file di-add ke .gitignore

---

## 📚 File Documentation

### ADMIN_SECURITY.md
Penjelasan detail tentang security implementation

### .env.example
Template untuk environment variables

### api/admin/
Directory dengan semua API endpoints

---

## 🎓 Cara Kerja Flow

### Login Flow
```
1. User klik login di admin.html
2. Frontend kirim username + password ke /api/admin/login
3. Server verifikasi di SQLite database
4. Server return:
   - token (untuk auth)
   - admin_secret (untuk API requests)
5. Frontend simpan di localStorage
```

### API Request Flow
```
1. Admin click "Load Products"
2. Frontend fetch /api/admin/products
3. Header: x-admin-token: admin_secret
4. Server middleware cek token
5. Jika valid, server fetch dari Supabase (pake service_role)
6. Return data ke frontend
7. Frontend tampil di table
```

---

## 🚨 Jangan Lupa!

1. **Commit semua file baru ke GitHub**
   ```bash
   git add .
   git commit -m "Add API security implementation"
   git push
   ```

2. **Set environment variables di Vercel** sebelum deploy

3. **Test di staging** sebelum production

4. **Monitor logs** setelah deployment

5. **Backup database** sebelum update

---

## 📞 Support

Jika ada masalah:

1. Check Vercel deployment logs
2. Check browser console (F12)
3. Check network tab untuk API requests
4. Verify environment variables set correctly
5. Test API endpoint dengan curl/Postman

---

## ✨ Selesai!

Admin panel sekarang aman dengan:
- ✅ Service role key hanya di server
- ✅ Semua API request protected
- ✅ Frontend tidak bisa akses database langsung
- ✅ Production-ready di Vercel

Siap untuk go live! 🚀

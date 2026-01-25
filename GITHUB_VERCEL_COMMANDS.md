 # 📝 COPY-PASTE COMMANDS - GITHUB & VERCEL DEPLOYMENT

## 🔵 PART 1: UPLOAD KE GITHUB

### Step 1: Initialize Git
```bash
cd c:\Users\zidan\org-calendar-app
git init
```

### Step 2: Add files
```bash
git add .
```

### Step 3: First commit
```bash
git commit -m "Initial commit: CV Karya Perikanan website with admin panel"
```

### Step 4: Create GitHub repository
Buka browser → https://github.com/new
- Repository name: `cv-karya-perikanan`
- Public
- Klik **Create repository**

### Step 5: Connect & Push
```bash
# GANTI "USERNAME" dengan username GitHub Anda
git remote add origin https://github.com/USERNAME/cv-karya-perikanan.git
git branch -M main
git push -u origin main
```

**Jika diminta login:**
- Username: [GitHub username Anda]
- Password: [Personal Access Token - bukan password biasa]

#### Cara buat GitHub Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Centang `repo`
3. Generate → Copy token
4. Paste sebagai password

---

## 🟢 PART 2: DEPLOY KE VERCEL

### Step 1: Sign up Vercel
Buka: https://vercel.com/signup
- Klik **Continue with GitHub**
- Authorize Vercel

### Step 2: Import Project
1. Dashboard → **Add New** → **Project**
2. Pilih repository: `cv-karya-perikanan`
3. Klik **Import**

### Step 3: Configure
- Framework Preset: **Other**
- Root Directory: `./`
- Build Command: (kosongkan)
- Output Directory: `public`
- Install Command: `npm install`

### Step 4: Setup Database
1. Project → **Storage** tab
2. **Create Database** → **Postgres**
3. Nama: `cv-karya-db`
4. Region: **Singapore** (terdekat Indonesia)
5. **Create**

### Step 5: Get Database URL
1. Database → **Settings**
2. Copy **POSTGRES_URL**
3. Simpan sementara di notepad

### Step 6: Add Environment Variables
1. Project → **Settings** → **Environment Variables**
2. Add variable:
   - Key: `DATABASE_URL`
   - Value: [paste POSTGRES_URL dari step 5]
   - Environment: **Production, Preview, Development**
3. **Save**

### Step 7: Deploy!
Klik **Deploy**

Tunggu 2-3 menit...

---

## 🔄 PART 3: MIGRATE DATABASE

### Option A: Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Run migration
vercel env pull .env.local
node migrate-postgres.js
```

### Option B: Manual via Vercel Postgres Dashboard

1. Vercel → Database → **Query** tab
2. Copy-paste SQL dari file `migrate-postgres.js` (bagian CREATE TABLE)
3. Jalankan satu per satu
4. Insert default data manual

---

## ✅ VERIFICATION

Website live di: `https://cv-karya-perikanan.vercel.app`

Test:
1. Buka URL website → Homepage muncul ✓
2. Buka `/admin.html` → Login page muncul ✓
3. Login: admin/admin123 → Dashboard muncul ✓
4. Tambah produk → Berhasil save ✓
5. Buka website → Produk baru muncul ✓

---

## 🔄 UPDATE CODE (Setelah Deploy)

Setiap kali ada perubahan code:

```bash
git add .
git commit -m "Update: deskripsi perubahan"
git push origin main
```

Vercel akan **auto-deploy** dalam 1-2 menit!

---

## 🎁 BONUS: Custom Domain

### Jika punya domain sendiri (misal: karyaperikanan.com)

1. Vercel → Project → **Settings** → **Domains**
2. Add domain: `karyaperikanan.com`
3. Ikuti instruksi DNS:
   - Type: **A Record**
   - Name: `@`
   - Value: `76.76.21.21`
4. Tunggu DNS propagation (5-60 menit)
5. Selesai! Website bisa diakses via domain Anda

---

## 📊 MONITORING

Dashboard Vercel menampilkan:
- Analytics (visitors, pageviews)
- Runtime Logs (error tracking)
- Deployment history
- Performance metrics

---

## 💡 TIPS

1. **Always test local first** sebelum push
2. **Commit frequently** dengan descriptive message
3. **Backup database** sebelum migration besar
4. **Use environment variables** untuk sensitive data
5. **Monitor logs** untuk debug production issues

---

🎉 **SELESAI!** Website Anda sekarang LIVE dan bisa diakses dari mana saja!

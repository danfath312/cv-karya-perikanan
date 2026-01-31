# Admin Panel Security Implementation

## ✅ KEAMANAN ADMIN PANEL DENGAN BACKEND API

### Kondisi Sebelum (❌ TIDAK AMAN)
- `admin.html` + `js/admin.js` mengakses Supabase langsung dari browser
- `SUPABASE_SERVICE_ROLE_KEY` disimpan di `js/admin.js` (bisa dilihat di browser)
- Siapa saja bisa buka DevTools dan lihat service_role key
- Full akses database tanpa kontrol dari server

### Kondisi Sesudah (✅ AMAN)
- Admin panel hanya menggunakan fetch API ke backend
- Semua Supabase operations berjalan di server (Vercel Serverless)
- `SUPABASE_SERVICE_ROLE_KEY` hanya tersimpan di environment variables server
- Frontend tidak punya akses langsung ke Supabase
- Setiap API request dilindungi dengan `x-admin-secret` header
- Rate limiting per IP (60 req/minute)
- Fail-fast ENV validation
- Health check endpoint untuk diagnosis

---

## 📁 File Structure

```
api/admin/
├── _middleware/
│   └── auth.js           # Shared auth middleware dengan rate limiting
├── health.js             # Health check endpoint (tidak perlu auth)
├── login.js              # Verify admin secret
├── company.js            # Endpoint untuk company info
├── orders.js             # List orders
├── orders/
│   └── [id].js          # Update order status
├── products/
│   ├── index.js         # List & create products
│   ├── [id].js          # Get/update/delete single product
│   └── [id]/
│       └── toggle.js    # Toggle product availability
└── upload.js             # Upload product images
```

---

## 🔐 Cara Kerja Admin Login

### 1. Login Flow
```
User input ADMIN_SECRET → Frontend kirim POST /api/admin/login
                        → Backend validate token
                        → Success: simpan di localStorage
                        → Frontend bisa akses admin endpoints
```

### 2. Request Flow
```
Frontend → Fetch dengan header x-admin-secret
        → authMiddleware check rate limit
        → authMiddleware validate token
        → validateEnv check Supabase ENV
        → Handler process request
```

### 3. Architecture Decision
**Mengapa pakai header auth, bukan JWT?**
- Admin panel internal, tidak perlu kompleksitas JWT
- Mudah rotate: ganti ENV, redeploy
- Cocok untuk small team
- Rate limiting per IP cukup untuk proteksi

---

## 🔑 Environment Variables

Di Vercel Dashboard atau file `.env` lokal:

```env
# Supabase
SUPABASE_URL=https://pmegvhlyabddfxxoyjrq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin Secret (Ganti dengan string random yang kuat!)
ADMIN_SECRET=your-super-secret-admin-token-2024
```

⚠️ **PENTING: Setiap perubahan ENV di Vercel WAJIB redeploy!**

---

## 📝 Setup Vercel

### 1. Deploy ke Vercel
```bash
vercel deploy
```

### 2. Set Environment Variables di Vercel Dashboard

Pergi ke: **Settings** > **Environment Variables**

---

## 🔄 Cara Ganti ADMIN_SECRET

### Langkah 1: Generate Secret Baru
```bash
# Generate random 32-char string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Langkah 2: Update di Vercel Dashboard
1. Buka Vercel Dashboard → Project Settings
2. Environment Variables → Edit `ADMIN_SECRET`
3. Paste secret baru
4. Save

### Langkah 3: Redeploy
```bash
git commit --allow-empty -m "Trigger redeploy for ENV update"
git push
```

⚠️ **WAJIB REDEPLOY!** ENV changes tidak otomatis apply di Vercel.

### Langkah 4: Update Admin Login
- Admin harus login ulang dengan secret baru
- localStorage akan auto-update

---

## 🩺 Health Check & Diagnostics

### Endpoint: GET /api/admin/health

**Tidak perlu authentication.** Gunakan untuk cek ENV status.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-01-31T10:00:00.000Z",
  "env": {
    "hasAdminSecret": true,
    "hasSupabaseUrl": true,
    "hasServiceRoleKey": true
  }
}
```

**Response (503 Degraded):**
```json
{
  "status": "degraded",
  "timestamp": "2026-01-31T10:00:00.000Z",
  "env": {
    "hasAdminSecret": false,
    "hasSupabaseUrl": true,
    "hasServiceRoleKey": true
  },
  "warning": "Some ENV variables are missing. Admin functions may not work.",
  "action": "Verify ENV vars in Vercel Dashboard and redeploy if needed."
}
```

### Cara Diagnosa < 10 Detik

1. **Tidak bisa login?**
   ```bash
   curl https://your-domain.vercel.app/api/admin/health
   ```
   - Jika `hasAdminSecret: false` → Set ADMIN_SECRET di Vercel + redeploy

2. **401 Unauthorized tapi secret benar?**
   - Check health endpoint dulu
   - Jika ENV ok, coba clear localStorage dan login ulang

3. **500 Internal Server Error?**
   - Check health endpoint
   - Jika `hasSupabaseUrl: false` atau `hasServiceRoleKey: false` → Set ENV + redeploy

---

## 🛡️ Rate Limiting

### Konfigurasi
- **60 requests per minute** per IP
- In-memory storage (resets on cold start)
- Headers response:
  - `X-RateLimit-Remaining: 59`
  - `X-RateLimit-Reset: 2026-01-31T10:01:00.000Z`

### Response saat Rate Limit
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

**Status Code:** 429 Too Many Requests

---

## ✅ Verifikasi Keamanan

### Cek di Browser Console:
```javascript
// ✅ HARUS KOSONG/TIDAK ADA
console.log(SUPABASE_SERVICE_ROLE_KEY); // undefined

// ✅ HARUS HANYA ADA TOKEN ADMIN, BUKAN SERVICE_ROLE
console.log(localStorage.getItem('adminSecret')); // admin-token-xxxxx
```

### Cek di Network Tab:
- Setiap API request punya header `x-admin-secret`
- Request ke `/api/admin/*` harus authenticated (kecuali /health)
- Tidak ada Supabase SDK requests dari browser
- Rate limit headers muncul di response

---

## 🔒 Security Best Practices

1. **Admin Secret**
   - Generate random string yang panjang (minimal 32 karakter)
   - Simpan hanya di server (environment variables)
   - Rotate secara berkala (setiap 3-6 bulan)
   - JANGAN hardcode atau commit ke Git

2. **Service Role Key**
   - HANYA simpan di server environment
   - JANGAN commit ke GitHub
   - JANGAN hardcode di frontend atau logs

3. **API Protection**
   - Semua endpoints (kecuali /health) protected dengan authMiddleware
   - Rate limiting aktif per IP
   - Return 401 jika token invalid
   - Return 500 dengan clear message jika ENV missing

4. **HTTPS Only**
   - Selalu gunakan HTTPS di production
   - Admin token bisa intercept jika pakai HTTP

5. **Logging**
   - ❌ JANGAN log: ADMIN_SECRET, tokens, passwords
   - ✅ LOG: Invalid auth attempts, rate limit hits, errors

---

## 🐛 Troubleshooting

### "Unauthorized" Error pada API Calls
1. Check `/api/admin/health` - pastikan semua ENV ok
2. Verify admin token tersimpan di localStorage
3. Check x-admin-secret header di Network tab
4. Coba login ulang (clear localStorage)

### API Returns 500 Error
1. Check `/api/admin/health` - lihat ENV mana yang missing
2. Check Vercel logs: `vercel logs [deployment-url]`
3. Verify Supabase database connection
4. Pastikan sudah redeploy setelah ENV change

### Rate Limit 429 Error
- Tunggu sampai `retryAfter` seconds
- Normal behavior untuk proteksi
- Jika terlalu ketat, adjust di `_middleware/auth.js`

### Image Upload Fails
- Check Supabase Storage bucket exists
- Verify bucket is public
- Check file size (max 50MB)
- Check CORS settings di Supabase

---

## 🚀 Deployment Workflow

### Saat Update ENV:
```bash
# 1. Update di Vercel Dashboard
# 2. Trigger redeploy
git commit --allow-empty -m "Redeploy for ENV update"
git push

# 3. Verify health check
curl https://your-domain.vercel.app/api/admin/health

# 4. Test login
# Admin harus login ulang jika ADMIN_SECRET berubah
```

### Saat Deploy Code Changes:
```bash
git add .
git commit -m "Your changes"
git push

# ENV tetap sama, tidak perlu update admin login
```

---

## 📚 Referensi

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Service Role](https://supabase.com/docs/guides/api/rest/authentication)
- [Rate Limiting Best Practices](https://www.cloudflare.com/learning/bots/what-is-rate-limiting/)

---

**Last Updated:** January 31, 2026  
**Version:** 2.0 (with auth middleware & health check)

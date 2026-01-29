# 🔧 TROUBLESHOOTING GUIDE

## 🚨 Error & Solution

### 1. "Unauthorized" Error pada API Calls

**Error Message:**
```
Error: Unauthorized: Invalid or missing admin token
```

**Penyebab:**
- Token tidak disimpan di localStorage
- Token sudah expired
- ADMIN_SECRET di server tidak match

**Solusi:**
```javascript
// 1. Check localStorage
console.log(localStorage.getItem('adminSecret'));

// 2. Jika kosong, harus login ulang
localStorage.removeItem('adminSecret');
localStorage.removeItem('adminToken');
location.reload();  // Refresh page

// 3. Check di Vercel environment
// Settings → Environment Variables
// Pastikan ADMIN_SECRET ada dan correct
```

---

### 2. "SUPABASE_SERVICE_ROLE_KEY is not defined"

**Penyebab:**
- Environment variable belum di-set di Vercel
- Server belum restart setelah set env var

**Solusi:**
```
1. Buka Vercel Dashboard
2. Settings → Environment Variables
3. Add: SUPABASE_SERVICE_ROLE_KEY = (copy dari Supabase)
4. Click "Save"
5. Redeploy atau tunggu next push
```

---

### 3. "Cannot read property 'headers' of undefined"

**Penyebab:**
- adminSecret tidak ada saat fetch API
- Login belum successful

**Solusi:**
```javascript
// Di admin.js, check:
let adminSecret = localStorage.getItem('adminSecret');
if (!adminSecret) {
  showAlert('loginError', 'Harus login terlebih dahulu', 'danger');
  showLogin();
  return;
}
```

---

### 4. Upload Image Fails (500 Error)

**Penyebab:**
- Supabase Storage bucket tidak ada
- Bucket tidak public
- File terlalu besar

**Solusi:**
```
1. Buka Supabase Dashboard
2. Storage → Buckets
3. Create bucket "product_images" jika belum ada
4. Set ke Public
5. Try upload lagi
```

---

### 5. Products/Orders tidak load (empty table)

**Penyebab:**
- API call gagal
- Supabase connection error
- Database belum ada data

**Solusi:**
```javascript
// 1. Check browser console
F12 → Console → Check error message

// 2. Check network tab
F12 → Network → Click /api/admin/products
→ Check Response tab

// 3. Check Supabase connection
// Pastikan SUPABASE_URL correct

// 4. Check database
// Buka Supabase → Table Editor
// Pastikan tabel "products" ada
```

---

### 6. Login page tidak muncul

**Penyebab:**
- admin.html tidak di-serve
- Static files tidak configured

**Solusi:**
```javascript
// server.js harus punya:
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '.')));
```

---

### 7. "Module not found: @supabase/supabase-js"

**Penyebab:**
- Package belum install
- package.json belum sync dengan package-lock.json

**Solusi:**
```bash
# Lokal
npm install @supabase/supabase-js

# Atau update package.json manual
{
  "dependencies": {
    "@supabase/supabase-js": "^2.0.0"
  }
}

# Commit dan push
git add package*.json
git commit -m "Fix dependencies"
git push
```

---

### 8. "Cannot POST /api/admin/login"

**Penyebab:**
- Login endpoint tidak registered di server.js
- Syntax error di endpoint

**Solusi:**
```javascript
// server.js harus punya:
app.post('/api/admin/login', (req, res) => {
  // ... login logic
});
```

---

### 9. Admin dapat login tapi page blank

**Penyebab:**
- JavaScript error
- admin.js tidak di-load
- API response format salah

**Solusi:**
```javascript
// 1. Check console (F12)
// Look for red error messages

// 2. Check if admin.js loaded
// Open Vercel URL in DevTools
// Source tab → Find admin.js

// 3. Check API response
// Network tab → /api/admin/products
// Response harus JSON array
```

---

### 10. Service role key visible di browser!

**Penyebab:**
- Masih pakai old admin.js dengan hardcoded key
- Supabase SDK masih di HTML

**Solusi:**
```javascript
// 1. Check admin.html
// HARUS TIDAK ADA: <script src="...supabase-js"></script>

// 2. Check admin.js line 1-30
// HARUS TIDAK ADA: SUPABASE_SERVICE_ROLE_KEY = 'eyJ...'

// 3. Check localStorage
console.log(localStorage.getItem('adminSecret'))  // ✅ OK
console.log(window.SUPABASE_SERVICE_ROLE_KEY)     // ❌ undefined

// If ada service_role key, berarti masih pakai old code!
```

---

## 🔍 Debug Steps

### Step 1: Check Server Running
```bash
# Terminal
npm start

# Should see: Server running on http://localhost:3000
```

### Step 2: Check Logs
```bash
# Browser Console (F12)
- Check untuk red errors
- Check untuk console.log messages

# Server Terminal
- Check untuk request logs
- Check untuk error messages
```

### Step 3: Check Network
```
F12 → Network tab
- Click API call
- Check Status (200 = OK, 401 = Auth error, 500 = Server error)
- Check Request Headers (ada x-admin-token?)
- Check Response (data atau error?)
```

### Step 4: Check Environment
```
# Lokal testing
echo $ADMIN_SECRET          # Linux/Mac
echo %ADMIN_SECRET%         # Windows
set | grep ADMIN_SECRET     # Check if set

# Vercel check
Vercel Dashboard → Settings → Environment Variables
```

---

## 📊 Common Status Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | OK | Success ✅ |
| 400 | Bad Request | Check request body |
| 401 | Unauthorized | Check admin token |
| 404 | Not Found | Check URL/endpoint |
| 500 | Server Error | Check server logs |

---

## 🧪 Test API dengan Curl

```bash
# Get products (harus ada token)
curl -H "x-admin-token: your-admin-secret" \
  http://localhost:3000/api/admin/products

# Login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Create product
curl -X POST http://localhost:3000/api/admin/products \
  -H "x-admin-token: your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":100,"stock":10}'
```

---

## 🐛 Common Mistakes

### ❌ Mistake 1: Hardcode secret di code
```javascript
// JANGAN!
const ADMIN_SECRET = 'my-secret-123';
```

### ✅ Correct
```javascript
// PAKAI!
const adminSecret = process.env.ADMIN_SECRET;
```

---

### ❌ Mistake 2: Supabase SDK di browser
```html
<!-- JANGAN! -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### ✅ Correct
```javascript
// Pakai fetch API ke backend
fetch('/api/admin/products', {
  headers: { 'x-admin-token': adminSecret }
})
```

---

### ❌ Mistake 3: Service role di frontend
```javascript
// JANGAN!
const SUPABASE_SERVICE_ROLE_KEY = 'eyJ...';
const client = supabase.createClient(url, SUPABASE_SERVICE_ROLE_KEY);
```

### ✅ Correct
```javascript
// HANYA DI SERVER!
const client = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);
```

---

## 📞 Getting Help

Jika masih error:

1. **Check Documentation**
   - ADMIN_SECURITY.md
   - DEPLOY_VERCEL_GUIDE.md
   - .env.example

2. **Check Logs**
   - Browser console (F12)
   - Vercel deployment logs
   - Terminal/server logs

3. **Verify Setup**
   - Environment variables correct?
   - Files all created?
   - Dependencies installed?

4. **Reset & Try Again**
   - Clear localStorage: F12 → Application → Clear
   - Reload page
   - Login ulang
   - Test API call

---

## ✨ Still Having Issues?

If none of above work:

1. **Reset everything:**
   ```bash
   # Terminal
   npm install
   npm start
   
   # Browser
   F12 → Application → Clear All
   Reload page
   ```

2. **Check file integrity:**
   - server.js punya admin routes?
   - admin.js pakai fetch API?
   - admin.html tidak punya Supabase SDK?

3. **Verify Supabase:**
   - URL correct?
   - Service role key correct?
   - Database tables exist?
   - Storage buckets exist?

4. **Ask for help** with these info:
   - Error message (full text)
   - Browser console error
   - Network tab response
   - Server log output

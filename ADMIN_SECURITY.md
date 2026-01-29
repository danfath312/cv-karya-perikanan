# Admin Panel Security Implementation

## ✅ KEAMANAN ADMIN PANEL DENGAN BACKEND API

### Kondisi Sebelum (❌ TIDAK AMAN)
- `admin.html` + `js/admin.js` mengakses Supabase langsung dari browser
- `SUPABASE_SERVICE_ROLE_KEY` disimpan di `js/admin.js` (bisa dilihat di browser)
- Siapa saja bisa buka DevTools dan lihat service_role key
- Full akses database tanpa kontrolkan dari server

### Kondisi Sesudah (✅ AMAN)
- Admin panel hanya menggunakan fetch API ke backend
- Semua Supabase operations berjalan di server (Node.js)
- `SUPABASE_SERVICE_ROLE_KEY` hanya tersimpan di environment variables server
- Frontend tidak punya akses langsung ke Supabase
- Setiap API request dilindungi dengan `x-admin-token` header

---

## 📁 File Structure

```
api/admin/
├── products.js      # Endpoint untuk manage produk
├── orders.js        # Endpoint untuk manage order
└── company.js       # Endpoint untuk company info
```

---

## 🔐 API Endpoints

Semua endpoint memerlukan header:
```
x-admin-token: <ADMIN_SECRET>
```

### Products
- `GET /api/admin/products` - List semua produk
- `GET /api/admin/products/:id` - Get detail produk
- `POST /api/admin/products` - Buat produk baru
- `PUT /api/admin/products/:id` - Update produk
- `DELETE /api/admin/products/:id` - Hapus produk
- `PATCH /api/admin/products/:id/toggle-availability` - Toggle availability
- `POST /api/admin/upload-product-image` - Upload gambar produk

### Orders
- `GET /api/admin/orders` - List semua order
- `GET /api/admin/orders/:id` - Get detail order
- `PUT /api/admin/orders/:id` - Update order
- `PATCH /api/admin/orders/:id/status` - Update order status
- `DELETE /api/admin/orders/:id` - Hapus order

### Company
- `GET /api/admin/company` - Get company info
- `POST /api/admin/company` - Simpan company info
- `PUT /api/admin/company` - Update company info

---

## 🛠 Admin.js Changes

### Sebelum (Supabase Direct)
```javascript
// ❌ TIDAK AMAN - service_role di browser
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const supabaseOrderClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const { data: products, error } = await supabaseOrderClient
    .from('products')
    .select('*');
```

### Sesudah (API Client)
```javascript
// ✅ AMAN - hanya token admin, bukan service_role
let adminSecret = localStorage.getItem('adminSecret');

const response = await fetch(`${API_URL}/api/admin/products`, {
    headers: {
        'x-admin-token': adminSecret
    }
});
const products = await response.json();
```

---

## 🔑 Environment Variables

Di server (Vercel atau lokal), set variable:

```env
# Supabase
SUPABASE_URL=https://pmegvhlyabddfxxoyjrq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin Secret (Ganti dengan string random yang kuat!)
ADMIN_SECRET=your-super-secret-admin-token-2024
```

---

## 📝 Setup Vercel

### 1. Deploy ke Vercel
```bash
vercel deploy
```

### 2. Set Environment Variables di Vercel Dashboard

Pergi ke: **Settings** > **Environment Variables**

Tambahkan:
- `SUPABASE_URL` → Nilai Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` → Nilai service_role key (dari Supabase)
- `ADMIN_SECRET` → Token rahasia untuk admin (generate random string)

### 3. Simpan Admin Secret di localStorage

Saat admin login, server akan return `admin_secret`. Ini disimpan di localStorage untuk setiap API request.

---

## 🚀 Deployment Checklist

- [ ] Update server.js dengan import API handlers
- [ ] Buat folder `/api/admin/`
- [ ] Buat file endpoints: products.js, orders.js, company.js
- [ ] Update admin.js untuk pakai fetch API
- [ ] Remove Supabase SDK dari admin.html
- [ ] Set environment variables di Vercel/server
- [ ] Update login endpoint untuk return admin_secret
- [ ] Test semua API endpoints
- [ ] Verifikasi service_role tidak ada di browser

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
- Setiap API request punya header `x-admin-token`
- Request ke `/api/admin/*` harus authenticated
- Tidak ada Supabase SDK requests dari browser

---

## 🔒 Security Best Practices

1. **Admin Secret**
   - Generate random string yang panjang (minimal 32 karakter)
   - Simpan hanya di server (environment variables)
   - Change secara berkala

2. **Service Role Key**
   - HANYA simpan di server environment
   - JANGAN commit ke GitHub
   - JANGAN hardcode di frontend

3. **API Protection**
   - Setiap endpoint cek admin token
   - Return 401 jika token invalid
   - Log semua API requests untuk audit

4. **HTTPS Only**
   - Selalu gunakan HTTPS di production
   - Admin token bisa intercept jika pakai HTTP

---

## 🐛 Troubleshooting

### "Unauthorized" Error pada API Calls
- Check admin token tersimpan di localStorage
- Verify ADMIN_SECRET di server match dengan yang dikirim
- Check x-admin-token header di Network tab

### API Returns 500 Error
- Check server logs di Vercel
- Verify SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY correct
- Check Supabase database connection

### Image Upload Fails
- Verify multer upload directory writable
- Check file size limits
- Verify Supabase Storage bucket exists

---

## 📞 Support

Untuk masalah:
1. Check browser console untuk error messages
2. Check Vercel server logs
3. Verify environment variables setup
4. Test API endpoints langsung dengan curl atau Postman

---

## 📚 Referensi

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Service Role](https://supabase.com/docs/guides/api/rest/authentication)
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)

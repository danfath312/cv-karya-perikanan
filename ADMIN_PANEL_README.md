# Admin Panel - Manajemen Order

## 📋 Deskripsi

Admin Panel untuk mengelola pesanan (orders) yang masuk dari form pemesanan publik. Panel ini terhubung langsung ke database Supabase.

## ⚠️ SECURITY WARNING

**PENTING**: File ini menggunakan **SERVICE_ROLE_KEY** Supabase dan hanya untuk penggunaan **LOKAL/INTERNAL**.

- ❌ **JANGAN** publish ke GitHub publik
- ❌ **JANGAN** deploy ke hosting publik
- ❌ **JANGAN** bagikan kode ini ke pihak ketiga
- ✅ **HANYA** gunakan di environment lokal atau internal server

Jika perlu production deployment, implementasikan proper authentication dengan JWT tokens dan RLS policies.

## 📁 File-file

- **admin.html** - Halaman admin panel (HTML)
  - Login form dengan OTP
  - 3 tabs: Produk, Info Perusahaan, Pesanan
  - Tabel pesanan dengan dropdown status

- **js/admin.js** - Logic admin panel (JavaScript)
  - Supabase client initialization dengan SERVICE_ROLE_KEY
  - Load orders dari tabel `orders`
  - Update status order
  - Format dan render data ke tabel

## 🚀 Cara Menggunakan

### 1. Akses Admin Panel
```
http://localhost:5500/admin.html
(atau URL sesuai server Anda)
```

### 2. Login
- Gunakan username dan password yang sudah terdaftar
- Atau minta OTP untuk registrasi baru

### 3. Manage Orders
- Klik tab "Pesanan" 
- Tabel menampilkan semua order dari Supabase
- Ubah status order dengan dropdown di kolom "Status"
- Status otomatis tersimpan ke Supabase

## 📊 Kolom Order

| Kolom | Keterangan |
|-------|-----------|
| ID | ID unik dari order (auto-generated) |
| Pelanggan | Nama customer |
| WhatsApp | Nomor kontak (clickable link ke wa.me) |
| Produk | Nama produk yang dipesan |
| Jumlah | Jumlah pesanan (dalam kg) |
| Alamat | Alamat pengiriman |
| Status | Dropdown untuk ubah status |
| Dibuat | Tanggal & waktu order dibuat |

## 🔄 Status Order

| Status | Keterangan |
|--------|-----------|
| pending | Menunggu konfirmasi |
| confirmed | Sudah dikonfirmasi admin |
| processing | Sedang diproses |
| shipped | Sudah dikirim |
| completed | Selesai |
| cancelled | Dibatalkan |

## 🛠️ Technical Details

### Supabase Configuration
```javascript
SUPABASE_URL = 'https://pmegvhlyabddfxxoyjrq.supabase.co'
SUPABASE_SERVICE_ROLE_KEY = [SECRET]
```

### Database Connection
```
Table: orders
Columns: 
  - id (UUID)
  - customer_name (text)
  - whatsapp (text)
  - email (text)
  - product (text)
  - quantity (number)
  - address (text)
  - note (text)
  - status (text) - enum: pending, confirmed, processing, shipped, completed, cancelled
  - created_at (timestamp)
```

### API Calls
- **Load Orders**: `supabase.from('orders').select('*').order('created_at', { ascending: false })`
- **Update Status**: `supabase.from('orders').update({ status }).eq('id', orderId)`

## 📝 Console Logs

Saat admin panel loading dan saat ubah status, check DevTools Console (F12) untuk melihat:
- ✅ Order loaded successfully
- ✅ Status update successful
- ❌ Error messages jika ada

## 🔒 Best Practices

1. **Jangan commit ke Git**: Tambahkan `js/admin.js` ke `.gitignore` jika ada key di dalamnya
2. **Setup .gitignore**:
   ```
   js/admin.js
   ADMIN_PANEL_README.md
   ```

3. **Production Security**: 
   - Implementasikan proper authentication
   - Gunakan JWT tokens dari Supabase Auth
   - Setup RLS policies untuk orders table
   - Jangan expose SERVICE_ROLE_KEY di frontend

4. **Environment Variables**:
   - Untuk production, simpan keys di environment variables
   - Gunakan backend untuk handle requests ke Supabase

## 📞 Support

Jika ada masalah:
1. Buka DevTools Console (F12) dan cek error messages
2. Pastikan Supabase SDK sudah loaded (check tab Network)
3. Pastikan credentials Supabase benar
4. Cek RLS policies pada tabel `orders` di Supabase dashboard

---

**Last Updated**: January 28, 2026
**Status**: ✅ Development (Local Use Only)

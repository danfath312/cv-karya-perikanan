# CV Karya Perikanan Indonesia

Website company profile modern dengan admin panel untuk CV Karya Perikanan Indonesia - perusahaan pengolahan hasil perikanan.

## 🌟 Features

### Website
- **Multi-page Design**
  - Homepage dengan hero section & CTA
  - About Us (Visi, Misi, Nilai)
  - Katalog Produk dinamis
  - Form Order terintegrasi WhatsApp
  - Halaman Kontak dengan maps & FAQ

- **Responsive & Mobile-Ready**
  - Touch-friendly UI
  - Meta tags untuk social sharing
  - Open Graph & Twitter cards

### Admin Panel
- **Dashboard Login** (Username/Password)
- **Product Management**
  - Tambah produk baru dengan foto
  - Edit info produk
  - Toggle ketersediaan (instant)
  - Update stock real-time
  - Delete produk
- **Company Info Management**
  - Update logo perusahaan
  - Edit kontak & alamat
  - Manage jam operasional
- **Upload Management**
  - Upload foto produk (max 5MB)
  - Upload logo perusahaan
  - Auto-preview sebelum save

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- npm atau yarn

### Installation

```powershell
# Clone atau download project
cd c:\Users\zidan\org-calendar-app

# Install dependencies
npm install sqlite3 express cors multer body-parser

# Setup database
node admin-setup.js

# Run server
node server.js
```

Server: http://localhost:3000  
Admin Panel: http://localhost:3000/admin.html

### Default Admin Credentials
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Ganti password setelah login pertama!**

## 🌐 Deployment ke Vercel

### Step 1: Upload ke GitHub

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repo di GitHub, lalu:
git remote add origin https://github.com/USERNAME/cv-karya-perikanan.git
git push -u origin main
```

### Step 2: Deploy ke Vercel

1. Buka https://vercel.com → Sign up dengan GitHub
2. **Import Project** → Pilih repository
3. **Add Vercel Postgres** database
4. Set environment variable `DATABASE_URL`
5. **Deploy!**

### Step 3: Migrate Database

```bash
# Jalankan migration ke Postgres
DATABASE_URL="your-vercel-postgres-url" node migrate-postgres.js
```

📖 **Panduan lengkap:** Lihat [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)

## 📁 Project Structure

```
cv-karya-perikanan/
├── public/
│   ├── css/
│   │   └── style.css          # Styling utama (responsive)
│   ├── js/
│   │   ├── script.js          # Website logic
│   │   └── admin.js           # Admin panel logic
│   └── images/                # Upload folder
│       └── logo.png
├── index.html                 # Homepage
├── about.html                 # About page
├── produk.html                # Product catalog
├── order.html                 # Order form
├── contact.html               # Contact page
├── admin.html                 # Admin dashboard
├── server.js                  # Express server
├── admin-routes.js            # API endpoints
├── admin-setup.js             # SQLite setup (local)
├── migrate-postgres.js        # Postgres migration (production)
├── package.json
├── vercel.json                # Vercel config
└── .gitignore
```

## 🛠️ Tech Stack

**Frontend:**
- HTML5 (Semantic)
- CSS3 (Custom responsive design)
- JavaScript (Vanilla ES6+)
- Font Awesome 6.4.0
- Google Fonts (Poppins)

**Backend:**
- Node.js 18+
- Express.js
- SQLite3 (local) / PostgreSQL (production)
- Multer (file uploads)
- CORS

## 📝 API Endpoints

### Public
- `GET /` - Homepage

### Admin (Authentication required)
- `POST /api/admin/login` - Login
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/availability` - Toggle availability
- `PATCH /api/products/:id/stock` - Update stock
- `GET /api/company` - Get company info
- `PUT /api/company` - Update company info

## 🔒 Security Notes

**Current Implementation:**
- Basic authentication (username/password)
- Token-based session
- File upload validation

**Production Recommendations:**
- Implement bcrypt password hashing
- Use JWT for authentication
- Add rate limiting
- Enable HTTPS only
- Regular security audits

## 📱 Responsive Breakpoints

- **Mobile:** 320px - 480px
- **Tablet:** 481px - 968px
- **Desktop:** 969px+

## 🎨 Color Palette

- Primary Blue: `#0066B3`
- Dark Blue: `#004C8C`
- Accent Gold: `#FFD700`
- Success Green: `#5CB85C`
- Light Gray: `#F8F9FA`

## 🧪 Testing

```bash
# Test server
curl http://localhost:3000

# Test admin login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 📞 Support

**CV Karya Perikanan Indonesia**
- Email: info@karyaperikanan.com
- WhatsApp: +62 812-3456-7890
- Phone: 0812-3456-7890
- Address: Jl. Perikanan No. 123, Jakarta

## 📄 Documentation

- [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) - Panduan deploy lengkap
- [SETUP_ADMIN.md](SETUP_ADMIN.md) - Setup admin panel
- [QUICK_START.txt](QUICK_START.txt) - Quick reference
- [VISUAL_GUIDE.txt](VISUAL_GUIDE.txt) - Visual guide admin panel

## 🙏 Credits

Developed for CV Karya Perikanan Indonesia  
Made with ❤️ using modern web technologies

---

**Version:** 1.0.0  
**Last Updated:** January 2026

// =====================================================
// TAMBAHKAN KOD INI KE AKHIR server.js
// (Sebelum app.listen pada baris terakhir)
// =====================================================

// ===== IMPORT ADMIN ROUTES =====
const adminRoutes = require('./admin-routes');
app.use(adminRoutes);

// Serve static files dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Serve images dari folder public/images
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
app.use('/images', express.static(imagesDir));

// ===== SERVE ADMIN PANEL =====
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// ===== UPDATE PORT (JALANKAN DI AKHIR) =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║   🐟 CV KARYA PERIKANAN INDONESIA - SERVER RUNNING        ║
╚════════════════════════════════════════════════════════════╝

🚀 Server: http://localhost:${PORT}
📊 Admin Panel: http://localhost:${PORT}/admin.html
🌐 Website: http://localhost:${PORT}

📝 Default Admin:
   Username: admin
   Password: admin123

💡 Tips:
   - Buka admin panel untuk manage produk
   - Upload foto dan logo melalui panel admin
   - Data tersimpan di database SQLite (data.db)
    `);
});

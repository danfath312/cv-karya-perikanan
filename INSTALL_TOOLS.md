⚙️ INSTALL SEMUA TOOLS YANG DIBUTUHKAN
============================================

Untuk deploy website ke GitHub & Vercel, Anda perlu 3 tools:
1. Node.js + npm
2. Git
3. Vercel CLI (optional)

---

## 📥 STEP 1: INSTALL NODE.JS

### Download Manual:
1. Buka: https://nodejs.org/
2. Download **LTS version** (v20.x)
3. Klik installer `.msi`
4. Install dengan default settings
5. Restart PowerShell

### Verify Installation:
```powershell
node --version
npm --version
```

Expected output:
```
v20.10.0
10.2.3
```

---

## 📥 STEP 2: INSTALL GIT

### Download Manual:
1. Buka: https://git-scm.com/download/win
2. Download **64-bit Git for Windows**
3. Jalankan installer
4. **PENTING:** Pilih "Git from the command line and also from 3rd-party software"
5. Install dengan settings default
6. Restart PowerShell

### Verify Installation:
```powershell
git --version
```

Expected output:
```
git version 2.43.0.windows.1
```

### Configure Git (First time):
```powershell
git config --global user.name "Nama Anda"
git config --global user.email "email@anda.com"
```

---

## 📥 STEP 3: INSTALL VERCEL CLI (Optional)

Setelah Node.js terinstall:

```powershell
npm install -g vercel
```

Verify:
```powershell
vercel --version
```

**Note:** Vercel CLI opsional. Anda tetap bisa deploy via website Vercel.

---

## ✅ VERIFICATION CHECKLIST

Setelah install semua, jalankan:

```powershell
node --version
npm --version
git --version
```

Jika semua command berhasil, Anda siap deploy! ✨

---

## 🚀 SETELAH INSTALL

### Langkah berikutnya:

1. **Setup Project Dependencies**
   ```powershell
   cd c:\Users\zidan\org-calendar-app
   npm install sqlite3 express cors multer body-parser
   ```

2. **Initialize Git**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Upload ke GitHub**
   - Buat repository di GitHub
   - Push code

4. **Deploy ke Vercel**
   - Import dari GitHub
   - Configure & Deploy

---

## ⚠️ TROUBLESHOOTING

### Problem: Command not found setelah install
**Solution:** 
- Restart PowerShell
- Atau restart komputer
- Check PATH environment variable

### Problem: npm install lambat
**Solution:**
- Gunakan koneksi internet stabil
- Atau ganti registry: `npm config set registry https://registry.npmmirror.com`

### Problem: Git push meminta password terus
**Solution:**
- Gunakan Personal Access Token (bukan password)
- Atau setup SSH key untuk GitHub

---

## 📚 RESOURCES

- Node.js Download: https://nodejs.org/
- Git Download: https://git-scm.com/
- GitHub: https://github.com/
- Vercel: https://vercel.com/
- GitHub Token Guide: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

---

## ⏱️ TOTAL WAKTU INSTALL

- Node.js: ~3 menit
- Git: ~2 menit  
- Vercel CLI: ~1 menit
- Total: ~6 menit

Setelah install, deployment ~10 menit!

---

🎯 **READY TO START?**

Ikuti langkah di atas, lalu lanjut ke file:
→ GITHUB_VERCEL_COMMANDS.md

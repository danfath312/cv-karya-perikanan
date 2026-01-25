@echo off
REM =====================================================
REM Quick Start Admin Panel - CV Karya Perikanan Indonesia
REM =====================================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   🐟 CV KARYA PERIKANAN INDONESIA - SETUP ADMIN PANEL     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js tidak terinstall!
    echo Silakan install dari: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js terdeteksi

REM Navigate to app directory
cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo.
    echo 📦 Menginstall dependencies...
    call npm install sqlite3 express cors multer
    if errorlevel 1 (
        echo ❌ Error saat install dependencies!
        pause
        exit /b 1
    )
    echo ✓ Dependencies berhasil diinstall
)

REM Setup database
echo.
echo 🗄️ Setup Database...
call node admin-setup.js
if errorlevel 1 (
    echo ❌ Error saat setup database!
    pause
    exit /b 1
)

echo.
echo ✅ Setup selesai!
echo.
echo 🚀 Menjalankan server...
echo.
call node server.js
pause

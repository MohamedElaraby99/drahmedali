@echo off
echo 🚀 Creating Super Admin User...
echo ================================
echo.

cd /d "%~dp0.."
node scripts/create-super-admin.js

echo.
echo Press any key to exit...
pause >nul

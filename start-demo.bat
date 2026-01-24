@echo off
TITLE V-CTRIP Demo Launcher
echo ========================================================
echo       🚀 Starting V-CTRIP Platform for Demo
echo ========================================================
echo.

:: 1. Start Backend
echo [1/3] 🌱 Starting Backend Server...
start "V-CTRIP Backend" cmd /k "cd /d "%~dp0backend" && echo Starting NestJS... && npm run start:dev"

:: Wait for backend to initialize (approx 5 seconds)
timeout /t 8 /nobreak >nul

:: 2. Start Frontend
echo [2/3] 🎨 Starting Frontend Client...
start "V-CTRIP Frontend" cmd /k "cd /d "%~dp0frontend" && echo Starting React/Vite... && npm run dev"

:: Wait for frontend
timeout /t 5 /nobreak >nul

:: 3. Launch Browser
echo [3/3] 🌐 Launching Browser...
start http://localhost:5173

echo.
echo ✅ Demo Environment Running!
echo    - Backend: http://localhost:3000
echo    - Frontend: http://localhost:5173
echo.
echo Press any key to exit this launcher (Servers will keep running)...
pause

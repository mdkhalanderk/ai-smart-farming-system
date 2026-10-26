@echo off
TITLE Smart Crop Advisory - Precision Agriculture Platform Launcher
echo =====================================================================
echo    SMART CROP ADVISORY - PRECISION AGRICULTURE PLATFORM
echo =====================================================================
echo [1/3] Verifying Python & Node.js environment...

REM Find Python executable
IF EXIST "..\.venv\Scripts\python.exe" (
    SET "PY_CMD=..\.venv\Scripts\python.exe"
) ELSE IF EXIST ".venv\Scripts\python.exe" (
    SET "PY_CMD=.venv\Scripts\python.exe"
) ELSE (
    SET "PY_CMD=python"
)

echo Python Command: %PY_CMD%

echo [2/3] Launching FastAPI Backend on http://127.0.0.1:8000...
start "CropAdvisory-Backend" cmd /k "%PY_CMD% -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload"

echo [3/3] Launching Vite React Frontend on http://localhost:5173...
start "CropAdvisory-Frontend" cmd /k "npm --prefix frontend run dev"

echo.
echo =====================================================================
echo  Services Starting:
echo   - Backend API:    http://127.0.0.1:8000
echo   - API Swagger:    http://127.0.0.1:8000/docs
echo   - Frontend UI:    http://localhost:5173
echo =====================================================================
echo.
timeout /t 3 >nul
start http://localhost:5173
echo System running. Close launcher or child command windows to terminate.
pause

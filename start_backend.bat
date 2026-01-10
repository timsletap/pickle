@echo off
echo ========================================
echo   Baseball App Backend Server
echo ========================================
echo.

echo [1/3] Stopping any running Python servers...
taskkill /F /IM python.exe >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo   - Stopped existing Python processes
) else (
    echo   - No existing Python processes found
)

echo.
echo [2/3] Waiting for ports to free up...
timeout /t 3 /nobreak >nul
echo   - Ready to start

echo.
echo [3/3] Starting FastAPI server on port 8000...
cd backend
echo   - Server URL: http://localhost:8000
echo   - Press Ctrl+C to stop the server
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

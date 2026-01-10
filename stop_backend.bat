@echo off
echo Stopping all backend servers...
taskkill /F /IM python.exe >nul 2>&1

if %ERRORLEVEL% == 0 (
    echo Backend servers stopped successfully!
) else (
    echo No backend servers were running.
)

pause

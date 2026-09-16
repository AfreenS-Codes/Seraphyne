@echo off
echo Starting Seraphyne Clinical Reasoning Platform...

echo [1/3] Launching Clinical Engine on port 8010...
start /b python -m uvicorn app.main:app --host 127.0.0.1 --port 8010
timeout /t 2 /nobreak >nul

echo [2/3] Launching Backend on port 4000...
cd /d "%~dp0..\backend"
start /b npm run dev
timeout /t 3 /nobreak >nul

call npm run seed

echo [3/3] Hosting Frontend on port 5173...
cd /d "%~dp0..\frontend"
start /b npm run preview -- --port 5173 --host 0.0.0.0

echo.
echo ===================================================
echo SERAPHYNE is now live and hosted at http://localhost:5173
echo ===================================================

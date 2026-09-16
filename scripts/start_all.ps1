# SERAPHYNE Startup Script
Write-Host "Starting Seraphyne Clinical Reasoning Platform..." -ForegroundColor Cyan

# 1. Clinical Engine (Port 8010)
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8010" -WorkingDirectory (Join-Path $PSScriptRoot "..\clinical-engine")
Write-Host "[1/3] Clinical Engine launched on http://127.0.0.1:8010" -ForegroundColor Green

# 2. Backend (Port 4000)
Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory (Join-Path $PSScriptRoot "..\backend")
Write-Host "[2/3] Backend Server launched on http://localhost:4000" -ForegroundColor Green

# Wait 3 seconds for backend to initialize
Start-Sleep -Seconds 3

# Seed demo data
Start-Process -Wait -NoNewWindow -FilePath "npm.cmd" -ArgumentList "run seed" -WorkingDirectory (Join-Path $PSScriptRoot "..\backend")
Write-Host "[*] Demo session verified and seeded." -ForegroundColor Green

# 3. Frontend Hosting (Port 5173)
Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "run preview -- --port 5173 --host 0.0.0.0" -WorkingDirectory (Join-Path $PSScriptRoot "..\frontend")
Write-Host "[3/3] Frontend hosted on http://localhost:5173" -ForegroundColor Green

Write-Host "`nSERAPHYNE is now live and hosted at http://localhost:5173" -ForegroundColor Yellow

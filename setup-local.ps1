# V-CTRIP Automatic Project Setup
# This script configures the local environment without modifying version-controlled source files.

Clear-Host
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "V-CTRIP: Veritas Cyber Threat Platform Setup" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Check for Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed. Please install it from https://nodejs.org/" -ForegroundColor Red
    exit
}

# 2. Base Configuration
$RootPath = Get-Location
$BackendPath = Join-Path $RootPath "backend"
$FrontendPath = Join-Path $RootPath "frontend"

# 3. Database Password Collection
Write-Host "`nDatabase Configuration:" -ForegroundColor Yellow
$DbPass = Read-Host "Enter your PostgreSQL 'postgres' user password"
$EscapedPass = [uri]::EscapeDataString($DbPass)
$DbUrl = "postgresql://postgres:$($EscapedPass)@localhost:5432/vctrip"

# 4. Setup Backend Environment
Write-Host "`nSetting up Backend..." -ForegroundColor Yellow
Set-Location $BackendPath

if (!(Test-Path ".env")) {
    Write-Host "  - Creating .env file..."
    $EnvContent = "DATABASE_URL=`"$DbUrl`"`n"
    $EnvContent += "PORT=3000`n"
    $EnvContent += "NODE_ENV=development`n"
    $EnvContent += "JWT_SECRET=dev-secret-key-replace-in-production`n"
    $EnvContent | Out-File -FilePath ".env" -Encoding utf8
}

Write-Host "  - Installing dependencies (this may take a minute)..."
npm install --quiet

Write-Host "  - Generating Prisma Client..."
npx prisma generate

Write-Host "  - Setting up Database tables..."
try {
    npx prisma db push --accept-data-loss
}
catch {
    Write-Host "  Warning: Database push failed. Make sure PostgreSQL is running and you have created the 'vctrip' database." -ForegroundColor Red
}

Write-Host "  - Seeding Demo Data..."
npx ts-node prisma/seed-demo.ts

# 5. Setup Frontend Environment
Write-Host "`nSetting up Frontend..." -ForegroundColor Yellow
Set-Location $FrontendPath

if (!(Test-Path ".env")) {
    Write-Host "  - Creating .env file..."
    "VITE_API_URL=http://localhost:3000/api/v1" | Out-File -FilePath ".env" -Encoding utf8
}

Write-Host "  - Installing dependencies..."
npm install --quiet

# 6. Final Steps
Set-Location $RootPath
Write-Host "`nSETUP COMPLETE!" -ForegroundColor Green
Write-Host "===================================================="
Write-Host "HOW TO RUN THE PROJECT:" -ForegroundColor Cyan
Write-Host "1. In terminal 1 (Backend):"
Write-Host "   cd backend; npm run start:dev"
Write-Host "2. In terminal 2 (Frontend):"
Write-Host "   cd frontend; npm run dev"
Write-Host "===================================================="
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

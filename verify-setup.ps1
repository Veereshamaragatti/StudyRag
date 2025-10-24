# 🔍 StudyRAG Setup Verification Script

Write-Host ""
Write-Host "🎓 StudyRAG - Setup Verification" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeMajor -ge 18) {
        Write-Host "✅ Node.js $nodeVersion (OK)" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js $nodeVersion is too old. Need 18+" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    $errors++
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion (OK)" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    $errors++
}

# Check .env file
Write-Host ""
Write-Host "Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    
    $env:content = Get-Content .env -Raw
    
    $requiredVars = @(
        "MONGO_URI",
        "GEMINI_API_KEY",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "JWT_SECRET",
        "SESSION_SECRET"
    )
    
    foreach ($var in $requiredVars) {
        if ($env:content -match "$var=.+") {
            Write-Host "  ✅ $var is set" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $var is missing or empty" -ForegroundColor Red
            $errors++
        }
    }
} else {
    Write-Host "❌ .env file not found in root directory" -ForegroundColor Red
    $errors++
}

# Check backend structure
Write-Host ""
Write-Host "Checking backend structure..." -ForegroundColor Yellow
$backendFiles = @(
    "backend/package.json",
    "backend/tsconfig.json",
    "backend/src/index.ts",
    "backend/src/config/env.ts",
    "backend/src/db/mongo.ts"
)

foreach ($file in $backendFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file missing" -ForegroundColor Red
        $errors++
    }
}

# Check backend dependencies
Write-Host ""
Write-Host "Checking backend dependencies..." -ForegroundColor Yellow
if (Test-Path "backend/node_modules") {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend dependencies not installed. Run: cd backend; npm install" -ForegroundColor Yellow
    $warnings++
}

# Check frontend structure
Write-Host ""
Write-Host "Checking frontend structure..." -ForegroundColor Yellow
$frontendFiles = @(
    "frontend/package.json",
    "frontend/tsconfig.json",
    "frontend/next.config.js",
    "frontend/app/layout.tsx",
    "frontend/app/page.tsx"
)

foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file missing" -ForegroundColor Red
        $errors++
    }
}

# Check frontend dependencies
Write-Host ""
Write-Host "Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend/node_modules") {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend dependencies not installed. Run: cd frontend; npm install" -ForegroundColor Yellow
    $warnings++
}

# Check uploads directory
Write-Host ""
Write-Host "Checking uploads directory..." -ForegroundColor Yellow
if (!(Test-Path "backend/uploads")) {
    New-Item -ItemType Directory -Path "backend/uploads" -Force | Out-Null
    Write-Host "✅ Created backend/uploads directory" -ForegroundColor Green
}
if (!(Test-Path "backend/uploads/temp")) {
    New-Item -ItemType Directory -Path "backend/uploads/temp" -Force | Out-Null
    Write-Host "✅ Created backend/uploads/temp directory" -ForegroundColor Green
}

# Test MongoDB connection (basic check)
Write-Host ""
Write-Host "Checking MongoDB URI format..." -ForegroundColor Yellow
if ($env:content -match "mongodb\+srv://.*:.*@.*\.mongodb\.net") {
    Write-Host "✅ MongoDB URI format looks correct" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB URI format might be incorrect" -ForegroundColor Yellow
    $warnings++
}

# Test Gemini API key format
Write-Host ""
Write-Host "Checking Gemini API key format..." -ForegroundColor Yellow
if ($env:content -match "GEMINI_API_KEY=AIza[A-Za-z0-9_-]{35}") {
    Write-Host "✅ Gemini API key format looks correct" -ForegroundColor Green
} else {
    Write-Host "⚠️  Gemini API key format might be incorrect" -ForegroundColor Yellow
    $warnings++
}

# Summary
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "🎉 Everything looks good!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Open two terminals" -ForegroundColor Gray
    Write-Host "2. Terminal 1: cd backend; npm install; npm run dev" -ForegroundColor Gray
    Write-Host "3. Terminal 2: cd frontend; npm install; npm run dev" -ForegroundColor Gray
    Write-Host "4. Visit: http://localhost:3000/login" -ForegroundColor Gray
} elseif ($errors -eq 0) {
    Write-Host "⚠️  Setup is mostly complete with $warnings warning(s)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please address the warnings above before running." -ForegroundColor Yellow
} else {
    Write-Host "❌ Found $errors error(s) and $warnings warning(s)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the errors above before continuing." -ForegroundColor Red
    Write-Host "Check TROUBLESHOOTING.md for help." -ForegroundColor Yellow
}

Write-Host ""

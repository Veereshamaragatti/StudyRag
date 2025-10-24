# 🚀 StudyRAG Quick Start Guide

Write-Host "🎓 StudyRAG - Academic RAG System" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install

Write-Host ""
Write-Host "📦 Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location ../frontend
npm install

Write-Host ""
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🏃‍♂️ To start the application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend (Terminal 1):" -ForegroundColor White
Write-Host "  cd backend" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  Frontend (Terminal 2):" -ForegroundColor White
Write-Host "  cd frontend" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "📱 Then visit: http://localhost:3000/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Read README.md for full documentation" -ForegroundColor Yellow

Set-Location ..

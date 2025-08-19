# TKA Web App - Comprehensive Validation Script (PowerShell)
# 
# This script runs all type checks, linting, tests, and validations
# to ensure the codebase is in perfect condition.
# 
# Usage:
#   .\validate-all.ps1
#   npm run validate:all

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TKA Web App Validator                     ║" -ForegroundColor Cyan
Write-Host "║              Comprehensive Quality Assurance                 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Change to the web directory if not already there
if (!(Test-Path "package.json")) {
    if (Test-Path "web\package.json") {
        Set-Location "web"
        Write-Host "Changed to web directory" -ForegroundColor Yellow
    } else {
        Write-Host "Error: Could not find package.json. Please run from TKA project root or web directory." -ForegroundColor Red
        exit 1
    }
}

# Run the Node.js validation script
Write-Host "Running comprehensive validation..." -ForegroundColor Blue
Write-Host ""

try {
    npm run validate:all
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "🎉 PowerShell wrapper completed successfully! 🎉" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "💥 Validation failed with exit code: $exitCode 💥" -ForegroundColor Red
        exit $exitCode
    }
} catch {
    Write-Host "Error running validation: $_" -ForegroundColor Red
    exit 1
}

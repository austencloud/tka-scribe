# Chrome Complete Reinstall Script
# Requires Administrator privileges

Write-Host "Chrome Complete Reinstall Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check for admin privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/6] Stopping Chrome processes..." -ForegroundColor Yellow
Get-Process -Name "chrome" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "[2/6] Uninstalling Chrome..." -ForegroundColor Yellow
$uninstallers = @(
    "${env:ProgramFiles}\Google\Chrome\Application\*\Installer\setup.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\*\Installer\setup.exe",
    "${env:LocalAppData}\Google\Chrome\Application\*\Installer\setup.exe"
)

foreach ($pattern in $uninstallers) {
    $setupExe = Get-Item $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($setupExe) {
        Write-Host "  Found uninstaller: $($setupExe.FullName)" -ForegroundColor Gray
        Start-Process -FilePath $setupExe.FullName -ArgumentList "--uninstall", "--force-uninstall", "--system-level" -Wait -NoNewWindow
        break
    }
}

Write-Host "[3/6] Removing Chrome directories..." -ForegroundColor Yellow
$chromeDirs = @(
    "${env:ProgramFiles}\Google\Chrome",
    "${env:ProgramFiles(x86)}\Google\Chrome",
    "${env:LocalAppData}\Google\Chrome",
    "${env:AppData}\Google\Chrome"
)

foreach ($dir in $chromeDirs) {
    if (Test-Path $dir) {
        Write-Host "  Removing: $dir" -ForegroundColor Gray
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "[4/6] Cleaning registry entries..." -ForegroundColor Yellow
$regPaths = @(
    "HKCU:\Software\Google\Chrome",
    "HKLM:\Software\Google\Chrome",
    "HKLM:\Software\Wow6432Node\Google\Chrome"
)

foreach ($regPath in $regPaths) {
    if (Test-Path $regPath) {
        Write-Host "  Removing: $regPath" -ForegroundColor Gray
        Remove-Item -Path $regPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "[5/6] Downloading Chrome installer..." -ForegroundColor Yellow
$installerPath = "$env:TEMP\ChromeSetup.exe"
$downloadUrl = "https://dl.google.com/chrome/install/latest/chrome_installer.exe"

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "  Download complete!" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Failed to download Chrome installer!" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "[6/6] Installing Chrome..." -ForegroundColor Yellow
Start-Process -FilePath $installerPath -ArgumentList "/silent", "/install" -Wait -NoNewWindow

Write-Host ""
Write-Host "Cleaning up installer..." -ForegroundColor Yellow
Remove-Item -Path $installerPath -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Chrome has been successfully reinstalled!" -ForegroundColor Green
Write-Host "You can now launch Chrome from your Start menu or desktop." -ForegroundColor Cyan

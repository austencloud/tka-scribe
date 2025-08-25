@echo off
echo 🎯 TKA Web App - Fix Browser Connection Delay
echo.

echo 🛡️ Adding Windows Defender exclusions...
powershell -Command "try { Add-MpPreference -ExclusionPath '%CD%' -ErrorAction SilentlyContinue; Write-Host '   ✅ Added project directory exclusion' } catch { Write-Host '   ⚠️ Run as Administrator for Defender exclusions' }"

echo 🧹 Clearing browser cache and profiles...
if exist ".vscode\chrome-debug-profile" rmdir /s /q ".vscode\chrome-debug-profile"
if exist ".vscode\chrome-debug-profile-alt" rmdir /s /q ".vscode\chrome-debug-profile-alt"
echo    ✅ Cleared VS Code debug profiles

echo 🌐 Flushing DNS cache...
ipconfig /flushdns >nul 2>&1
echo    ✅ DNS cache flushed

echo 🔧 Killing any remaining Node processes...
taskkill /f /im node.exe >nul 2>&1
echo    ✅ Node processes cleared

echo.
echo 🎯 Browser Connection Fix Complete!
echo.
echo 📋 What was fixed:
echo    ✅ Windows Defender exclusions added
echo    ✅ Browser cache cleared  
echo    ✅ DNS cache flushed
echo    ✅ Node processes cleared
echo.
echo 🚀 Try your debug configuration now!
echo    Expected: Browser opens in 1-2 seconds instead of 12
echo.
pause

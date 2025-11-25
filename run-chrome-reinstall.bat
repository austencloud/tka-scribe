@echo off
:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with Administrator privileges...
    powershell -ExecutionPolicy Bypass -File "%~dp0reinstall-chrome.ps1"
    pause
) else (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
)

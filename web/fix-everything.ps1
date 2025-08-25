# TKA Web App - Fix Everything Script
# Comprehensive fix for startup delays and injectable errors

Write-Host "🚀 TKA Web App - Fix Everything Script" -ForegroundColor Green
Write-Host ""

# 1. Kill ALL Node.js processes (nuclear option)
Write-Host "💀 Killing ALL Node.js processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ Killed all Node.js processes" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No Node.js processes to kill" -ForegroundColor Yellow
}

# 2. Kill processes on ports 5173-5180
Write-Host "🔪 Killing processes on ports 5173-5180..." -ForegroundColor Yellow
for ($port = 5173; $port -le 5180; $port++) {
    $connections = netstat -ano | Select-String ":$port.*LISTENING"
    foreach ($connection in $connections) {
        $parts = $connection.ToString().Split(' ', [StringSplitOptions]::RemoveEmptyEntries)
        $pid = $parts[-1]
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "   ✅ Killed process $pid on port $port" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Could not kill process $pid" -ForegroundColor Yellow
        }
    }
}

# 3. Clear Chrome debug profiles
Write-Host "🧹 Clearing Chrome debug profiles..." -ForegroundColor Yellow
$profiles = @(".vscode\chrome-debug-profile", ".vscode\chrome-debug-profile-alt")
foreach ($profile in $profiles) {
    if (Test-Path $profile) {
        Remove-Item -Recurse -Force $profile
        Write-Host "   ✅ Removed $profile" -ForegroundColor Green
    }
}

# 4. Fix injectable imports
Write-Host "🔧 Fixing injectable imports..." -ForegroundColor Yellow
$serviceFiles = @(
    "src\lib\services\implementations\movement\PositionMapper.ts",
    "src\lib\services\implementations\export\ThumbnailService.ts", 
    "src\lib\services\implementations\navigation\NavigationService.ts",
    "src\lib\services\implementations\browse\BrowseService.ts",
    "src\lib\services\implementations\browse\FavoritesService.ts",
    "src\lib\services\implementations\sequence\SequenceImportService.ts"
)

$fixedCount = 0
foreach ($file in $serviceFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $modified = $false
        
        # Check if has @injectable() but missing import
        if ($content -match '@injectable\(\)' -and $content -notmatch 'import \{ injectable \}') {
            # Find first import line
            if ($content -match '^import.*from.*[''"];$') {
                $firstImport = $matches[0]
                $insertPoint = $content.IndexOf($firstImport) + $firstImport.Length
                $content = $content.Substring(0, $insertPoint) + "`nimport { injectable } from `"inversify`";" + $content.Substring($insertPoint)
                $modified = $true
            }
        }
        
        # Check if has import but missing decorator
        if ($content -match 'import \{ injectable \}' -and $content -notmatch '@injectable\(\)') {
            $content = $content -replace '^export class (\w+)', '@injectable()$1export class $1'
            $modified = $true
        }
        
        if ($modified) {
            Set-Content $file $content -NoNewline
            Write-Host "   ✅ Fixed $file" -ForegroundColor Green
            $fixedCount++
        }
    }
}
Write-Host "🎉 Fixed $fixedCount injectable files" -ForegroundColor Green

# 5. Clear npm cache
Write-Host "🧹 Clearing npm cache..." -ForegroundColor Yellow
try {
    npm cache clean --force 2>$null
    Write-Host "✅ Cleared npm cache" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not clear npm cache" -ForegroundColor Yellow
}

# 6. Wait a moment for processes to fully terminate
Write-Host "⏳ Waiting for processes to terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# 7. Test startup time
Write-Host "🚀 Testing startup time..." -ForegroundColor Yellow
Write-Host "Starting dev server..." -ForegroundColor Cyan

$startTime = Get-Date
$devProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru -RedirectStandardOutput "dev-output.log" -RedirectStandardError "dev-error.log"

# Wait for server to be ready (check for "ready in" message)
$timeout = 30
$elapsed = 0
$ready = $false

while ($elapsed -lt $timeout -and !$ready) {
    Start-Sleep -Seconds 1
    $elapsed++
    
    if (Test-Path "dev-output.log") {
        $output = Get-Content "dev-output.log" -Raw -ErrorAction SilentlyContinue
        if ($output -match "ready in") {
            $ready = $true
            $endTime = Get-Date
            $duration = ($endTime - $startTime).TotalSeconds
            Write-Host "✅ Server ready in $([math]::Round($duration, 2)) seconds!" -ForegroundColor Green
            
            # Extract port number
            if ($output -match "localhost:(\d+)") {
                $port = $matches[1]
                Write-Host "🌐 Server running on http://localhost:$port" -ForegroundColor Cyan
            }
        }
    }
}

if (!$ready) {
    Write-Host "❌ Server did not start within $timeout seconds" -ForegroundColor Red
    if (Test-Path "dev-error.log") {
        $errors = Get-Content "dev-error.log" -Raw
        if ($errors) {
            Write-Host "Errors:" -ForegroundColor Red
            Write-Host $errors -ForegroundColor Red
        }
    }
}

# Kill the dev process
try {
    Stop-Process -Id $devProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "🛑 Stopped dev server" -ForegroundColor Yellow
} catch {}

# Cleanup log files
Remove-Item "dev-output.log", "dev-error.log" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎯 Fix Everything script complete!" -ForegroundColor Green
Write-Host "Try running your debug configuration now - it should be much faster!" -ForegroundColor Cyan

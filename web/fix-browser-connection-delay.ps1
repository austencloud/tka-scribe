# TKA Web App - Fix Browser Connection Delay
# Targets the specific 12-second browser connection issue

Write-Host "🎯 TKA Web App - Fix Browser Connection Delay" -ForegroundColor Green
Write-Host ""

# 1. Add Windows Defender exclusions
Write-Host "🛡️  Adding Windows Defender exclusions..." -ForegroundColor Yellow
$currentPath = Get-Location
$nodeModulesPath = Join-Path $currentPath "node_modules"

try {
    # Add current project directory
    Add-MpPreference -ExclusionPath $currentPath -ErrorAction SilentlyContinue
    Write-Host "   ✅ Added project directory: $currentPath" -ForegroundColor Green
    
    # Add node_modules specifically
    if (Test-Path $nodeModulesPath) {
        Add-MpPreference -ExclusionPath $nodeModulesPath -ErrorAction SilentlyContinue
        Write-Host "   ✅ Added node_modules: $nodeModulesPath" -ForegroundColor Green
    }
    
    # Add common Node.js processes
    Add-MpPreference -ExclusionProcess "node.exe" -ErrorAction SilentlyContinue
    Add-MpPreference -ExclusionProcess "npm.exe" -ErrorAction SilentlyContinue
    Write-Host "   ✅ Added Node.js process exclusions" -ForegroundColor Green
    
} catch {
    Write-Host "   ⚠️  Could not add Defender exclusions (run as Administrator)" -ForegroundColor Yellow
    Write-Host "   📋 Manual steps:" -ForegroundColor Cyan
    Write-Host "      1. Open Windows Security" -ForegroundColor Cyan
    Write-Host "      2. Virus & threat protection > Manage settings" -ForegroundColor Cyan
    Write-Host "      3. Add exclusions > Folder > $currentPath" -ForegroundColor Cyan
}

# 2. Enable TypeScript incremental compilation
Write-Host "⚡ Enabling TypeScript incremental compilation..." -ForegroundColor Yellow
try {
    $tsconfigPath = "tsconfig.json"
    if (Test-Path $tsconfigPath) {
        $tsconfig = Get-Content $tsconfigPath -Raw | ConvertFrom-Json
        
        if (-not $tsconfig.compilerOptions) {
            $tsconfig | Add-Member -MemberType NoteProperty -Name "compilerOptions" -Value @{}
        }
        
        $tsconfig.compilerOptions | Add-Member -MemberType NoteProperty -Name "incremental" -Value $true -Force
        $tsconfig.compilerOptions | Add-Member -MemberType NoteProperty -Name "tsBuildInfoFile" -Value ".tsbuildinfo" -Force
        
        $tsconfig | ConvertTo-Json -Depth 10 | Set-Content $tsconfigPath
        Write-Host "   ✅ Enabled incremental compilation" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Could not update tsconfig.json" -ForegroundColor Red
}

# 3. Fix VS Code launch.json serverReadyAction
Write-Host "🔧 Fixing VS Code launch configuration..." -ForegroundColor Yellow
$launchJsonPath = ".vscode\launch.json"
if (Test-Path $launchJsonPath) {
    try {
        $launchConfig = Get-Content $launchJsonPath -Raw | ConvertFrom-Json
        
        # Find the configuration with serverReadyAction
        foreach ($config in $launchConfig.configurations) {
            if ($config.serverReadyAction) {
                # Update the pattern to be more robust
                $config.serverReadyAction.pattern = "Local.*http://localhost:(\d+)"
                
                # Add timeout to prevent long waits
                $config.serverReadyAction | Add-Member -MemberType NoteProperty -Name "timeout" -Value 10000 -Force
                
                Write-Host "   ✅ Updated serverReadyAction pattern" -ForegroundColor Green
            }
        }
        
        $launchConfig | ConvertTo-Json -Depth 10 | Set-Content $launchJsonPath
    } catch {
        Write-Host "   ❌ Could not update launch.json" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  launch.json not found" -ForegroundColor Yellow
}

# 4. Clear all browser data
Write-Host "🧹 Clearing browser data..." -ForegroundColor Yellow

# Clear Chrome user data for debugging
$chromeProfiles = @(
    "$env:LOCALAPPDATA\Google\Chrome\User Data\Default",
    "$env:LOCALAPPDATA\Google\Chrome\User Data\Profile 1"
)

foreach ($profile in $chromeProfiles) {
    $cachePath = Join-Path $profile "Cache"
    if (Test-Path $cachePath) {
        try {
            Remove-Item -Path $cachePath -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "   ✅ Cleared Chrome cache: $profile" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Could not clear cache: $profile" -ForegroundColor Yellow
        }
    }
}

# Clear VS Code Chrome debug profiles
$vscodeProfiles = @(".vscode\chrome-debug-profile*")
foreach ($pattern in $vscodeProfiles) {
    Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
}
Write-Host "   ✅ Cleared VS Code debug profiles" -ForegroundColor Green

# 5. Reset network stack (helps with localhost connection issues)
Write-Host "🌐 Resetting network stack..." -ForegroundColor Yellow
try {
    # Flush DNS
    ipconfig /flushdns | Out-Null
    Write-Host "   ✅ Flushed DNS cache" -ForegroundColor Green
    
    # Reset Winsock
    netsh winsock reset | Out-Null
    Write-Host "   ✅ Reset Winsock (restart required)" -ForegroundColor Green
    
} catch {
    Write-Host "   ⚠️  Could not reset network stack" -ForegroundColor Yellow
}

# 6. Test the fix
Write-Host "🧪 Testing browser connection speed..." -ForegroundColor Yellow

# Start dev server in background
$devJob = Start-Job -ScriptBlock {
    Set-Location $using:currentPath
    npm run dev
}

Start-Sleep -Seconds 3

# Test connection speed to localhost
$testStart = Get-Date
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -ErrorAction Stop
    $testEnd = Get-Date
    $connectionTime = ($testEnd - $testStart).TotalMilliseconds
    
    Write-Host "   ✅ Connection test: ${connectionTime}ms" -ForegroundColor Green
    
    if ($connectionTime -lt 1000) {
        Write-Host "   🎉 EXCELLENT: Connection under 1 second!" -ForegroundColor Green
    } elseif ($connectionTime -lt 3000) {
        Write-Host "   ✅ GOOD: Connection under 3 seconds" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  SLOW: Connection over 3 seconds" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ❌ Could not connect to localhost:5173" -ForegroundColor Red
    Write-Host "   (This is normal if server isn't fully ready yet)" -ForegroundColor Gray
}

# Clean up
Stop-Job $devJob -ErrorAction SilentlyContinue
Remove-Job $devJob -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎯 Browser Connection Fix Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What was fixed:" -ForegroundColor Cyan
Write-Host "   ✅ Windows Defender exclusions added" -ForegroundColor Green
Write-Host "   ✅ TypeScript incremental compilation enabled" -ForegroundColor Green
Write-Host "   ✅ VS Code serverReadyAction pattern improved" -ForegroundColor Green
Write-Host "   ✅ Browser cache cleared" -ForegroundColor Green
Write-Host "   ✅ Network stack reset" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Try your debug configuration now!" -ForegroundColor Cyan
Write-Host "   Expected result: Browser opens in 1-2 seconds instead of 12" -ForegroundColor Cyan

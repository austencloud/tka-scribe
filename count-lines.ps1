# Count lines in all TypeScript and Svelte files
Write-Host "Scanning all .ts and .svelte files in src/..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "src" -Include "*.ts","*.svelte" -Recurse -File
$results = @()

foreach ($file in $files) {
    $lineCount = (Get-Content $file.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '')
    
    $results += [PSCustomObject]@{
        Lines = $lineCount
        File = $relativePath
    }
}

Write-Host "`nTop 30 largest files by line count:" -ForegroundColor Green
$results | Sort-Object Lines -Descending | Select-Object -First 30 | Format-Table -AutoSize

Write-Host "`nTotal files scanned: $($results.Count)" -ForegroundColor Yellow

$targetPath = "F:\_THE KINETIC ALPHABET\_TKA-SCRIBE\src\lib\shared"
$updatedCount = 0

Get-ChildItem -Path $targetPath -Filter "*.svelte" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8

    # Match icon patterns without aria-hidden
    $pattern = '(<i class="fa[srlbd]? fa-[^"]*")>'

    if ($content -match $pattern -and $content -notmatch 'aria-hidden="true">') {
        $newContent = $content -replace '(<i class="fa[srlbd]? fa-[^"]*")>', '$1 aria-hidden="true">'

        # Only write if content actually changed
        if ($newContent -ne $content) {
            Set-Content -Path $_.FullName -Value $newContent -NoNewline -Encoding UTF8
            Write-Host "Updated: $($_.Name)"
            $script:updatedCount++
        }
    }
}

Write-Host "`nTotal files updated: $updatedCount"

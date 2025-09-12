# Fix GitHub Pages Asset Rendering Issues
# This script addresses common issues that prevent assets from rendering on GitHub Pages

Write-Host "🔧 Fixing GitHub Pages Asset Rendering Issues..." -ForegroundColor Green

# 1. Check if we're in the right directory
if (-not (Test-Path "index.html")) {
    Write-Host "❌ Error: index.html not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found project root directory" -ForegroundColor Green

# 2. Verify folder rename was successful
if (Test-Path "download-content") {
    Write-Host "✅ Folder 'download content' successfully renamed to 'download-content'" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: 'download-content' folder not found. Please ensure the folder was renamed." -ForegroundColor Yellow
}

# 3. Check for case sensitivity issues in asset references
Write-Host "🔍 Checking for case sensitivity issues..." -ForegroundColor Yellow

# Common case sensitivity issues to check
$caseIssues = @(
    @{ Pattern = "download content"; Replacement = "download-content" },
    @{ Pattern = "download%20content"; Replacement = "download-content" }
)

# 4. Check all HTML files for asset references
$htmlFiles = Get-ChildItem -Path "." -Filter "*.html" -Recurse
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($issue in $caseIssues) {
        if ($content -match $issue.Pattern) {
            $content = $content -replace [regex]::Escape($issue.Pattern), $issue.Replacement
            Write-Host "  📝 Fixed case issue in $($file.Name): $($issue.Pattern) -> $($issue.Replacement)" -ForegroundColor Cyan
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  ✅ Updated $($file.Name)" -ForegroundColor Green
    }
}

# 5. Check JavaScript files
$jsFiles = Get-ChildItem -Path "." -Filter "*.js" -Recurse
foreach ($file in $jsFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($issue in $caseIssues) {
        if ($content -match $issue.Pattern) {
            $content = $content -replace [regex]::Escape($issue.Pattern), $issue.Replacement
            Write-Host "  📝 Fixed case issue in $($file.Name): $($issue.Pattern) -> $($issue.Replacement)" -ForegroundColor Cyan
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  ✅ Updated $($file.Name)" -ForegroundColor Green
    }
}

# 6. Verify asset files exist
Write-Host "🔍 Verifying asset files exist..." -ForegroundColor Yellow

$assetPaths = @(
    "video/walk_thru.mp4",
    "rendering/Villa_Exterior.png",
    "assets/images/favicon.svg",
    "css/styles.css",
    "js/script.js"
)

$missingAssets = @()
foreach ($path in $assetPaths) {
    if (Test-Path $path) {
        Write-Host "  ✅ Found: $path" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing: $path" -ForegroundColor Red
        $missingAssets += $path
    }
}

# 7. Check for spaces in filenames (problematic for URLs)
Write-Host "🔍 Checking for spaces in filenames..." -ForegroundColor Yellow
$filesWithSpaces = Get-ChildItem -Path "." -Recurse | Where-Object { $_.Name -match " " }
if ($filesWithSpaces.Count -gt 0) {
    Write-Host "  ⚠️  Found files with spaces in names:" -ForegroundColor Yellow
    foreach ($file in $filesWithSpaces) {
        Write-Host "    - $($file.FullName)" -ForegroundColor Yellow
    }
    Write-Host "  💡 Consider renaming these files to use hyphens or underscores instead of spaces" -ForegroundColor Cyan
}

# 8. Generate a summary report
Write-Host "`n📊 Summary Report:" -ForegroundColor Magenta
Write-Host "=================" -ForegroundColor Magenta

if ($missingAssets.Count -eq 0) {
    Write-Host "✅ All critical assets found" -ForegroundColor Green
} else {
    Write-Host "❌ Missing assets:" -ForegroundColor Red
    foreach ($asset in $missingAssets) {
        Write-Host "  - $asset" -ForegroundColor Red
    }
}

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Commit and push these changes to GitHub" -ForegroundColor White
Write-Host "2. Wait for GitHub Pages to rebuild (usually takes 1-2 minutes)" -ForegroundColor White
Write-Host "3. Test your website on GitHub Pages" -ForegroundColor White
Write-Host "4. If issues persist, check the browser Developer Tools Console for 404 errors" -ForegroundColor White

Write-Host "`n✨ GitHub Pages asset fix completed!" -ForegroundColor Green

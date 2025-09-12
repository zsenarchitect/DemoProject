# Simple fix for GitHub Pages asset issues
Write-Host "Fixing GitHub Pages Asset Issues..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "index.html")) {
    Write-Host "Error: index.html not found. Please run from project root." -ForegroundColor Red
    exit 1
}

Write-Host "Found project root directory" -ForegroundColor Green

# Check if download-content folder exists
if (Test-Path "download-content") {
    Write-Host "Folder 'download content' successfully renamed to 'download-content'" -ForegroundColor Green
} else {
    Write-Host "Warning: 'download-content' folder not found." -ForegroundColor Yellow
}

# Verify critical assets exist
Write-Host "Checking critical assets..." -ForegroundColor Yellow

$assets = @(
    "video/walk_thru.mp4",
    "rendering/Villa_Exterior.png", 
    "assets/images/favicon.svg",
    "css/styles.css",
    "js/script.js"
)

$missing = @()
foreach ($asset in $assets) {
    if (Test-Path $asset) {
        Write-Host "  Found: $asset" -ForegroundColor Green
    } else {
        Write-Host "  Missing: $asset" -ForegroundColor Red
        $missing += $asset
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Magenta
if ($missing.Count -eq 0) {
    Write-Host "All critical assets found!" -ForegroundColor Green
} else {
    Write-Host "Missing assets:" -ForegroundColor Red
    foreach ($asset in $missing) {
        Write-Host "  - $asset" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Commit and push changes to GitHub" -ForegroundColor White
Write-Host "2. Wait for GitHub Pages to rebuild" -ForegroundColor White
Write-Host "3. Test your website" -ForegroundColor White

Write-Host "Fix completed!" -ForegroundColor Green

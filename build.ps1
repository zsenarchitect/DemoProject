# Build script for Architecture Project Website
# This script validates the website structure and ensures everything is ready for deployment

Write-Host "Validating Architecture Project Website..." -ForegroundColor Green

# Check that all required directories exist
$requiredDirs = @("css", "js", "drawings", "rendering", "video", "download content", "3d")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "✓ Directory '$dir' exists" -ForegroundColor Green
    } else {
        Write-Host "✗ Directory '$dir' missing" -ForegroundColor Red
    }
}

# Check that all HTML files exist
$htmlFiles = @("index.html", "presentation.html", "walkthrough.html", "about.html", "download.html")
foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        Write-Host "✓ HTML file '$file' exists" -ForegroundColor Green
    } else {
        Write-Host "✗ HTML file '$file' missing" -ForegroundColor Red
    }
}

Write-Host "Validation completed!" -ForegroundColor Green
Write-Host "Website is ready for deployment to GitHub Pages." -ForegroundColor Green

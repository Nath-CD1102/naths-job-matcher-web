# GitHub Push & Vercel Deployment Script

Write-Host "Nath's Job Matcher - GitHub Push & Vercel Deployment" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Get GitHub username
$username = Read-Host "Enter your GitHub username"
if (-not $username) {
    Write-Host "GitHub username required. Exiting." -ForegroundColor Red
    exit 1
}

$repoName = "naths-job-matcher-web"
$repoUrl = "https://github.com/$username/$repoName.git"

Write-Host ""
Write-Host "Repository URL: $repoUrl" -ForegroundColor Yellow

# Configure git remote
Write-Host ""
Write-Host "Configuring git remote..." -ForegroundColor Cyan
git remote add origin $repoUrl 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Updating existing remote..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
}

# Set main branch
Write-Host "Setting main branch..." -ForegroundColor Cyan
git branch -M main

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "If prompted, enter your GitHub credentials (or use personal access token)" -ForegroundColor Gray
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps for Vercel deployment:" -ForegroundColor Cyan
    Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "2. Click 'Add New...' > 'Project'" -ForegroundColor White
    Write-Host "3. Click 'Import Git Repository'" -ForegroundColor White
    Write-Host "4. Select your GitHub account and find 'naths-job-matcher-web'" -ForegroundColor White
    Write-Host "5. Click 'Import' and then 'Deploy'" -ForegroundColor White
    Write-Host ""
    Write-Host "Auto-deployment will be active. Every push to main = instant production update." -ForegroundColor Green
    Write-Host ""
    Write-Host "Your job matcher is live! 🚀" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Failed to push to GitHub" -ForegroundColor Red
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Repository exists at: $repoUrl" -ForegroundColor Gray
    Write-Host "  2. You have push access" -ForegroundColor Gray
    Write-Host "  3. Your GitHub credentials are correct" -ForegroundColor Gray
}

pause

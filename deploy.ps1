Write-Host "Starting Deployment Process..." -ForegroundColor Green

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Fix Level 2: Removed unfair traps and adjusted platforms. Added 30 levels and Sky Falling mechanic."

# Push to main branch
git push origin main

Write-Host "Deployment Pushed! Please check your repository's Actions tab to verify the build." -ForegroundColor Yellow
Write-Host "Your site should be live in a few minutes." -ForegroundColor Green

# ============================================================
# Deploy API Catalog to GitHub Pages
# ============================================================
# PREREQUISITE: The repo must already exist on GitHub.
#   Create it at: https://github.com/new
#   Name: Acgs  |  Public  |  No README
#
# Then run this script to push all catalog files and enable Pages.
#
# Requirements:
#   1. GitHub CLI installed: winget install GitHub.cli
#   2. Authenticated: gh auth login
#
# Source of truth:
#   gh-pages/
#     index.html
#     css/
#     js/
# ============================================================

$ErrorActionPreference = "Continue"
$repoName = "Acgs"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$indexPath = Join-Path $scriptDir "index.html"
$sourceJs = Join-Path $scriptDir "js"
$sourceCss = Join-Path $scriptDir "css"

Push-Location $scriptDir

# ---- Validate single-source site files ----
Write-Host "`n=== Validating gh-pages source files ===" -ForegroundColor Cyan

if (-not (Test-Path $indexPath)) {
    Write-Host "ERROR: Source HTML not found at: $indexPath" -ForegroundColor Red
    Pop-Location; exit 1
}
if (-not (Test-Path $sourceJs)) {
    Write-Host "ERROR: Source js/ folder not found at: $sourceJs" -ForegroundColor Red
    Pop-Location; exit 1
}
if (-not (Test-Path $sourceCss)) {
    Write-Host "ERROR: Source css/ folder not found at: $sourceCss" -ForegroundColor Red
    Pop-Location; exit 1
}

$jsCopied = (Get-ChildItem "$sourceJs\*.js").Count
$cssCopied = (Get-ChildItem "$sourceCss\*.css").Count
Write-Host "  Found: index.html" -ForegroundColor Gray
Write-Host "  Found: js/ folder ($jsCopied files)" -ForegroundColor Gray
Write-Host "  Found: css/ folder ($cssCopied files)" -ForegroundColor Gray
Write-Host "gh-pages is ready for deployment." -ForegroundColor Green

# ---- Auto-increment spec version & stamp date/time ----
Write-Host "`n=== Stamping version & timestamp ===" -ForegroundColor Cyan

# Read the gh-pages HTML to find current version (authoritative source)
$htmlContent = Get-Content $indexPath -Raw -Encoding UTF8

# Extract current version (e.g. "v1.2" or "v1.2.1")
$currentVersion = "v1.0"
if ($htmlContent -match 'id="specVersion">v(\d+)\.(\d+)(?:\.(\d+))?<') {
    $major = [int]$Matches[1]
    $minor = [int]$Matches[2]
    $patch = if ($Matches[3]) { [int]$Matches[3] } else { $null }
    $currentVersion = if ($null -ne $patch) { "v$major.$minor.$patch" } else { "v$major.$minor" }
} else {
    # Fallback if first publish or no version found
    $major = 1
    $minor = 0
    $patch = $null
}
if ($null -ne $patch) {
    $newPatch = $patch + 1
    $newVersion = "v$major.$minor.$newPatch"
} else {
    $newMinor = $minor + 1
    $newVersion = "v$major.$newMinor"
}

# Local date/time in SAST (UTC+2)
$localNow   = Get-Date
$timestamp   = $localNow.ToString("yyyy-MM-dd HH:mm")
$tzAbbr      = if ($localNow.IsDaylightSavingTime()) { "SAST" } else { "SAST" }
$fullStamp   = "$timestamp $tzAbbr"

Write-Host "  Version: $currentVersion -> $newVersion" -ForegroundColor Gray
Write-Host "  Timestamp: $fullStamp" -ForegroundColor Gray

# Update the gh-pages index.html with new version + timestamp
$indexContent = Get-Content $indexPath -Raw -Encoding UTF8
$indexContent = $indexContent -replace '(id="specVersion">)v[\d.]+(<)', "`${1}$newVersion`${2}"
$indexContent = $indexContent -replace '(id="lastUpdated">)[^<]*(</strong>)', "`${1}$fullStamp`${2}"
$utf8BOM = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText($indexPath, $indexContent, $utf8BOM)

Write-Host "  Stamped $newVersion / $fullStamp in gh-pages/index.html." -ForegroundColor Green

# ---- Get GitHub username ----
Write-Host "`n=== Checking GitHub auth ===" -ForegroundColor Cyan
$ghUser = (gh api user --jq .login 2>$null)
if (-not $ghUser) {
    Write-Host "ERROR: Not logged in to GitHub CLI. Run: gh auth login" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "Logged in as: $ghUser" -ForegroundColor Green

$remoteUrl = "https://github.com/$ghUser/$repoName.git"

# ---- Verify repo exists ----
Write-Host "`n=== Step 1: Verify repo exists ===" -ForegroundColor Cyan
$repoCheck = gh api "repos/$ghUser/$repoName" --jq .full_name 2>$null
if (-not $repoCheck) {
    Write-Host ""
    Write-Host "ERROR: Repository '$ghUser/$repoName' does not exist!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Create it manually:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://github.com/new" -ForegroundColor Yellow
    Write-Host "  2. Name: $repoName" -ForegroundColor Yellow
    Write-Host "  3. Public, do NOT add README" -ForegroundColor Yellow
    Write-Host "  4. Click 'Create repository'" -ForegroundColor Yellow
    Write-Host "  5. Re-run this script" -ForegroundColor Yellow
    Write-Host ""
    Pop-Location
    exit 1
}
Write-Host "Repo found: $repoCheck" -ForegroundColor Green

# ---- Clean slate: remove old .git if present ----
Write-Host "`n=== Step 2: Initialize git and push ===" -ForegroundColor Cyan
if (Test-Path ".git") {
    Write-Host "Removing old .git directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".git"
}

git init
git checkout -b main
git add index.html
git add css/
git add js/
git commit -m "Update API Endpoint Catalog $newVersion ($fullStamp)"
git remote add origin $remoteUrl
git push -u origin main --force

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Push failed. Check your token has 'repo' scope or the repo exists." -ForegroundColor Red
    Pop-Location
    exit 1
}

# ---- Enable GitHub Pages ----
Write-Host "`n=== Step 3: Enable GitHub Pages ===" -ForegroundColor Cyan
Start-Sleep -Seconds 3
gh api "repos/$ghUser/$repoName/pages" -X POST -f "source[branch]=main" -f "source[path]=/" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Pages may already be enabled - continuing..." -ForegroundColor Yellow
}

Pop-Location

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "  DONE! Your catalog will be live at:" -ForegroundColor Green
Write-Host "  https://$ghUser.github.io/$repoName/" -ForegroundColor White
Write-Host "  (may take 30-60 seconds to activate)" -ForegroundColor Gray
Write-Host "============================================`n" -ForegroundColor Green

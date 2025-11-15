# Deployment Script for Stuck On Steven
# Run this from Windows to deploy both frontend and backend to VPS

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIp,

    [Parameter(Mandatory=$false)]
    [string]$SshUser = "stuckonsteven",

    [Parameter(Mandatory=$false)]
    [switch]$BackendOnly,

    [Parameter(Mandatory=$false)]
    [switch]$FrontendOnly
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Stuck On Steven Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = "C:\Users\steve\source\repos\mxmartin-website-new\backend-csharp"
$frontendPath = "C:\Users\steve\source\repos\mxmartin-website-new"

# Deploy Backend
if (-not $FrontendOnly) {
    Write-Host "[1/4] Building C# Backend..." -ForegroundColor Yellow
    Push-Location $backendPath
    try {
        dotnet publish -c Release -o .\publish
        if ($LASTEXITCODE -ne 0) {
            throw "Backend build failed"
        }
        Write-Host "✓ Backend built successfully" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }

    Write-Host "[2/4] Uploading Backend to VPS..." -ForegroundColor Yellow
    scp -r "$backendPath\publish" "${SshUser}@${VpsIp}:/var/www/stuckonsteven/backend/"
    if ($LASTEXITCODE -ne 0) {
        throw "Backend upload failed"
    }
    Write-Host "✓ Backend uploaded successfully" -ForegroundColor Green

    Write-Host "[3/4] Restarting Backend Service..." -ForegroundColor Yellow
    ssh "${SshUser}@${VpsIp}" "sudo systemctl restart stuckonsteven-api"
    if ($LASTEXITCODE -ne 0) {
        throw "Backend restart failed"
    }
    Write-Host "✓ Backend service restarted" -ForegroundColor Green
}

# Deploy Frontend
if (-not $BackendOnly) {
    Write-Host "[4/4] Building React Frontend..." -ForegroundColor Yellow
    Push-Location $frontendPath
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "Frontend build failed"
        }
        Write-Host "✓ Frontend built successfully" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }

    Write-Host "Uploading Frontend to VPS..." -ForegroundColor Yellow
    scp -r "$frontendPath\build\*" "${SshUser}@${VpsIp}:/var/www/stuckonsteven/frontend/"
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend upload failed"
    }
    Write-Host "✓ Frontend uploaded successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Website: https://stuckonsteven.com" -ForegroundColor Cyan
Write-Host "API Test: https://stuckonsteven.com/api/test" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  ssh ${SshUser}@${VpsIp} 'sudo journalctl -u stuckonsteven-api -f'" -ForegroundColor Gray
Write-Host ""

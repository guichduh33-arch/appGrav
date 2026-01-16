# Master Deployment Script
Write-Host "🔄 Starting Full Deployment..."

# Frontend
./build_frontend.ps1

# Backend
./deploy_backend.ps1

Write-Host "✨ Application Deployed!"

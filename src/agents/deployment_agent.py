"""
DeploymentAgent - Déploiement Docker/Supabase
"""

from pathlib import Path

class DeploymentAgent:
    """
    Agent de déploiement.
    Frontend: Dockerfile (Root -> Nginx)
    Backend: Supabase CLI
    """
    
    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
        self.deploy_path = self.project_path / "deploy"
        self.deploy_path.mkdir(exist_ok=True)
    
    def create_dockerfile_frontend(self) -> str:
        """
        Dockerfile pour appli React (Root)
        """
        print("🐳 Dockerfile Frontend (Root)...")
        
        content = '''FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
'''
        dockerfile_path = self.project_path / "Dockerfile"
        with open(dockerfile_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return str(dockerfile_path)

    def create_deploy_scripts(self):
        """
        Creates deployment scripts for Windows (PowerShell)
        """
        print("📜 Création des scripts de déploiement...")

        # 1. Build Frontend Script
        build_script = '''# Build Docker Image
docker build -t appgrav-frontend:latest .
Write-Host "✅ Docker Image Built: appgrav-frontend:latest"
'''
        with open(self.deploy_path / "build_frontend.ps1", 'w', encoding='utf-8') as f:
            f.write(build_script)

        # 2. Supabase Deploy Script
        # Assumes user is logged in via `supabase login`
        supabase_script = '''# Deploy Supabase Backend
Write-Host "🚀 Deploying Supabase Migrations..."
npx supabase db push

Write-Host "⚡ Deploying Edge Functions..."
npx supabase functions deploy

Write-Host "✅ Backend Deployed Successfully"
'''
        with open(self.deploy_path / "deploy_backend.ps1", 'w', encoding='utf-8') as f:
            f.write(supabase_script)

        # 3. Master Deploy Script
        master_script = '''# Master Deployment Script
Write-Host "🔄 Starting Full Deployment..."

# Frontend
./build_frontend.ps1

# Backend
./deploy_backend.ps1

Write-Host "✨ Application Deployed!"
'''
        with open(self.deploy_path / "deploy_all.ps1", 'w', encoding='utf-8') as f:
            f.write(master_script)
            
        print(f"✅ Scripts générés dans {self.deploy_path}")

    def setup_complete_deployment(self):
        self.create_dockerfile_frontend()
        self.create_deploy_scripts()
        print("✅ Configuration du déploiement terminée.")

if __name__ == "__main__":
    agent = DeploymentAgent(".")
    agent.setup_complete_deployment()

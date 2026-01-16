"""
IntegrationAgent - Connecte frontend (Vite) et backend (Supabase)
"""

from pathlib import Path
import os

class IntegrationAgent:
    """
    Agent d'intégration pour stack:
    - Root: React/Vite
    - Backend: Supabase
    """
    
    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
    
    def create_env_files(self, supabase_url: str = "", supabase_key: str = "") -> dict:
        """
        Crée le fichier .env à la racine
        """
        print("🔐 Configuration .env (Vite)...")
        
        env_content = f'''# Environment Variables
VITE_SUPABASE_URL={supabase_url or "http://127.0.0.1:54321"}
VITE_SUPABASE_ANON_KEY={supabase_key or "your-anon-key"}
VITE_APP_NAME=AppGrav - The Breakery
'''
        env_path = self.project_path / ".env"
        
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(env_content)
            
        print(f"✅ .env créé : {env_path}")
        return {"env": str(env_path)}
    
    def create_startup_script(self) -> str:
        """
        Script start_dev.sh
        """
        print("🚀 Création script de démarrage...")
        
        script = '''#!/bin/bash
echo "🚀 Démarrage AppGrav Stack (Vite + Supabase)"

# Start Supabase
npx supabase start

# Update keys (simple grep approach or manual)
# ...

# Start Frontend
npm run dev
'''
        script_path = self.project_path / "start_dev.sh"
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script)
            
        return str(script_path)

if __name__ == "__main__":
    agent = IntegrationAgent(".")
    agent.create_env_files()

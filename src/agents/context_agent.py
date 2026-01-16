"""
ContextAgent - Maintient le contexte et la mémoire du projet
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List

class ContextAgent:
    """
    Agent qui garde en mémoire :
    - Architecture actuelle (React/Vite/Supabase)
    - Conventions de code (The Breakery Standards)
    - Patterns utilisés
    - État du projet (Migrations, Features)
    """
    
    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
        self.context_file = self.project_path / ".context" / "project_context.json"
        self.context = self._load_context()
    
    def _load_context(self) -> Dict[str, Any]:
        """Charge le contexte depuis le fichier JSON"""
        
        if self.context_file.exists():
            with open(self.context_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            # Contexte détecté pour The Breakery POS
            return {
                "project_name": "The Breakery POS",
                "last_updated": datetime.now().isoformat(),
                "tech_stack": {
                    "frontend": "React 18 + Vite + TypeScript",
                    "state_management": "Zustand + React Query",
                    "styling": "Tailwind CSS",
                    "backend": "Supabase (Edge Functions - Deno/TS)",
                    "database": "Supabase (PostgreSQL)",
                    "print_server": "Node.js (ESC/POS)"
                },
                "coding_standards": {
                    "frontend": {
                        "framework": "React Functional Components",
                        "language": "TypeScript",
                        "style": "Tailwind CSS (utility-first)",
                        "state": "Zustand for global, React Query for server state"
                    },
                    "backend": {
                        "platform": "Supabase Edge Functions",
                        "language": "TypeScript (Deno)",
                        "db_access": "Supabase JS Client / Postgres Triggers"
                    },
                    "database": {
                        "migrations": "Numbered SQL files (001_name.sql)",
                        "auth": "RLS (Row Level Security)"
                    }
                },
                "architecture": {
                    "frontend_path": "src",
                    "components_path": "src/components",
                    "pages_path": "src/pages",
                    "services_path": "src/services",
                    "hooks_path": "src/hooks",
                    "backend_path": "supabase/functions",
                    "migrations_path": "supabase/migrations"
                },
                "business_rules": {
                    "financial": {
                        "currency": "IDR",
                        "tax_rate": 0.10,
                        "rounding": "to_nearest_100"
                    }
                }
            }
    
    def save_context(self):
        """Sauvegarde le contexte dans le fichier"""
        self.context["last_updated"] = datetime.now().isoformat()
        self.context_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.context_file, 'w', encoding='utf-8') as f:
            json.dump(self.context, f, indent=2, ensure_ascii=False)

    def load_from_audit(self, audit_data: dict):
        """Met à jour le contexte à partir d'un audit"""
        print("📥 Mise à jour contexte via audit...")
        if "project_structure" in audit_data:
            # Update structure info if needed
            pass
        self.save_context()

    def suggest_consistent_approach(self, task_type: str, task_description: str) -> dict:
        """
        Suggère comment implémenter une tâche de manière cohérente avec le projet actuel
        """
        
        suggestions = {
            "file_location": "",
            "naming_convention": "",
            "structure": {},
            "imports": [],
            "patterns_to_follow": []
        }
        
        arch = self.context.get("architecture", {})
        
        if task_type == "api":
            # Supabase Edge Functions approach
            suggestions["tech"] = "Supabase Edge Function (Deno)"
            suggestions["file_location"] = f"{arch.get('backend_path', 'supabase/functions')}/<function-name>/index.ts"
            suggestions["naming_convention"] = "kebab-case (dossier)"
            suggestions["structure"] = {
                "server": "Deno.serve",
                "cors": "Handle CORS OPTIONS",
                "client": "Supabase Client (auth context)"
            }
            suggestions["imports"] = [
                'import { serve } from "https://deno.land/std@0.168.0/http/server.ts"',
                'import { createClient } from "https://esm.sh/@supabase/supabase-js@2"'
            ]
            suggestions["patterns_to_follow"] = [
                "Gérer CORS explicitement",
                "Utiliser Authorization header pour créer le client Supabase",
                "Retourner JSON Response"
            ]
        
        elif task_type == "component":
            suggestions["tech"] = "React + Tailwind"
            suggestions["file_location"] = f"{arch.get('components_path', 'src/components')}/<Feature>/<ComponentName>.tsx"
            suggestions["naming_convention"] = "PascalCase"
            suggestions["structure"] = {
                "type": "Functional Component",
                "props": "Typed Interface",
                "styling": "Tailwind classes"
            }
            suggestions["imports"] = [
                "import { useTranslation } from 'react-i18next';",
                "import { clsx } from 'clsx';"
            ]
        
        elif task_type == "database":
            suggestions["tech"] = "PostgreSQL Migration"
            suggestions["file_location"] = f"{arch.get('migrations_path', 'supabase/migrations')}/"
            suggestions["naming_convention"] = "XXX_description.sql (incrémental)"
            suggestions["structure"] = {
                "content": "SQL Standard",
                "safety": "IF NOT EXISTS / DROP IF EXISTS"
            }
            suggestions["patterns_to_follow"] = [
                "Utiliser RLS policies",
                "Created_at/Updated_at triggers",
                "Commenter les tables"
            ]
        
        elif task_type == "service":
            suggestions["tech"] = "TypeScript Service"
            suggestions["file_location"] = f"{arch.get('services_path', 'src/services')}/"
            suggestions["naming_convention"] = "PascalCase (ex: ProductService.ts)"
            suggestions["structure"] = {
                "pattern": "Singleton ou Module export",
                "error_handling": "Try/Catch avec notification toast"
            }
        
        return suggestions

    def get_project_summary(self) -> str:
        return f"""
# Contexte Projet : {self.context['project_name']}
Stack: {self.context['tech_stack']['frontend']} / {self.context['tech_stack']['backend']}
DB: {self.context['tech_stack']['database']}
Arch: {json.dumps(self.context['architecture'], indent=2)}
"""

if __name__ == "__main__":
    agent = ContextAgent(".")
    print(agent.get_project_summary())

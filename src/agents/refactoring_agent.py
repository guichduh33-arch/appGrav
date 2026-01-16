"""
RefactoringAgent - Stack Deno/TS/React
"""

from pathlib import Path
import re
import json
from datetime import datetime

class RefactoringAgent:
    """
    Agent de refactoring adapté TypeScript/React/Deno.
    Supporte l'analyse statique et des suggestions de refactoring.
    """
    
    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
        self.report_data = {
            "actions": [],
            "duplications": [],
            "optimizations": []
        }
    
    def analyze_ts_code(self, file_path: str) -> dict:
        """
        Analyse statique simple de code TS/TSX
        """
        print(f"🔍 Analyse {Path(file_path).name}...")
        
        issues = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 1. Détecter 'any' explicite
            if ": any" in content or "as any" in content:
                issues.append({
                    "type": "Type Safety",
                    "msg": "Usage de 'any' détecté. Préférer des types stricts ou 'unknown'.",
                    "severity": "medium"
                })
                
            # 2. Détecter console.log
            if "console.log" in content:
                issues.append({
                    "type": "Debug Leftover",
                    "msg": "console.log() présent.",
                    "severity": "low"
                })
            
            # 3. Détecter style inline (React)
            if "style={{" in content:
                issues.append({
                    "type": "Styling",
                    "msg": "Styles inline détectés. Préférer Tailwind classes.",
                    "severity": "medium"
                })
                
        except Exception as e:
            print(f"Erreur lecture fichier: {e}")
            
        if issues:
            print(f"⚠️ {len(issues)} problèmes potentiels.")
        else:
            print("✅ Code sain.")
            
        return {"file": file_path, "issues": issues}

    def add_error_handling(self, file_path: str) -> bool:
        """
        Suggère ou ajoute des blocs try/catch (Placeholder)
        """
        print(f"🔧 Ajout gestion erreurs dans {Path(file_path).name}...")
        # Simulation d'action
        self.report_data["actions"].append({
            "type": "add_error_handling",
            "file": file_path,
            "status": "simulated"
        })
        return True

    def remove_code_duplication(self, files: list) -> dict:
        """
        Détecte la duplication de code (Placeholder)
        """
        print(f"🔧 Recherche duplication dans {len(files)} fichiers...")
        # Simulation
        dupes = [] # Implement real logic if needed
        self.report_data["duplications"].extend(dupes)
        return {"duplications": dupes}

    def optimize_database_queries(self, file_path: str) -> bool:
        """
        Suggère des optimisations de requêtes (Placeholder)
        """
        print(f"⚡ Optimisation requêtes dans {Path(file_path).name}...")
        # Simulation
        return True

    def generate_refactoring_report(self) -> str:
        """
        Génère un rapport de refactoring
        """
        report_path = self.project_path / "artifacts" / "reports" / f"refactor_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        report_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(self.report_data, f, indent=2)
            
        return str(report_path)

if __name__ == "__main__":
    agent = RefactoringAgent(".")
    print("Agent de refactoring TS prêt.")

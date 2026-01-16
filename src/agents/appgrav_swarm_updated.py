"""
AppGravSwarm - Orchestrateur principal
Coordonne tous les agents pour développer AppGrav
"""

import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any
import json

# Add src to path to allow imports if run from root
root_path = Path(__file__).parent.parent
sys.path.append(str(root_path))

try:
    # Import de tous les agents
    from agents.audit_agent import AuditAgent
    from agents.context_agent import ContextAgent
    from agents.database_agent import DatabaseAgent
    from agents.backend_agent import BackendAgent
    from agents.frontend_agent import FrontendAgent
    from agents.integration_agent import IntegrationAgent
    from agents.testing_agent import TestingAgent
    from agents.refactoring_agent import RefactoringAgent
    from agents.documentation_agent import DocumentationAgent
    from agents.deployment_agent import DeploymentAgent
    from agents.translation_agent import TranslationAgent
    from agents.erp_design_agent import ERPDesignAgent  # NEW: Agent ERP/POS Design
except Exception as e:
    print(f"\n❌ ERREUR CRITIQUE AU DEMARRAGE:\n{e}")
    print("\nVerifiez que vous lancez le script depuis la racine du projet ou que PYTHONPATH est correct.")
    print(f"PYTHONPATH actuel: {sys.path}")
    input("\nAppuyez sur Entrée pour quitter...")
    sys.exit(1)


class AppGravSwarm:
    """
    Orchestrateur principal qui coordonne tous les agents
    pour développer et maintenir AppGrav - The Breakery
    
    Agents disponibles (11):
    - AuditAgent: Analyse code et qualité
    - ContextAgent: Maintient le contexte projet
    - DatabaseAgent: Gère les migrations Supabase
    - BackendAgent: Génère les Edge Functions
    - FrontendAgent: Génère composants React
    - IntegrationAgent: Connecte frontend/backend
    - TestingAgent: Génère les tests
    - RefactoringAgent: Améliore le code existant
    - DocumentationAgent: Génère la documentation
    - DeploymentAgent: Gère le déploiement
    - TranslationAgent: Gère l'i18n
    - ERPDesignAgent: Conçoit l'architecture ERP/POS (NEW)
    """
    
    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
        self.reports_path = self.project_path / "artifacts" / "reports"
        self.reports_path.mkdir(parents=True, exist_ok=True)
        
        # Initialiser tous les agents
        print("🤖 Initialisation du Swarm AppGrav...\n")
        
        self.audit_agent = AuditAgent(str(project_path))
        self.context_agent = ContextAgent(str(project_path))
        self.database_agent = DatabaseAgent(str(project_path))
        self.backend_agent = BackendAgent(str(project_path))
        self.frontend_agent = FrontendAgent(str(project_path))
        self.integration_agent = IntegrationAgent(str(project_path))
        self.testing_agent = TestingAgent(str(project_path))
        self.refactoring_agent = RefactoringAgent(str(project_path))
        self.documentation_agent = DocumentationAgent(str(project_path))
        self.deployment_agent = DeploymentAgent(str(project_path))
        self.translation_agent = TranslationAgent(str(project_path))
        
        # NEW: Agent ERP/POS Design
        self.erp_design_agent = ERPDesignAgent(str(project_path))
        
        print("✅ Swarm initialisé avec 12 agents\n")
        
        self.execution_log = []
    
    def list_agents(self) -> Dict[str, str]:
        """Liste tous les agents disponibles avec leur rôle"""
        return {
            "AuditAgent": "Analyse le code existant et identifie les problèmes",
            "ContextAgent": "Maintient le contexte et la mémoire du projet",
            "DatabaseAgent": "Gère les migrations Supabase (PostgreSQL)",
            "BackendAgent": "Génère des Supabase Edge Functions (Deno/TS)",
            "FrontendAgent": "Génère des composants React (Vite/TypeScript)",
            "IntegrationAgent": "Connecte frontend et backend",
            "TestingAgent": "Génère les tests (Vitest/Deno)",
            "RefactoringAgent": "Améliore et optimise le code",
            "DocumentationAgent": "Génère toute la documentation",
            "DeploymentAgent": "Gère Docker et déploiement",
            "TranslationAgent": "Gère l'internationalisation (i18n)",
            "ERPDesignAgent": "Conçoit l'architecture ERP/POS (NEW)"
        }
    
    def analyze_and_plan(self) -> dict:
        """
        Analyse le projet existant et crée un plan d'action
        """
        print("="*70)
        print("🔍 PHASE 1 : ANALYSE DU PROJET")
        print("="*70 + "\n")
        
        # 1. Audit complet
        print("1️⃣ Lancement de l'audit complet...")
        audit_report_path = self.audit_agent.generate_full_report()
        
        # 2. Charger le contexte
        print("\n2️⃣ Chargement du contexte projet...")
        if hasattr(self.context_agent, "load_from_audit") and hasattr(self.audit_agent, "report_data"):
             self.context_agent.load_from_audit(self.audit_agent.report_data)
        
        # 3. Analyser les résultats
        findings = getattr(self.audit_agent, "report_data", {})
        scores = findings.get("scores", {})
        
        issues_sec = len(findings.get("security", {}).get("critical", [])) + len(findings.get("security", {}).get("high", []))
        code_issues = len(findings.get("code_quality", {}).get("file_scores", {}))
        
        issues = {
            "security": issues_sec,
            "code_quality": code_issues,
            "features_existing": len(findings.get("missing_features", {}).get("existing", [])),
        }
        
        # 4. Créer le plan d'action
        plan = self._create_action_plan(scores, issues)
        
        # 5. Sauvegarder le plan
        plan_path = self.reports_path / f"action_plan_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(plan_path, 'w', encoding='utf-8') as f:
            json.dump(plan, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Plan d'action créé : {plan_path}")
        
        return plan
    
    def _create_action_plan(self, scores: dict, issues: dict) -> dict:
        """Crée un plan d'action basé sur l'audit"""
        
        plan = {
            "created_at": datetime.now().isoformat(),
            "project": "AppGrav - The Breakery",
            "overall_score": scores.get("overall", 0),
            "phases": []
        }
        
        # Phase 1 : Critique
        if scores.get("security", 10) < 6 or issues["security"] > 0:
            plan["phases"].append({
                "phase": "1 - CRITIQUE : Sécurisation",
                "priority": "HIGH",
                "tasks": [{"agent": "RefactoringAgent", "action": "fix_security_issues"}]
            })
        
        # Phase 2 : Qualité
        if scores.get("code_quality", 10) < 7:
            plan["phases"].append({
                "phase": "2 - IMPORTANT : Qualité du code",
                "priority": "MEDIUM",
                "tasks": [{"agent": "RefactoringAgent", "action": "analyze_ts_code"}]
            })
        
        return plan
    
    def build_feature(self, feature_description: str) -> dict:
        """
        Construit une fonctionnalité complète
        """
        print("="*70)
        print(f"🏗️ CONSTRUCTION DE FONCTIONNALITÉ")
        print("="*70)
        print(f"\n📝 Description : {feature_description}\n")
        
        execution = {
            "feature": feature_description,
            "started_at": datetime.now().isoformat(),
            "steps": []
        }
        
        # Context
        print("1️⃣ Analyse du besoin...")
        suggestion = self.context_agent.suggest_consistent_approach("component", feature_description)
        feature_name = feature_description.split(" ")[0] if " " in feature_description else feature_description
        
        # ERP Design consultation (NEW)
        print("\n2️⃣ Consultation ERPDesignAgent...")
        erp_suggestion = self.erp_design_agent.suggest_implementation(feature_description)
        execution["steps"].append({
            "agent": "ERPDesignAgent",
            "action": "suggest_implementation",
            "result": erp_suggestion
        })
        
        # Backend
        print("\n3️⃣ Backend API...")
        self.backend_agent.create_edge_function(feature_name.lower())
        
        # Frontend
        print("\n4️⃣ Frontend Interface...")
        self.frontend_agent.create_component(feature_name, is_page=True)
        
        # Testing
        print("\n5️⃣ Tests...")
        self.testing_agent.generate_edge_function_test(feature_name.lower())
        self.testing_agent.generate_frontend_test(feature_name)
        
        execution["completed_at"] = datetime.now().isoformat()
        execution["status"] = "completed"
        
        report_path = self.reports_path / f"feature_build_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(execution, f, indent=2)
            
        print(f"\n✅ Fonctionnalité construite : {report_path}")
        self.execution_log.append(execution)
        return execution
    
    def design_erp_module(self, module: str) -> dict:
        """
        Conçoit un module ERP complet (NEW)
        """
        print("="*70)
        print(f"🎨 DESIGN MODULE ERP: {module.upper()}")
        print("="*70 + "\n")
        
        results = {
            "module": module,
            "started_at": datetime.now().isoformat(),
            "artifacts": {}
        }
        
        # 1. Schéma BDD
        print("1️⃣ Design schéma base de données...")
        schema = self.erp_design_agent.design_database_schema(module)
        results["artifacts"]["schema"] = schema
        
        # 2. Génération migration SQL
        print("\n2️⃣ Génération migration SQL...")
        migration_path = self.erp_design_agent.generate_migration_sql(module)
        results["artifacts"]["migration"] = migration_path
        
        # 3. Interface (si POS)
        if module == "pos":
            print("\n3️⃣ Design interface POS...")
            pos_design = self.erp_design_agent.design_pos_interface()
            results["artifacts"]["interface"] = pos_design
        
        # 4. Workflow (si production)
        if module == "production":
            print("\n3️⃣ Design workflow production...")
            workflow = self.erp_design_agent.design_production_workflow()
            results["artifacts"]["workflow"] = workflow
        
        # 5. Dashboard (si reporting)
        if module == "reporting":
            print("\n3️⃣ Design dashboard...")
            dashboard = self.erp_design_agent.design_dashboard()
            results["artifacts"]["dashboard"] = dashboard
        
        results["completed_at"] = datetime.now().isoformat()
        
        print(f"\n✅ Module {module} conçu avec succès!")
        return results
    
    def generate_full_erp_design(self) -> str:
        """
        Génère le design complet de l'ERP (NEW)
        """
        print("="*70)
        print("🏗️ GÉNÉRATION DESIGN ERP COMPLET")
        print("="*70 + "\n")
        
        # Générer tous les designs
        modules = ["pos", "inventory", "production", "customers", "purchasing", "reporting"]
        
        for module in modules:
            print(f"\n📦 Module: {module}")
            self.erp_design_agent.design_database_schema(module)
            self.erp_design_agent.generate_migration_sql(module)
        
        # Interface POS
        self.erp_design_agent.design_pos_interface()
        
        # Workflow production
        self.erp_design_agent.design_production_workflow()
        
        # Dashboard
        self.erp_design_agent.design_dashboard()
        
        # Rapport final
        report_path = self.erp_design_agent.generate_design_report()
        
        print(f"\n✅ Design ERP complet généré: {report_path}")
        return report_path
    
    def refactor_project(self, scope: str = "all") -> dict:
        """Refactoring Project"""
        print(f"🔧 REFACTORING - Scope: {scope.upper()}")
        
        if scope in ["all", "quality"]:
            self.refactoring_agent.analyze_ts_code("src/App.tsx")
            self.refactoring_agent.remove_code_duplication(["src/App.tsx"])
            
        report_path = self.refactoring_agent.generate_refactoring_report()
        print(f"✅ Refactoring terminé: {report_path}")
        return {"report": report_path}
    
    def setup_from_scratch(self):
        """Setup complet"""
        self.integration_agent.create_env_files()
        self.integration_agent.create_startup_script()
        self.documentation_agent.setup_complete_documentation()
        self.deployment_agent.setup_complete_deployment()
        self.translation_agent.setup_complete_translation()

    def generate_master_report(self) -> str:
        """Master Report"""
        print("📊 Génération Rapport Maître...")
        
        report = f"""# 📊 Rapport Maître - AppGrav The Breakery

**Généré le:** {datetime.now().strftime('%Y-%m-%d %H:%M')}

---

## 🤖 Agents disponibles

| Agent | Rôle |
|-------|------|
"""
        for agent, role in self.list_agents().items():
            report += f"| {agent} | {role} |\n"
        
        report += f"""
---

## 📈 État du projet

- Dernière analyse: {datetime.now().isoformat()}
- Nombre d'exécutions: {len(self.execution_log)}

---

## 🔧 Actions récentes

"""
        for log in self.execution_log[-5:]:
            report += f"- {log.get('feature', 'N/A')} ({log.get('status', 'unknown')})\n"
        
        report += """
---

*Rapport généré automatiquement par AppGravSwarm*
"""
        
        report_path = self.reports_path / "master_report.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"✅ Rapport: {report_path}")
        return str(report_path)


def main():
    print("\n" + "="*70)
    print("🎼 APPGRAV SWARM - ORCHESTRATEUR PRINCIPAL")
    print("="*70 + "\n")
    
    swarm = AppGravSwarm(".")
    
    while True:
        print("\n📋 MENU PRINCIPAL")
        print("─" * 40)
        print("1. 🔍 Analyser le projet")
        print("2. 🏗️ Construire une fonctionnalité")
        print("3. 🔧 Refactorer le code")
        print("4. 🚀 Setup from scratch")
        print("5. 📊 Générer rapport maître")
        print("─" * 40)
        print("6. 🎨 Design module ERP (NEW)")
        print("7. 🏭 Générer design ERP complet (NEW)")
        print("8. 📐 Voir modules ERP disponibles (NEW)")
        print("─" * 40)
        print("9. 📋 Lister tous les agents")
        print("0. 🚪 Quitter")
        
        choice = input("\nChoix (0-9): ").strip()
        
        if choice == "1":
            swarm.analyze_and_plan()
        elif choice == "2":
            f = input("Description de la fonctionnalité: ")
            swarm.build_feature(f)
        elif choice == "3":
            swarm.refactor_project()
        elif choice == "4":
            swarm.setup_from_scratch()
        elif choice == "5":
            swarm.generate_master_report()
        elif choice == "6":
            print("\nModules disponibles: pos, inventory, production, customers, purchasing, reporting")
            module = input("Module à concevoir: ").strip()
            swarm.design_erp_module(module)
        elif choice == "7":
            swarm.generate_full_erp_design()
        elif choice == "8":
            print("\n📦 MODULES ERP DISPONIBLES:")
            for code, info in swarm.erp_design_agent.modules.items():
                status = "✅" if info["status"] == "active" else "🔜"
                print(f"  {status} {code}: {info['name']} (Priorité {info['priority']})")
        elif choice == "9":
            print("\n🤖 AGENTS DISPONIBLES:")
            for agent, role in swarm.list_agents().items():
                print(f"  • {agent}: {role}")
        elif choice == "0":
            print("\n👋 Au revoir!")
            break


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Arrêt utilisateur.")
    except Exception as e:
        print(f"\n❌ ERREUR D'EXECUTION:\n{e}")
        import traceback
        traceback.print_exc()
        input("\nAppuyez sur Entrée pour quitter...")

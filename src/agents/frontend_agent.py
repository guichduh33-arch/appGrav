"""
FrontendAgent - Génère des composants React (Root/src)
"""

from pathlib import Path
import os

class FrontendAgent:
    """
    Agent spécialisé dans la génération de code React.
    Structure: Root/src (Vite standard)
    """
    
    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
        # Root is frontend in this project structure
        self.src_path = self.project_path / "src"
        self.components_path = self.src_path / "components"
        self.pages_path = self.src_path / "pages"
        self.hooks_path = self.src_path / "hooks"
        
        # Ensure directories exist
        for p in [self.components_path, self.pages_path, self.hooks_path]:
            p.mkdir(parents=True, exist_ok=True)

    def create_component(self, name: str, props: dict = {}, is_page: bool = False, context: dict = None) -> str:
        """
        Crée un composant React (Functional Component)
        """
        print(f"⚛️ Création composant '{name}'...")
        
        recs = ""
        if context and "recommendations" in context:
            recs = "\n/**\n * Design Recommendations:\n"
            for rec in context["recommendations"]:
                recs += f" * - {rec}\n"
            recs += " */\n"
        
        # PascalCase
        name = name[0].upper() + name[1:]
        
        target_dir = self.pages_path if is_page else self.components_path
        file_path = target_dir / f"{name}.tsx"
        
        props_interface = "interface Props {\n"
        for k, v in props.items():
            props_interface += f"  {k}: {v};\n"
        props_interface += "}"
        
        content = f'''import React from 'react';
{recs}
import {{ useTranslation }} from 'react-i18next';

{props_interface if props else ''}

export const {name}: React.FC{f"<Props>" if props else ""} = ({f"{{ {', '.join(props.keys())} }}" if props else ""}) => {{
  const {{ t }} = useTranslation();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{{t('{name.lower()}.title', '{name}')}}</h1>
      <div className="content">
        {{/* Content */}}
      </div>
    </div>
  );
}};

export default {name};
'''
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        return str(file_path)

    def create_dashboard_page(self) -> str:
        """Crée la page Dashboard"""
        return self.create_component("DashboardPage", {}, is_page=True)

if __name__ == "__main__":
    agent = FrontendAgent(".")
    agent.create_component("TestComponent", {"title": "string"})

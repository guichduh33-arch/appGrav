"""
DatabaseAgent - Gère Supabase Migrations
"""

from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
import glob
import re

class DatabaseAgent:
    """
    Agent spécialisé dans les migrations Supabase
    """
    
    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
        self.migrations_path = self.project_path / "supabase" / "migrations"
        
        # Créer dossiers si n'existent pas
        self.migrations_path.mkdir(parents=True, exist_ok=True)
    
    def get_next_migration_number(self) -> str:
        """Trouve le prochain numéro de migration (015, 016...)"""
        files = list(self.migrations_path.glob("*.sql"))
        max_num = 0
        for f in files:
            match = re.match(r"(\d+)_", f.name)
            if match:
                num = int(match.group(1))
                if num > max_num:
                    max_num = num
        
        return f"{max_num + 1:03d}"
    
    def create_migration(self, name: str, sql_content: str) -> str:
        """Crée une nouvelle migration numérotée"""
        next_num = self.get_next_migration_number()
        safe_name = name.lower().replace(" ", "_").replace("-", "_")
        filename = f"{next_num}_{safe_name}.sql"
        filepath = self.migrations_path / filename
        
        full_content = f"""-- Migration: {name} (Auto-generated)
-- Created at: {datetime.now().isoformat()}

{sql_content}
"""
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(full_content)
        
        print(f"✅ Migration créée : {filepath}")
        return str(filepath)
    
    def create_table_schema(self, table_name: str, columns: Dict[str, str], rls: bool = True) -> str:
        """Génère le SQL pour une table et RLS"""
        
        col_def = ",\n  ".join([f"{k} {v}" for k, v in columns.items()])
        
        sql = f"""
CREATE TABLE IF NOT EXISTS {table_name} (
  {col_def}
);

-- Triggers
CREATE TRIGGER update_{table_name}_updated_at
  BEFORE UPDATE ON {table_name}
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
"""
        
        if rls:
            sql += f"""
-- RLS
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read/write for authenticated users only"
ON {table_name}
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
"""
        
        return self.create_migration(f"create_{table_name}", sql)

if __name__ == "__main__":
    agent = DatabaseAgent(".")
    print(f"Next migration: {agent.get_next_migration_number()}")

"""
TranslationAgent - i18n (Root/src & public)
"""

from pathlib import Path
import json

class TranslationAgent:
    """
    Agent i18n.
    Locales: public/locales
    Config: src/i18n.ts
    """
    
    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
        self.locales_path = self.project_path / "public" / "locales"
        self.locales_path.mkdir(parents=True, exist_ok=True)
        self.src_path = self.project_path / "src"
    
    def generate_translation_files(self) -> dict:
        """Generates JSON files"""
        print("📝 Translation files...")
        langs = ["fr", "en", "id"]
        files = {}
        
        for lang in langs:
            lang_dir = self.locales_path / lang
            lang_dir.mkdir(exist_ok=True)
            file_path = lang_dir / "translation.json"
            
            # Simple stub
            content = {"app": "AppGrav"}
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(content, f, indent=2)
            files[lang] = str(file_path)
            
        return files

    def setup_i18n_frontend(self) -> str:
        """i18n.ts configuration"""
        print("⚛️ Config src/i18n.ts...")
        
        content = '''import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    backend: { loadPath: '/locales/{{lng}}/translation.json' }
  });

export default i18n;
'''
        path = self.src_path / "i18n.ts"
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return str(path)

    def setup_complete_translation(self):
        self.generate_translation_files()
        self.setup_i18n_frontend()

if __name__ == "__main__":
    agent = TranslationAgent(".")
    agent.setup_complete_translation()

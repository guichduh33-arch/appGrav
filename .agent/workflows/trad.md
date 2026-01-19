---
description: 
---

---
name: translations
description: Génère les traductions FR/EN/ID pour un module
---

# Instructions

Analyse le module spécifié et :

1. **Identifie** toutes les chaînes de texte à traduire
2. **Génère** les fichiers de traduction :
   - `src/i18n/locales/fr/{module}.json`
   - `src/i18n/locales/en/{module}.json`
   - `src/i18n/locales/id/{module}.json`

3. **Remplace** les chaînes hardcodées par `t('key')`

Format des traductions :
```json
{
  "module": {
    "section": {
      "label": "Texte traduit"
    }
  }
}
```

Contexte métier :
- C'est une boulangerie française en Indonésie
- Termes techniques boulangerie restent en français
- Interface utilisateur adaptée au contexte local

Demande-moi le nom du module à traduire.
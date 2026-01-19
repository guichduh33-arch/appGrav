---
description: 
---

---
name: security-audit
description: Vérifie la sécurité d'un fichier ou module
---

# Instructions

Effectue un audit de sécurité complet :

1. **Vérifie** :
   - Validation des entrées (Zod schemas)
   - Sanitisation des données
   - Gestion des erreurs
   - Exposition de données sensibles
   - RLS policies Supabase

2. **Génère un rapport** avec :
   - ✅ Points conformes
   - ⚠️ Avertissements
   - ❌ Problèmes critiques

3. **Propose des corrections** pour chaque problème

Focus particulier sur :
- Montants financiers (transactions)
- Données clients
- Authentification
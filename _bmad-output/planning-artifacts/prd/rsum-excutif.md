# Résumé Exécutif

### Contexte
AppGrav est le système ERP/POS de The Breakery, une boulangerie artisanale française à Lombok, Indonésie. Le système gère ~200 transactions/jour et supporte trois langues (FR, EN, ID).

### Problèmes à Résoudre
1. **Coupures internet fréquentes** → Interruption des ventes
2. **Inefficacité des serveurs** → Allers-retours constants à la caisse
3. **Manque de transparence** → Clients ne voient pas leur commande

### Solution Proposée
| Module | Bénéfice |
|--------|----------|
| **Mode Offline** | 2h d'autonomie, sync automatique, zéro perte |
| **Customer Display** | Transparence temps réel pour le client |
| **App Mobile Serveurs** | Prise de commande directe en salle |
| **Communication LAN** | Continuité inter-appareils sans internet |

### Métriques de Succès
- **0 transaction perdue** lors de coupures internet
- **-50% allers-retours** des serveurs vers la caisse
- **< 500ms latence** pour le Customer Display
- **2h minimum** de fonctionnement offline

### Scope MVP
28 exigences fonctionnelles, 24 exigences non-fonctionnelles
Distribution interne (APK/IPA), Chrome uniquement, pas de stores.

---

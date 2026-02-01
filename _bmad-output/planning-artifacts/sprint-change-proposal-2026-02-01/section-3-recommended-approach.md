# Section 3: Recommended Approach

### Approche sélectionnée: Direct Adjustment

**Description:** Ajouter un nouvel Epic 9 (Comptabilité & Fiscalité) sans modifier le travail existant ni le scope MVP.

### Rationale

| Facteur | Évaluation |
|---------|------------|
| **Effort** | 🟡 Medium - Epic complet mais indépendant |
| **Risque** | 🟢 Low - Pas de modification code existant |
| **Timeline MVP** | ✅ Non impactée - Compta = post-MVP |
| **Valeur business** | 🟢 High - Conformité fiscale + vision financière |
| **Maintenabilité** | 🟢 Good - Module découplé |

### Alternatives considérées

| Option | Évaluation | Raison du rejet |
|--------|------------|-----------------|
| Rollback | ❌ Not viable | Rien à défaire, Epic 3 (POS) est source de données |
| MVP reduction | ❌ Not viable | Non nécessaire, comptabilité naturellement post-MVP |
| Intégrer dans Epic 8 | ❌ Rejeté | Epic 8 = Analytics/Reports, pas comptabilité en partie double |

### Effort Estimate

| Composant | Effort |
|-----------|--------|
| Schema DB + migrations | 2-3 jours |
| Plan comptable UI | 2 jours |
| Journaux (ventes, achats, caisse) | 5-7 jours |
| Grand livre + Balance | 3-4 jours |
| États financiers (Bilan, P&L) | 4-5 jours |
| Module TVA + Déclarations | 4-5 jours |
| **Total Epic 9** | **~20-25 jours** |

### Risk Assessment

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Complexité règles comptables indonésiennes | Medium | Medium | Recherche standards PSAK |
| Performance requêtes grand livre | Low | Medium | Index sur account_id, entry_date |
| Intégration avec orders existants | Low | Low | Triggers SQL sur insert |

---

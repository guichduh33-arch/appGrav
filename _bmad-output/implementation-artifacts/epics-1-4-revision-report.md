# Rapport de Révision - Epics 1 à 4

**Date**: 2026-02-02
**Portée**: Epic 1 (Core System), Epic 2 (Catalogue), Epic 3 (POS & Ventes), Epic 4 (KDS)
**Objectif**: Identifier erreurs, incohérences et points faibles pour optimiser le développement

---

## Résumé Exécutif

L'analyse des Epics 1-4 révèle une architecture offline-first bien conçue avec des patterns réutilisables. Cependant, plusieurs incohérences terminologiques et techniques ont été identifiées qui nécessitent une harmonisation pour éviter la confusion dans les Epics futurs.

### Statistiques

| Epic | Stories | Status | Issues Identifiées |
|------|---------|--------|-------------------|
| Epic 1 | 5/5 | Done | 2 mineures |
| Epic 2 | 5/5 | Done | 1 mineure |
| Epic 3 | 8/8 | Done | 4 (2 majeures, 2 mineures) |
| Epic 4 | 7/7 | Done | 3 (1 majeure, 2 mineures) |

---

## Issues Critiques (MAJEURE)

### ISSUE-001: Titre des Stories 4.1 et 4.2 Incorrect

**Sévérité**: MAJEURE (Impact documentation)

**Problème**: Les titres mentionnent "Socket.IO" mais l'implémentation utilise BroadcastChannel + Supabase Realtime.

| Story | Titre Actuel | Titre Recommandé |
|-------|--------------|------------------|
| 4.1 | Socket.IO Server on POS (LAN Hub) | LAN Hub Lifecycle Management |
| 4.2 | KDS Socket.IO Client Connection | KDS LAN Client Connection |

**Justification**:
- Les navigateurs NE PEUVENT PAS créer de serveurs WebSocket
- L'architecture utilise BroadcastChannel (same-origin) + Supabase Realtime (cross-origin)
- Les titres actuels créent de la confusion pour les futurs développeurs

**Fichiers à modifier**:
- `_bmad-output/planning-artifacts/epics/epic-list.md` - Sections Epic 4
- `_bmad-output/implementation-artifacts/sprint-status.yaml` - Noms des stories

---

### ISSUE-002: Incohérence Backoff Delays Story 3.6

**Sévérité**: MAJEURE (Impact technique)

**Problème**: Valeurs différentes documentées pour le backoff exponentiel.

| Source | Valeurs |
|--------|---------|
| Epic-list.md (AC3) | 5s → 10s → 20s → 40s |
| Story 3.6 Dev Notes | 5s → 10s → 30s → 60s → 300s |

**Valeur Correcte** (de l'implémentation réelle):
```typescript
const BACKOFF_DELAYS = [5000, 10000, 30000, 60000, 300000];
```

**Action**: Mettre à jour l'epic-list.md AC3 Story 3.6 avec les valeurs correctes.

---

### ISSUE-003: Legacy Sync Queue Non Documenté

**Sévérité**: MAJEURE (Dette technique)

**Problème**: Story 3.6 a créé `syncEngineV2.ts` mais le statut de l'ancien système n'est pas clair.

**Questions non résolues**:
1. `src/services/sync/offlineDb.ts` est-il encore utilisé?
2. `src/services/sync/syncEngine.ts` (V1) est-il déprécié?
3. Quels modules utilisent encore l'ancien système?

**Action recommandée**:
1. Auditer les imports de `offlineDb.ts` et `syncEngine.ts`
2. Marquer explicitement les fichiers deprecated avec `@deprecated`
3. Planifier la suppression dans un Epic futur

---

## Issues Mineures

### ISSUE-004: Convention de Nommage Tables Dexie

**Sévérité**: MINEURE (Cohérence documentation)

**Problème**: Incohérence entre documentation et code.

| Documentation | Code Réel |
|---------------|-----------|
| `offline_users` (snake_case) | `offlineUsers` (camelCase) |
| `offline_sync_queue` (snake_case) | `offline_sync_queue` (snake_case) |

**Observation**: Le code réel utilise un mix. Dexie accepte les deux.

**Recommandation**: Adopter `camelCase` pour les tables Dexie (convention JavaScript) et documenter clairement.

---

### ISSUE-005: Incohérence Rate Limiting Story 1.2

**Sévérité**: MINEURE (Clarification)

**Problème**: Deux mécanismes de rate limiting mentionnés différemment:

| Source | Description |
|--------|-------------|
| Story 1.2 AC | "délai de 30 secondes" après 3 tentatives |
| Story 1.1 Retro | "3 tentatives par 15 minutes" |

**Clarification**: Ces sont deux vérifications complémentaires:
1. Rate limit: Max 3 tentatives / 15 minutes (global)
2. Lockout: 30 secondes de cooldown après échec

**Action**: Documenter clairement les deux mécanismes dans l'epic-list.md

---

### ISSUE-006: Préfixes IDs Locaux Non Harmonisés

**Sévérité**: MINEURE (Clarification)

**Problème**: Différents formats de préfixes utilisés:

| Entity | Préfixe | Format |
|--------|---------|--------|
| Orders | `LOCAL-` | LOCAL-{timestamp}-{random} |
| Payments | `LOCAL-PAYMENT-` | LOCAL-PAYMENT-{uuid} |
| Sessions | `LOCAL-SESSION-` | LOCAL-SESSION-{uuid} |

**Recommandation**: Harmoniser vers un pattern uniforme:
```
LOCAL-{ENTITY}-{timestamp}-{random}
```

Exemples:
- `LOCAL-ORDER-1706835600000-a1b2c3`
- `LOCAL-PAYMENT-1706835600000-d4e5f6`
- `LOCAL-SESSION-1706835600000-g7h8i9`

---

### ISSUE-007: AC Story 2.5 - Formulation Ambiguë

**Sévérité**: MINEURE (Clarification)

**Problème**: "Production requires online mode" devrait être plus explicite.

**Actuel**:
```
Then un message indique "Production requires online mode"
```

**Recommandé**:
```
Then un message indique "L'enregistrement de production nécessite une connexion internet"
And un bouton "Rappel" permet de sauvegarder une note locale
```

---

### ISSUE-008: Waiter Station - Documentation Manquante

**Sévérité**: MINEURE (Documentation)

**Problème**: Story 4.6 mentionne une exception pour la station "waiter" mais elle n'est pas documentée dans l'epic-list.md.

**AC Manquant**:
```
### AC (Additionnel): Exception Station Waiter
**Given** la station est configurée comme "waiter"
**When** tous les items de la commande sont prêts
**Then** la commande NE disparaît PAS automatiquement
**And** le serveur doit la marquer manuellement comme "servie"
```

---

### ISSUE-009: Conflits Timestamps - Non Documenté

**Sévérité**: MINEURE (Edge case)

**Problème**: La reconciliation des conflits utilise "Last-Write-Wins" basé sur `updated_at`, mais le comportement en cas de timestamps identiques n'est pas documenté.

**Recommandation**: Ajouter dans l'architecture:
```
En cas de timestamps identiques (rare):
- Priorité au server (server_id non-null = toujours gagnant)
- Sinon, priorité à l'entrée avec le plus grand ID
```

---

## Points Faibles Architecturaux

### PF-001: Pas de Monitoring Offline Period

**Observation**: Epic 3 implémente le sync mais ne trace pas les périodes offline.

**Impact**: Impossible d'analyser la fiabilité réseau post-factum.

**Solution**: Story 7.10 (Offline Period Logging) couvre ce besoin. Vérifier qu'elle est priorisée correctement.

---

### PF-002: Pas de Limite sur Sync Queue Size

**Observation**: La sync queue peut croître indéfiniment en cas de panne prolongée.

**Impact potentiel**:
- IndexedDB a une limite (~50MB typiquement)
- Performance dégradée avec 1000+ items

**Recommandation**: Ajouter dans Epic 5 ou 6:
- Alerte si queue > 100 items
- Stratégie de purge des items très anciens (> 7 jours)

---

### PF-003: Pas de Test de Charge KDS

**Observation**: Epic 4 tests couvrent les cas nominaux mais pas les scenarios de charge.

**Scenarios non testés**:
- 50+ commandes simultanées sur KDS
- Reconnexion avec 100 commandes en attente
- Latence réseau > 500ms

**Recommandation**: Ajouter dans le NFR testing avant production.

---

## Harmonisation Recommandée

### 1. Unified Sync Queue (Priorité HAUTE)

Supprimer/déprécier l'ancien système:

```
À DÉPRÉCIER:
- src/services/sync/offlineDb.ts
- src/services/sync/syncEngine.ts (V1)
- src/services/sync/syncQueue.ts (si utilise offlineDb)

À GARDER (V2):
- src/services/sync/syncEngineV2.ts
- src/services/sync/syncQueueHelpers.ts
- src/services/sync/orderSyncProcessor.ts
- src/services/sync/paymentSyncProcessor.ts
- src/services/sync/sessionSyncProcessor.ts
```

### 2. Convention de Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Tables Dexie | camelCase | `offlineOrders` |
| IDs locaux | LOCAL-{ENTITY}-{ts}-{rand} | `LOCAL-ORDER-17068...` |
| Services offline | {entity}CacheService | `ordersCacheService` |
| Services sync | {entity}SyncProcessor | `orderSyncProcessor` |

### 3. Templates de Stories

Standardiser le format des Dev Notes pour inclure:
1. Architecture Compliance (MANDATORY)
2. Files to Create/Modify
3. Dependencies on Previous Work
4. Anti-Patterns to AVOID
5. Testing Strategy

---

## Actions Recommandées

### Immédiates (Avant Epic 5)

| # | Action | Priorité | Effort |
|---|--------|----------|--------|
| 1 | Corriger titres Stories 4.1/4.2 dans epic-list.md | HAUTE | 10 min |
| 2 | Corriger backoff delays dans epic-list.md Story 3.6 | HAUTE | 5 min |
| 3 | Marquer offlineDb.ts et syncEngine.ts comme @deprecated | MOYENNE | 15 min |
| 4 | Ajouter AC waiter station dans Story 4.6 epic-list | BASSE | 5 min |

### Court terme (Epic 5-6)

| # | Action | Priorité | Effort |
|---|--------|----------|--------|
| 5 | Ajouter monitoring sync queue size | MOYENNE | 1 story |
| 6 | Harmoniser préfixes IDs locaux | BASSE | Refactor |
| 7 | Tests de charge KDS | BASSE | 1/2 journée |

### Moyen terme (Epic 7+)

| # | Action | Priorité | Effort |
|---|--------|----------|--------|
| 8 | Supprimer code legacy sync (V1) | HAUTE | 1 story |
| 9 | Migration Dexie table names vers camelCase unifié | BASSE | Migration |

---

## Conclusion

Les Epics 1-4 forment une base solide avec:
- ✅ Architecture offline-first bien conçue
- ✅ Patterns réutilisables documentés
- ✅ Tests unitaires complets
- ✅ Rétrospectives détaillées

Les issues identifiées sont principalement de l'ordre de:
- Incohérences terminologiques (documentation vs code)
- Dette technique legacy (dual sync systems)
- Clarifications manquantes (edge cases)

Aucune issue critique bloquante n'a été identifiée. Les corrections recommandées amélioreront la maintenabilité et réduiront la confusion pour les Epics futurs.

---

*Rapport généré par Claude Opus 4.5 - Révision Epics 1-4*

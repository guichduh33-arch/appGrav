# Project Context Analysis

_Analyse collaborative réalisée via Party Mode avec Winston (Architect), John (PM), Sally (UX), Amelia (Dev)_

### Requirements Overview

**Functional Requirements (56 FR across 7 domains):**

| Domaine | Count | Priorité MVP |
|---------|-------|--------------|
| Sales/POS | 14 | Critique |
| Inventory | 12 | Post-MVP |
| Customers & Loyalty | 8 | Partiel |
| Products | 6 | Post-MVP |
| Purchasing | 6 | Post-MVP |
| B2B | 5 | Post-MVP |
| Reporting | 5 | Post-MVP |

**Non-Functional Requirements (24 NFR - critiques):**

| NFR | Exigence | Impact Architectural |
|-----|----------|---------------------|
| Offline Autonomy | 2h sans connexion | IndexedDB + Sync Queue |
| Data Integrity | Zéro perte de données | CRDT ou Last-Write-Wins |
| LAN Latency | <500ms inter-device | WebSocket local |
| Response Time | <200ms interactions UI | Optimistic updates |
| Auth Speed | <2s changement utilisateur | PIN hash local |

### Scale & Complexity

- **Primary domain:** Full-stack (Frontend offline + Backend sync)
- **Complexity level:** Medium-High
- **Estimated architectural components:** 8-12 nouveaux modules
- **Existing codebase:** 67 tables, 21 enums, 20+ DB functions

**Complexity Indicators:**
- Real-time sync multi-device: HIGH
- Offline-first avec réconciliation: HIGH
- Multi-tenancy: LOW (single restaurant)
- Regulatory compliance: MEDIUM (fiscal receipts)
- Integration complexity: MEDIUM (imprimantes, displays)
- Data volume: MEDIUM (~200 transactions/jour)

### Technical Constraints & Dependencies

**Existants à préserver:**
- Supabase RLS policies (permission system)
- PIN-based auth via Edge Functions (pas Supabase Auth standard)
- React Query cache patterns
- Zustand stores (cart, auth, order, settings)
- i18next avec 3 locales bundled

**Nouvelles contraintes MVP:**
- Service Workers pour offline shell
- IndexedDB (Dexie.js) pour persistance locale
- WebSocket local pour LAN communication
- Capacitor plugins (Network, Background Sync)

### Cross-Cutting Concerns Identified

| Concern | Scope | Stratégie |
|---------|-------|-----------|
| Offline State Management | Toutes entités critiques (orders, cart, products, customers) | Dexie.js + React Query sync |
| LAN Communication | POS ↔ KDS ↔ Display ↔ Mobile | WebSocket avec POS comme hub |
| Sync Conflict Resolution | Orders, inventory movements | Last-write-wins + UI merge pour conflits |
| Authentication Offline | PIN verification sans serveur | PIN hash cached localement |
| Error Handling | Network failures, sync errors | Graceful degradation + retry queue |
| i18n Offline | 3 langues disponibles offline | Bundle complet des locales |
| RLS Permissions | Toutes opérations DB | Préserver pattern existant |

### Architecture Pattern Recommandé

```
[Internet disponible]
  POS/Mobile → Supabase Cloud ← autres apps
                    ↓
              Source de vérité

[Internet indisponible]
  App Mobile → POS Principal (LAN hub) → KDS/Display
                    ↓
              IndexedDB local
              Sync queue pending
```

**Justification:** Le POS principal fait office de hub local. Pattern simple, déterministe, fonctionne même sans internet. Supabase cloud reste source de vérité quand disponible.

### Risk Assessment

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Sync conflicts après 2h offline | Medium | High | UI de résolution simple + logs audit |
| LAN discovery failure | Low | Medium | Fallback manuel (IP config) |
| IndexedDB quota exceeded | Low | High | Purge anciennes données + alertes |
| PIN hash compromise | Low | Medium | Rotation périodique + audit logs |

---

_Analyse de contexte complétée le 2026-01-30 - Prêt pour décisions architecturales_

---

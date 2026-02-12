# AppGrav - Synthese du Projet (Fevrier 2026)

**Date**: 12 fevrier 2026
**Objectif**: Vue d'ensemble rapide pour comprendre la situation du projet.

---

## Identite du Projet

| Element | Detail |
|---------|--------|
| **Nom** | AppGrav (ERP/POS) |
| **Client** | The Breakery - Boulangerie francaise a Lombok, Indonesie |
| **Volume** | ~200 transactions/jour |
| **Devise** | IDR (roupie indonesienne), arrondi a 100 |
| **Taxe** | PPN 10% incluse dans les prix |
| **Langue** | Anglais uniquement (i18n suspendu) |

---

## Stack Technique

```
Frontend :  React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
State :     Zustand (11 stores) + @tanstack/react-query
Backend :   Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
Offline :   Dexie (IndexedDB) + vite-plugin-pwa
Mobile :    Capacitor (iOS/Android)
Charts :    Recharts v3.6.0
```

---

## Chiffres Cles du Code

| Metrique | Valeur |
|----------|--------|
| Lignes de code | ~118,000 LOC TypeScript/React |
| Composants React | ~112 (14 repertoires) |
| Pages/Routes | 111 |
| Hooks personnalises | ~117 (15 repertoires) |
| Services metier | ~74 (16 repertoires) |
| Stores Zustand | 11 |
| Migrations SQL | 62 (59 consolidees + 3 comptabilite) |
| Edge Functions | 13 (Deno) |
| Fichiers de test | 93 fichiers, ~1,650 tests |
| Couverture | Seuils: 60/50/60/60 (statements/branches/functions/lines) |

---

## Epics Completees (10/10)

| Epic | Sujet | Statut |
|------|-------|--------|
| 1 | Core System (Auth, Permissions, Config) | Done |
| 2 | Catalogue & Costing (Products, Categories, Recipes) | Done |
| 3 | POS & Sales (Split payments, Voids, Refunds, Print) | Done |
| 4 | KDS (Kitchen Display, Dispatch, LAN) | Done |
| 5 | Stock & Purchasing (Alerts, Transfers, Purchase Orders) | Done |
| 6 | Clients & Marketing (Loyalty, Promotions, Combos, B2B) | Done |
| 7 | Multi-Device (Customer Display, Mobile, Print Server) | Done |
| 8 | Analytics & Reports (27 tabs, Comparison, Offline cache) | Done |
| 9 | Accounting (Double-entry, Journals, VAT, Financial statements) | Done |
| 10 | Settings Expansion (65 settings, 9 custom UI pages) | Done |

---

## Readiness Production : 72%

### Ce qui est PRET

| Domaine | Statut | Detail |
|---------|--------|--------|
| TypeScript strict | OK | `strict: true`, `forceConsistentCasingInFileNames` |
| Error Boundaries | OK | Double couche (root + module), fallback UI |
| PWA/Offline | OK | Cache intelligent, auth-aware, fallback page |
| Console.log en prod | OK | Strippes par esbuild `drop: ['console']` |
| Code splitting | OK | Chunks vendor (react, query, supabase, ui) |
| Dependencies | OK | Separation propre dev/prod |
| ESLint | OK | 122 warnings (seuil 150), 0 erreurs |
| RLS Securite | OK | 156 "always true" corrigees -> 0 warning |
| Sync Engine | OK | Priorite, idempotence, resolution conflits |

### Ce qui MANQUE

| Domaine | Gravite | Detail |
|---------|---------|--------|
| Dashboard page d'accueil | Medium | `/` redirige vers `/pos`, pas de vue executive |
| `.env` dans git | CRITIQUE | Cles Supabase reelles exposees dans le depot |
| CI/CD Pipeline | High | Aucun GitHub Actions, deploiement manuel |
| Bundle analysis | Medium | Taille inconnue, pas de budget |
| Sentry/monitoring | Medium | TODO dans ErrorBoundary, pas d'error tracking |
| 18 fichiers CSS | Low | Migration Tailwind partielle (55/73 faits) |
| 10 TODO/FIXME | Low | Aucun bloquant production |

---

## Positionnement Concurrentiel

```
                    Richesse Fonctionnelle
                          |
                Full ERP  |  Odoo      ERPNext
                          |
              Restaurant  |     Toast      Revel
              Specialise  |        Lightspeed
                          |   TouchBistro
                          |       AppGrav ★
                          |          Square
                          |    Loyverse
                Basic POS | Floreant  uniCenta
                          |
          ----------------+------------------------
          Local/Offline       Cloud-Native
                    Modele de Deploiement
```

### Avantages AppGrav
1. **Offline robuste** dans zone a connectivite instable (Lombok)
2. **Auto-heberge** - pas de frais SaaS recurrents
3. **Gestion recettes/BOM** - specifique boulangerie
4. **PostgreSQL RLS** - securite base de donnees (rare dans l'industrie)
5. **PWA + Capacitor** - deploiement sans app store

### Ecarts vs Concurrence
1. Pas d'integration QRIS (de plus en plus obligatoire en Indonesie)
2. Pas d'e-Faktur (requis pour entreprises PKP)
3. Pas de split bill par invite
4. Pas de multi-location
5. KDS basique (pas d'aging/speed metrics)

---

## Architecture Offline-First

```
Mode Online:
  Component -> Hook (useQuery) -> Supabase -> Store

Mode Offline:
  Component -> Hook -> offlineService -> IndexedDB (Dexie)
  |
  Sync Queue (operations en attente, avec priorite)
  |
  Auto-sync quand online (5s delai, puis toutes les 30s)
  |
  Resolution conflits (UI side-by-side diff)
```

| Priorite Sync | Types d'entites |
|---------------|-----------------|
| Critique | void, refund, payment, session_close |
| Haute | order, order_update |
| Normale | product, stock_movement, category, customer |
| Basse | audit_log, settings |

---

## Plan d'Action (4 Phases, 24 semaines)

| Phase | Semaines | Focus | Items cles |
|-------|----------|-------|------------|
| **0** | Immediat | Dashboard executif | Page d'accueil avec KPIs, graphiques, alertes |
| **1** | 1-4 | Stabilisation | Securite `.env`, CI/CD, nettoyage, bundle |
| **2** | 5-8 | Features P1 | Email, QRIS/Midtrans, KDS ameliore |
| **3** | 9-16 | Features P2 | Depenses, split bill, e-Faktur, rapports auto |
| **4** | 17-24 | Scale | Multi-location, Sentry, E2E Playwright |

> Detail complet : [production-readiness-plan.md](production-readiness-plan.md)

---

## Documents de Reference

| Document | Contenu |
|----------|---------|
| [CLAUDE.md](../../CLAUDE.md) | Instructions projet, conventions, architecture |
| [CURRENT_STATE.md](../../CURRENT_STATE.md) | Etat des sprints, epics, known issues |
| [DATABASE_SCHEMA.md](../../DATABASE_SCHEMA.md) | Schema BDD, views, fonctions, RLS |
| [production-readiness-plan.md](production-readiness-plan.md) | Plan detaille pre-production (ce document) |
| [improvement-roadmap.md](improvement-roadmap.md) | Roadmap 6 mois (3 phases) |
| [missing-modules-specs.md](missing-modules-specs.md) | Specs des 9 modules manquants |
| [architecture-recommendations.md](architecture-recommendations.md) | Recommandations architecture |
| [comparative-matrix.md](comparative-matrix.md) | Matrice comparative ERP |
| [erp-market-analysis.md](erp-market-analysis.md) | Analyse marche POS/ERP |

# Phase 0 : Rapport de Reconnaissance

**Date** : 2026-02-11
**Projet** : AppGrav - ERP/POS The Breakery Lombok

---

## 1. Vue d'ensemble

| Metric | Value |
|--------|-------|
| Fichiers TypeScript | 590 |
| Lignes de code (src/) | ~130,000 |
| Migrations SQL | 60 |
| Edge Functions | 13 |
| Zustand Stores | 11+ |
| Tests | ~1,650 (93 fichiers) |
| Epics completees | 10 (sur 10) |

## 2. Etat du Build

### TypeScript (`npx tsc --noEmit`)
**ECHEC** — 19 erreurs :

| Type d'erreur | Count | Details |
|---------------|-------|---------|
| TS1261 Casing (button.tsx vs Button.tsx) | 2 | Imports avec casing different (badge, button) |
| TS2307 Module manquant (`mockProducts`) | 3 | `src/data/mockProducts` n'existe plus |
| TS2307 Module manquant (`@dnd-kit/*`) | 3 | `CategoriesPage.tsx` — types non resolus |
| TS7006 Implicit `any` | 11 | Parametres non types dans hooks/pages products+inventory+settings |

### Build Production (`npm run build`)
**ECHEC** — memes erreurs TypeScript bloquent la compilation.

### ESLint
Config flat (eslint.config.js) — l'option `--ext` n'est plus supportee. Warning count dernier connu: 122.

## 3. Vulnerabilites npm

| Package | Severity | Issue |
|---------|----------|-------|
| `@isaacs/brace-expansion` 5.0.0 | HIGH | Uncontrolled Resource Consumption |
| `diff` 4.0.0-4.0.3 | HIGH | DoS in parsePatch/applyPatch |
| `esbuild` <=0.24.2 | MODERATE | Dev server request vulnerability |
| `jspdf` <=4.0.0 | HIGH | PDF Injection, DoS, XMP Injection, Race Condition |
| `tar` <=7.5.6 | HIGH | Arbitrary File Overwrite, Symlink Poisoning, Hardlink Traversal |

## 4. Fichiers Depasses (>300 lignes convention)

| File | Lines | Issue |
|------|-------|-------|
| `database.generated.ts` | 6,986 | Auto-genere — acceptable |
| `B2BOrderDetailPage.tsx` | 1,027 | Candidat refactoring |
| `promotionService.test.ts` | 999 | Test — acceptable |
| `CustomerSearchModal.tsx` | 941 | Candidat refactoring |
| `cartStore.test.ts` | 879 | Test — acceptable |
| `PromotionFormPage.tsx` | 862 | Candidat refactoring |
| `UsersPage.tsx` | 831 | Candidat refactoring |
| `OrdersPage.tsx` | 819 | Candidat refactoring |
| `StockProductionPage.tsx` | 819 | Candidat refactoring |
| `B2BPaymentsPage.tsx` | 803 | Candidat refactoring |
| `authService.ts` | 794 | Candidat refactoring |
| `ComboFormPage.tsx` | 788 | Candidat refactoring |
| `VariantsTab.tsx` | 759 | Candidat refactoring |
| `SettingsPage.tsx` | 751 | Candidat refactoring |
| `NotificationSettingsPage.tsx` | 726 | Candidat refactoring |
| `B2BOrderFormPage.tsx` | 721 | Candidat refactoring |
| `FloorPlanEditor.tsx` | 703 | Candidat refactoring |
| `PaymentModal.tsx` | 699 | Candidat refactoring |
| `ProductionPage.tsx` | 697 | Candidat refactoring |
| `db.ts` | 690 | Candidat refactoring |

**20 fichiers > 300 lignes** (hors tests et types auto-generes)

## 5. Architecture Existante

### Points Positifs
- Design system bien structure (design tokens CSS, Tailwind config riche)
- Theme bakery avec couleurs thematiques (flour, cream, kraft, wheat, espresso, gold)
- Offline-first architecture avec Dexie + sync engine
- PWA configuree (manifest, workbox, runtime caching)
- Security: RLS, auth JWT, PIN offline, rate limiting
- Production console.log stripping dans Vite config
- 10 epics completees avec tests

### Points Problematiques
- **Build casse** : 19 erreurs TS bloquantes
- **Fichier fantome** : `mockProducts` reference mais supprime
- **Casing inconsistant** : `button.tsx` vs `Button.tsx` (probleme Git Windows)
- **Dependencies @dnd-kit** : installees dans package.json mais types non resolus
- **Fichiers trop longs** : 20+ fichiers depassent la convention 300 lignes
- **Vulnerabilites npm** : 5 packages avec CVE (dont jspdf HIGH)
- **i18n suspendu** : infrastructure existante mais desactivee

## 6. Priorite Immediate

1. **BLOQUANT** : Corriger les 19 erreurs TS pour restaurer le build
2. **CRITIQUE** : Mettre a jour les deps vulnerables (jspdf, tar, diff, brace-expansion)
3. **IMPORTANT** : Resoudre le conflit de casing button.tsx/Button.tsx

---

## Prochaine Etape : Lancement des 4 Subagents d'Audit (Cycle 1)

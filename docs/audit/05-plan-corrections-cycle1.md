# Plan de Corrections Consolide — Cycle 1

**Date** : 2026-02-11 (mis a jour 2026-02-12)
**Sources** : 01-architecture.md, 02-backend-database.md, 03-security.md, 04-functional.md

---

## Classification des Problemes

### BLOQUANT (Empeche la mise en production)

| # | Source | Description | Effort | Statut |
|---|--------|-------------|--------|--------|
| B1 | Security | **PIN hash expose au client** — `MobileLoginPage.tsx:106` fetch `pin_hash` (bcrypt) vers le navigateur | XS | ~~FAIT~~ |
| B2 | Security | **XSS Stored dans factures** — `generate-invoice` et `B2BOrderDetailPage` interpole HTML sans echappement | S | ~~FAIT~~ |
| B3 | Backend | **RLS trop permissives** — ~50 tables avec `USING(TRUE)` pour INSERT/UPDATE/DELETE | L | PARTIEL (8 tables critiques) |
| B4 | Backend | **2 Edge Functions CORS wildcard + sans session** — `intersection_stock_movements`, `purchase_order_module` | S | ~~FAIT~~ |
| B5 | Backend | **`update_setting()` SECURITY DEFINER sans check permission** — N'importe quel authentifie peut modifier les settings systeme | S | ~~FAIT~~ |
| B6 | ~~Build~~ | ~~19 erreurs TypeScript~~ | ~~FAIT~~ | ~~FAIT~~ |

### CRITIQUE (Doit etre corrige avant production)

| # | Source | Description | Effort | Statut |
|---|--------|-------------|--------|--------|
| C1 | Backend | **Tax rate default 0.11 au lieu de 0.10** dans `purchase_orders` | XS | ~~FAIT~~ |
| C2 | Backend | **`deduct_stock_on_sale_items()` ne met pas a jour `section_stock`** (source de verite) | M | ~~FAIT~~ |
| C3 | Security | **~111 pages, seulement 2 utilisent PermissionGuard** — Toutes les pages admin accessibles a tout authentifie | M | ~~FAIT~~ (RouteGuard sur toutes les routes admin) |
| C4 | Security | **SMTP password en clair dans `settings`** — Lisible par tout authentifie | S | ~~FAIT~~ (password jamais charge cote client) |
| C5 | Backend | **`auth-verify-pin` n'incremente pas les echecs** — Rate limiting serveur ineffectif | S | ~~FAIT~~ |
| C6 | Backend | **`auth-logout` sans validation proprietaire** — Un utilisateur peut deconnecter un autre | XS | ~~FAIT~~ |
| C7 | Backend | **`send-to-printer` tax hardcodee 11%** | XS | ~~FAIT~~ |
| C8 | Architecture | **0 React.memo** sur 100+ composants — Performance POS/KDS degradee | M | ~~FAIT~~ |
| C9 | Architecture | **N+1 queries** dans comptabilite (30+ appels) et inventoryAlerts (100+ appels) | M | ~~FAIT~~ |
| C10 | Fonctionnel | **46 textes francais** dans 15 fichiers (convention English-only) | S | ~~FAIT~~ |

### IMPORTANT (Fortement recommande)

| # | Source | Description | Effort | Statut |
|---|--------|-------------|--------|--------|
| I1 | Architecture | 55+ `as any` casts | L | PARTIEL (44→22 prod, helpers centralises) |
| I2 | Architecture | 40+ `as unknown as X` unsafe casts | L | ~~FAIT~~ (remplaces par types propres) |
| I3 | Architecture | 17 appels Supabase directs dans pages/components | M | ~~FAIT~~ |
| I4 | Architecture | 1 seul ErrorBoundary au root (crash POS = crash app) | S | ~~FAIT~~ |
| I5 | Architecture | Code mort : `ProductionPage.tsx` (697 lignes, jamais importe) | XS | ~~FAIT~~ |
| I6 | Architecture | Hooks `useProducts` dupliques (root vs feature) | S | ~~FAIT~~ |
| I7 | Backend | `user_profiles.pin_code` colonne en clair non supprimee | XS | ~~FAIT~~ |
| I8 | Backend | `loyalty_transactions.order_id` sans FK | XS | ~~FAIT~~ |
| I9 | Backend | Pas de nettoyage `idempotency_keys` et `sync_queue` | S | ~~FAIT~~ |
| I10 | Backend | Tokens session en clair dans `pin_auth_sessions` | M | ~~FAIT~~ |
| I11 | Security | Service Worker ne cache pas les Edge Functions auth en NetworkOnly | XS | ~~FAIT~~ |
| I12 | Fonctionnel | Arrondi IDR manquant sur le total panier | XS | ~~FAIT~~ |
| I13 | Fonctionnel | Bouton "Voir" B2B client non fonctionnel | XS | ~~FAIT~~ |

### SOUHAITABLE (Amelioration qualite)

| # | Source | Description | Effort | Statut |
|---|--------|-------------|--------|--------|
| S1 | Architecture | 20+ fichiers > 400 lignes (refactoring) | XL |
| S2 | Architecture | 13 `error: any` dans catch blocks | S | ~~FAIT~~ |
| S3 | Architecture | 46 eslint-disable suppressions | M |
| S4 | Architecture | Pas de vendor chunk splitting | S | ~~FAIT~~ |
| S5 | Architecture | 84 CSS files alongside Tailwind | L |
| S6 | Architecture | 413 inline styles | L |
| S7 | Security | Pas de Content-Security-Policy | S |
| S8 | Security | Pas de rate limiting IP sur auth online | M |
| S9 | Backend | `generate-invoice` numero non thread-safe | S |
| S10 | Backend | Vues reporting ignorent paiements splits | M |
| S11 | Fonctionnel | 5 rapports placeholder non implementes | M |
| S12 | Fonctionnel | Allergenes produits (securite alimentaire) | M |
| S13 | Fonctionnel | Points fidelite non utilisables dans le flux POS | M |
| S14 | Fonctionnel | Facture B2B formelle PDF manquante | L |

---

## Plan d'Execution Propose

### Batch 1 — Fixes securite BLOQUANTS (B1-B5, C1, C6-C7)

**Effort** : ~2h
**Actions** :
1. Supprimer `pin_hash` du SELECT dans `MobileLoginPage.tsx`
2. Ajouter fonction `escapeHtml()` dans `generate-invoice` et `B2BOrderDetailPage`
3. Corriger CORS + ajouter session auth sur 2 Edge Functions legacy
4. Ajouter check permission dans `update_setting()`, `update_settings_bulk()`, `reset_setting()`
5. Corriger tax rate default 0.11 -> 0.10 (migration)
6. Valider proprietaire session dans `auth-logout`
7. Corriger tax hardcodee 11% -> 10% dans `send-to-printer`
8. Incrementer echecs PIN dans `auth-verify-pin` (C5)

### Batch 2 — Fixes architecture CRITIQUES (C8-C10, I4-I6)

**Effort** : ~3h
**Actions** :
1. Ajouter `React.memo` aux composants POS critiques (ProductGrid, CartItemRow, etc.)
2. Corriger les N+1 queries (accounting batch RPC, inventoryAlerts joins)
3. Traduire les 46 textes francais en anglais
4. Ajouter ErrorBoundaries (POS, Reports, Settings)
5. Supprimer `ProductionPage.tsx` mort
6. Consolider les hooks `useProducts` dupliques

### Batch 3 — Fixes backend IMPORTANTS (I7-I12, C2-C4)

**Effort** : ~3h
**Actions** :
1. Migration: supprimer colonne `user_profiles.pin_code`
2. Migration: ajouter FK `loyalty_transactions.order_id`
3. Migration: ajouter nettoyage periodique idempotency_keys/sync_queue
4. Corriger `deduct_stock_on_sale_items()` pour section_stock
5. Ajouter PermissionGuard sur les routes admin
6. Deplacer SMTP password vers Supabase Vault ou env vars
7. Ajouter arrondi IDR sur total panier
8. Fixer bouton "Voir" B2B

### Batch 4 — Qualite & Hardening (S1-S4, S7)

**Effort** : ~4h
**Actions** :
1. Vendor chunk splitting dans vite.config
2. Remplacer les 13 `error: any` par proper error handling
3. Ajouter CSP header
4. Commencer refactoring des fichiers > 700 lignes (top 5)

---

## Decisions Requises (Validation Proprietaire)

1. **RLS stricter (B3)** : Reimplementer les policies d'ecriture pour ~50 tables va impacter tous les appels. Confirmer qu'on procede ?
2. **SMTP password (C4)** : Deplacer vers Vault Supabase ou variables d'environnement Edge Function ?
3. **Allergenes (S12)** : Ajouter un champ allergenes aux produits pour la V1 ?
4. **Points fidelite POS (S13)** : Integrer l'echange de points dans le PaymentModal pour la V1 ?
5. **Facture B2B (S14)** : Generer une facture PDF formelle avec mentions legales indonesiennes pour la V1 ?
6. **Rapports placeholder (S11)** : Implementer les 5 rapports manquants ou les retirer de l'UI ?

---

## Prochaine Etape

Apres validation du plan, je lance les subagents de correction :
- **Fix-Security** : Batch 1
- **Fix-Frontend** : Batch 2
- **Fix-Backend** : Batch 3
- Puis Batch 4 apres validation build

# PROMPT — Assemblage Frontend-Driven : Adapter le Backend au Nouveau Design Stitch

---

## IDENTITÉ & MISSION

Tu es un **architecte fullstack senior** opérant en mode **multi-agent** via Antigravity/Claude Code. Ta mission est de prendre le **nouveau design frontend généré par Stitch** comme **source de vérité** et d'**adapter, étendre, ou créer le backend Supabase** nécessaire pour que chaque page, chaque composant, chaque interaction du design fonctionne parfaitement.

**Principe fondamental : LE FRONTEND DRIVE LE BACKEND.**
Le design Stitch représente le produit final voulu. Si une page Stitch nécessite une table, une Edge Function, une relation, un endpoint, un trigger, ou une dépendance qui n'existe pas encore → TU LE CRÉES.

**Projet** : AppGrav — ERP/POS de The Breakery Lombok (boulangerie française, Indonésie)
**Stack** : React 18 + TypeScript + Vite + Tailwind CSS + Supabase (PostgreSQL v17)
**Supabase Project ID** : `ekkrzngauxqruvhhstjw` (région ap-southeast-1)
**Cibles** : Tablettes Android, Windows dual-screen POS, PWA
**Base existante** : 68 tables, 7 Edge Functions, RLS sur toutes les tables
**Données à préserver** : 358 produits, 768 recettes, 53 catégories, 128 role_permissions
**Langues** : FR / ID / EN (i18n obligatoire)

---

## PHILOSOPHIE D'ASSEMBLAGE

```
┌─────────────────────────────────────────────────┐
│           DESIGN STITCH (Source de vérité)        │
│  Pages, composants, interactions, navigation      │
└──────────────────────┬──────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │   ANALYSE DES BESOINS   │
          │  Pour chaque composant  │
          │  Stitch, identifier :   │
          │  - Données nécessaires  │
          │  - Actions utilisateur  │
          │  - Flux temps réel      │
          │  - Permissions requises │
          └────────────┬────────────┘
                       │
        ┌──────────────▼──────────────┐
        │      GAP ANALYSIS           │
        │  Comparer besoins frontend  │
        │  vs backend existant        │
        └──────────────┬──────────────┘
                       │
     ┌─────────────────┼─────────────────┐
     ▼                 ▼                 ▼
┌─────────┐    ┌──────────────┐    ┌──────────┐
│ EXISTE  │    │ EXISTE MAIS  │    │ N'EXISTE │
│ & OK    │    │ INCOMPLET    │    │ PAS      │
│→ Brancher│   │→ Adapter     │    │→ Créer   │
└─────────┘    └──────────────┘    └──────────┘
```

---

## PHASE 0 : AUDIT CROISÉ FRONTEND ↔ BACKEND

### 0.1 — Scanner exhaustif du design Stitch

```
Pour CHAQUE page/écran du design Stitch, produire une fiche :

┌─────────────────────────────────────────────────────┐
│ PAGE : [Nom de la page Stitch]                       │
├─────────────────────────────────────────────────────┤
│ DONNÉES AFFICHÉES                                    │
│  - Quelles données sont visibles à l'écran ?         │
│  - Quels champs (texte, nombre, date, image) ?       │
│  - Y a-t-il des listes, tableaux, grilles ?          │
│  - Y a-t-il des compteurs, statistiques, KPIs ?      │
│  - Y a-t-il des graphiques ou charts ?               │
├─────────────────────────────────────────────────────┤
│ ACTIONS UTILISATEUR                                  │
│  - Quels boutons/CTA sont présents ?                 │
│  - Quels formulaires de saisie ?                     │
│  - Quels filtres, tris, recherches ?                 │
│  - Quelles modales/drawers/popups ?                  │
│  - Quels drag & drop, toggles, sliders ?             │
├─────────────────────────────────────────────────────┤
│ FLUX TEMPS RÉEL                                      │
│  - Des données doivent-elles se rafraîchir live ?    │
│  - Notifications push nécessaires ?                  │
│  - Synchronisation entre écrans (POS↔KDS) ?          │
├─────────────────────────────────────────────────────┤
│ NAVIGATION                                           │
│  - Liens vers d'autres pages ?                       │
│  - Breadcrumbs, tabs, sous-navigation ?              │
│  - Retour arrière, pagination ?                      │
├─────────────────────────────────────────────────────┤
│ PERMISSIONS                                          │
│  - Qui peut voir cette page (rôles) ?                │
│  - Qui peut effectuer chaque action ?                │
│  - Y a-t-il des éléments masqués selon le rôle ?     │
└─────────────────────────────────────────────────────┘
```

### 0.2 — Gap Analysis : Besoins Frontend vs Backend Existant

```
Pour chaque besoin identifié en 0.1, classifier :

🟢 EXISTE & COMPATIBLE
  Table/function existe, schéma compatible, RLS OK
  → Action : Brancher directement via hook React

🟡 EXISTE MAIS INCOMPLET
  Table existe mais il manque des colonnes, des relations,
  des indexes, des RLS policies, ou le schéma ne correspond pas
  → Action : Migration ALTER TABLE + adaptation

🔴 N'EXISTE PAS
  Nouvelle page Stitch qui nécessite :
  - Nouvelle(s) table(s)
  - Nouvelle(s) Edge Function(s)
  - Nouveau(x) trigger(s) / function(s) PostgreSQL
  - Nouvelle(s) relation(s) entre tables existantes
  - Nouvelle(s) dépendance(s) npm
  → Action : Création complète avec migration

Produire un tableau récapitulatif :

| Page Stitch | Besoin Frontend | Backend Existant | Status | Action Requise |
|-------------|----------------|-----------------|--------|---------------|
| Dashboard | KPIs temps réel | Pas de vues agrégées | 🔴 | Créer vues materialisées + function |
| POS v2 | Split payment | orders n'a pas de champ split | 🟡 | ALTER orders + table order_payments |
| Réservations | Système complet | Table inexistante | 🔴 | Créer tables reservations, reservation_slots |
| Rapport Marge | Calcul marge auto | recipes existe mais pas de coût calculé | 🟡 | Ajouter cost_price + trigger calcul |
| Chat interne | Messagerie staff | Rien | 🔴 | Créer tables messages + Realtime |
| ... | ... | ... | ... | ... |
```

### 0.3 — Plan de création backend

```
Regrouper toutes les actions 🔴 et 🟡 en un plan ordonné :

1. NOUVELLES TABLES À CRÉER
   Pour chaque nouvelle table :
   - Nom, colonnes, types, contraintes
   - Relations FK vers tables existantes
   - Indexes nécessaires
   - RLS policies (basées sur le système de rôles existant)
   - Données initiales (seed) si nécessaire

2. TABLES EXISTANTES À MODIFIER (ALTER)
   Pour chaque modification :
   - Table concernée
   - Colonnes à ajouter/modifier
   - Impact sur les données existantes (PRÉSERVER les 358 produits, etc.)
   - Nouvelles contraintes ou indexes

3. NOUVELLES EDGE FUNCTIONS
   Pour chaque nouvelle function :
   - Nom, endpoint, méthode HTTP
   - Paramètres d'entrée/sortie
   - Logique métier
   - Authentification (JWT ou PIN custom)

4. NOUVEAUX TRIGGERS & FUNCTIONS PostgreSQL
   - Calculs automatiques (totaux, marges, stock)
   - Cascades de mise à jour
   - Logs d'audit

5. NOUVELLES DÉPENDANCES NPM
   - Librairies frontend manquantes (charts, PDF, excel, etc.)
   - Vérifier compatibilité avec React 18 + Vite + TypeScript

6. NOUVELLES SUBSCRIPTIONS REALTIME
   - Tables qui nécessitent du temps réel (commandes, KDS, stock)
   - Canaux de broadcast pour la communication inter-écrans
```

---

## PHASE 1 : EXÉCUTION BACKEND — ADAPTER & CRÉER

### 1.1 — Migrations Supabase (ordre strict)

```
RÈGLES DE MIGRATION IMPÉRATIVES :

1. UNE migration par changement logique (pas de mega-migration)
2. Nommage : YYYYMMDDHHMMSS_description_snake_case.sql
3. Chaque migration DOIT être réversible (DOWN inclus)
4. JAMAIS de DROP TABLE sur une table avec des données
5. ALTER TABLE avec DEFAULT pour les nouvelles colonnes NOT NULL
6. Tester chaque migration individualement avant la suivante
7. Générer les types TypeScript après chaque migration

Ordre d'exécution :
  A) Tables de référence (lookup tables) en premier
  B) Tables transactionnelles ensuite
  C) Vues et fonctions en dernier
  D) RLS policies après chaque CREATE TABLE
  E) Indexes après les données initiales
```

### 1.2 — Création des nouvelles Edge Functions

```
Pour chaque nouvelle Edge Function requise par le design Stitch :

1. Créer dans : supabase/functions/[nom-function]/index.ts
2. Pattern standard :

   import "jsr:@supabase/functions-js/edge-runtime.d.ts";
   import { createClient } from "jsr:@supabase/supabase-js@2";

   Deno.serve(async (req: Request) => {
     // 1. Vérifier l'authentification (PIN ou JWT)
     // 2. Valider les paramètres d'entrée
     // 3. Exécuter la logique métier
     // 4. Retourner la réponse avec types corrects
     // 5. Gérer les erreurs proprement
   });

3. Déployer et tester immédiatement
4. Documenter l'endpoint dans un fichier API.md
```

### 1.3 — Adaptation des hooks React existants + nouveaux hooks

```
Pour chaque page Stitch, créer ou adapter le hook correspondant :

PATTERN DE HOOK STANDARD :

/src/hooks/use[Module].ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

// Types dérivés pour l'UI
type [Module]Row = Database['public']['Tables']['[table]']['Row'];
type [Module]Insert = Database['public']['Tables']['[table]']['Insert'];
type [Module]Update = Database['public']['Tables']['[table]']['Update'];

// UI-specific types (formulaires, filtres, etc.)
interface [Module]FormData { ... }
interface [Module]Filters { ... }

export function use[Module]() {
  const queryClient = useQueryClient();

  // READ — avec filtres, pagination, tri
  const list = useQuery({ ... });

  // READ — détail par ID
  const getById = (id: string) => useQuery({ ... });

  // CREATE — avec optimistic update
  const create = useMutation({ ... });

  // UPDATE — avec optimistic update
  const update = useMutation({ ... });

  // DELETE — avec confirmation
  const remove = useMutation({ ... });

  // REALTIME — si nécessaire pour cette page
  useEffect(() => {
    const subscription = supabase
      .channel('[table]-changes')
      .on('postgres_changes', { ... })
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, []);

  return { list, getById, create, update, remove };
}

HOOKS À CRÉER (basé sur le design Stitch) :
- Hooks existants à adapter : useAuth, useProducts, useOrders, useStock, etc.
- NOUVEAUX hooks pour les pages Stitch qui n'ont pas d'équivalent backend :
  → Identifier dynamiquement en Phase 0
```

---

## PHASE 2 : ASSEMBLAGE PAGE PAR PAGE (Frontend-Driven)

### Workflow pour chaque page Stitch

```
Pour CHAQUE page du design Stitch, suivre ce workflow exact :

┌─ ÉTAPE 1 : ANALYSE ─────────────────────────────────┐
│ Ouvrir le composant Stitch                            │
│ Lister TOUS les éléments de données et d'interaction  │
│ Comparer avec le résultat de la Gap Analysis (Phase 0)│
└───────────────────────────┬──────────────────────────┘
                            ▼
┌─ ÉTAPE 2 : BACKEND READY ? ─────────────────────────┐
│ OUI (🟢) → Passer à l'étape 3                        │
│ PARTIEL (🟡) → Exécuter la migration ALTER, puis → 3 │
│ NON (🔴) → Créer tables + functions + RLS, puis → 3  │
│                                                       │
│ ⚠️ NE JAMAIS commencer l'assemblage frontend          │
│    tant que le backend n'est pas prêt et testé        │
└───────────────────────────┬──────────────────────────┘
                            ▼
┌─ ÉTAPE 3 : GÉNÉRER LES TYPES ───────────────────────┐
│ npx supabase gen types typescript                     │
│ → Met à jour /src/types/database.ts                   │
│ → Vérifier que les nouveaux types sont corrects       │
└───────────────────────────┬──────────────────────────┘
                            ▼
┌─ ÉTAPE 4 : HOOK REACT ──────────────────────────────┐
│ Créer ou adapter le hook pour cette page              │
│ → CRUD complet avec types stricts                     │
│ → Optimistic updates si pertinent                     │
│ → Realtime subscription si données live               │
│ → Gestion d'erreur + loading states                   │
└───────────────────────────┬──────────────────────────┘
                            ▼
┌─ ÉTAPE 5 : CONNECTER LE COMPOSANT STITCH ───────────┐
│ Prendre le composant Stitch (UI statique)             │
│ → Remplacer les données mockées par le hook           │
│ → Brancher les événements (onClick, onChange, etc.)    │
│ → Implémenter les modales, formulaires, filtres       │
│ → Ajouter les guards de permission                    │
│ → Ajouter les traductions i18n                        │
│                                                       │
│ PRÉSERVER LE DESIGN STITCH :                          │
│ → NE PAS modifier le layout, les couleurs, l'espacement│
│ → NE PAS "simplifier" l'UI                            │
│ → Si un ajustement est nécessaire, le noter           │
└───────────────────────────┬──────────────────────────┘
                            ▼
┌─ ÉTAPE 6 : TESTER ──────────────────────────────────┐
│ □ Les données réelles s'affichent correctement        │
│ □ Le CRUD fonctionne (créer, lire, modifier, suppr.)  │
│ □ Les permissions bloquent les actions non autorisées  │
│ □ L'interface est tactile-friendly (boutons ≥ 44px)   │
│ □ Le responsive fonctionne (tablette portrait/paysage)│
│ □ Les traductions sont complètes (FR/ID/EN)           │
│ □ Les états vides/chargement/erreur sont gérés        │
│ □ Le Realtime fonctionne si applicable                │
└───────────────────────────┬──────────────────────────┘
                            ▼
┌─ ÉTAPE 7 : COMMIT & RAPPORT ────────────────────────┐
│ git commit avec message descriptif                    │
│ Produire le rapport de module (voir format ci-dessous)│
└──────────────────────────────────────────────────────┘
```

### Ordre de priorité des pages

```
PRIORITÉ ABSOLUE (Production minimum viable) :
  1. Page Login / Auth PIN
  2. Page POS / Caisse
  3. Page KDS / Kitchen Display
  4. Page Customer Display

PRIORITÉ HAUTE (Gestion quotidienne) :
  5. Page Catalogue Produits
  6. Page Gestion Stock
  7. Page Clients & Fidélité
  8. Dashboard principal

PRIORITÉ MOYENNE (Business étendu) :
  9. Page B2B
  10. Page Achats / Fournisseurs
  11. Page Promotions
  12. Page Rapports & Analytics

PRIORITÉ STANDARD (Configuration) :
  13. Page Paramètres
  14. Page Utilisateurs & Rôles
  15. Page Plan de Salle
  16. Page Sync & Réseau

PAGES POTENTIELLEMENT NOUVELLES (à découvrir dans Stitch) :
  17+ Toute page Stitch qui n'a pas de correspondance backend
      → CRÉER le backend nécessaire en priorité selon la catégorie
```

---

## PHASE 3 : GESTION DES DÉPENDANCES

### 3.1 — Nouvelles dépendances npm potentielles

```
Évaluer et installer si le design Stitch les requiert :

GRAPHIQUES & VISUALISATION
  - recharts ou chart.js → dashboards, rapports
  - @nivo/core → graphiques avancés
  - d3 → visualisations custom

TABLES & DONNÉES
  - @tanstack/react-table → tableaux complexes avec tri/filtre
  - react-virtuoso → listes virtualisées (performances)

PDF & IMPRESSION
  - @react-pdf/renderer → génération PDF tickets/rapports
  - react-to-print → impression directe

EXPORT
  - xlsx → export Excel
  - papaparse → CSV

DRAG & DROP
  - @dnd-kit/core → plan de salle, KDS drag
  - react-beautiful-dnd → alternative

FORMULAIRES
  - react-hook-form + zod → validation formulaires
  - @hookform/resolvers → intégration zod

DATE & HEURE
  - date-fns → manipulation dates (léger)
  - react-day-picker → calendrier

INTERNATIONALISATION
  - i18next + react-i18next → traductions FR/ID/EN
  - @formatjs/intl → formatage nombres/devises

UI COMPLÉMENTS
  - lucide-react → icônes (OBLIGATOIRE, pas d'émojis)
  - react-hot-toast ou sonner → notifications
  - cmdk → command palette (recherche rapide)
  - @radix-ui/* → primitives UI accessibles

AUDIO
  - howler.js → sons KDS (nouvelle commande, alerte)

SCAN
  - @yudiel/react-qr-scanner → scan QR codes
  - quagga2 → scan codes-barres (si caméra tablette)

RÉSEAU
  - @supabase/supabase-js → client Supabase (déjà installé)
  - @tanstack/react-query → cache et état serveur

RÈGLE : N'installer QUE ce que le design Stitch requiert réellement.
         Pas d'installation préventive.
```

### 3.2 — Configuration Vite / TypeScript

```
Vérifier et adapter si nécessaire :

vite.config.ts :
  - Aliases (@/ pour src/)
  - Proxy API si nécessaire
  - PWA plugin (vite-plugin-pwa)
  - Build optimisation (chunk splitting par route)

tsconfig.json :
  - Strict mode activé
  - Path aliases cohérents
  - Types Supabase inclus

tailwind.config.ts :
  - Design tokens Stitch intégrés
  - Purge configuré pour le build prod
  - Plugins nécessaires (forms, typography, etc.)

.env :
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - Autres variables nécessaires
```

---

## PHASE 4 : GESTION DES CAS SPÉCIAUX

### 4.1 — Pages Stitch totalement nouvelles (sans backend)

```
Quand une page Stitch n'a AUCUN backend correspondant :

1. ANALYSER la page en détail :
   - Quel problème business résout-elle ?
   - Quelles données manipule-t-elle ?
   - Comment s'intègre-t-elle aux modules existants ?

2. CONCEVOIR le schéma backend :
   - Nouvelles tables avec relations
   - Edge Functions si logique complexe
   - Triggers si automatisation nécessaire

3. IMPLÉMENTER dans l'ordre :
   a) Migration SQL (CREATE TABLE, policies, indexes)
   b) Seed data si nécessaire
   c) Edge Functions si nécessaire
   d) Générer les types TypeScript
   e) Créer le hook React
   f) Connecter le composant Stitch
   g) Tester

4. EXEMPLES PROBABLES :
   - Page "Recettes/Production" → peut nécessiter production_batches, production_steps
   - Page "Réservations" → tables reservations, time_slots
   - Page "Livraisons" → delivery_routes, delivery_tracking
   - Page "Catering/Traiteur" → catering_orders, catering_menus
   - Page "Analyse Marge" → vues matérialisées, functions de calcul
   - Page "Planning Staff" → staff_schedules, shift_types
   - Page "Communication" → notifications, announcements
   - Page "Maintenance" → equipment, maintenance_logs
```

### 4.2 — Composants Stitch avec interactions complexes

```
Pour les composants avec logique métier non triviale :

CALCULS CÔTÉ CLIENT :
  - Calcul panier POS (prix × quantité, taxes, remises)
  - Totaux et sous-totaux
  - Filtres et recherches
  → Implémenter dans le hook ou un utils/ dédié

CALCULS CÔTÉ SERVEUR (Edge Function ou trigger) :
  - Décrément stock après vente
  - Calcul fidélité (points, paliers)
  - Rapports agrégés
  - Valorisation du stock
  → Créer une Edge Function ou un trigger PostgreSQL

FLUX MULTI-ÉTAPES :
  - Workflow commande : panier → paiement → impression → KDS
  - Workflow achat : commande → réception → mise en stock
  - Workflow B2B : commande → validation → préparation → livraison → paiement
  → Utiliser un state machine (zustand ou context)

SYNCHRONISATION INTER-ÉCRANS :
  - POS → KDS (Supabase Realtime)
  - POS → Customer Display (Realtime)
  - Multi-POS (sessions simultanées)
  → Supabase Channels + broadcast
```

### 4.3 — Résolution de conflits Design ↔ Backend

```
Si le design Stitch suppose une structure de données différente
de ce qui existe dans le backend :

RÈGLE : LE DESIGN STITCH GAGNE (sauf si ça casse les données existantes)

CAS 1 : Stitch affiche des champs qui n'existent pas dans la table
  → ALTER TABLE ADD COLUMN avec valeur DEFAULT
  → Préserver les données existantes

CAS 2 : Stitch organise les données différemment (relations)
  → Créer une table de jointure ou modifier les FK
  → Migrer les données existantes vers la nouvelle structure

CAS 3 : Stitch nécessite une dénormalisation pour la performance
  → Créer une vue matérialisée ou un trigger de cache
  → NE PAS modifier la structure normalisée

CAS 4 : Stitch a un workflow différent de la logique actuelle
  → Adapter les Edge Functions / triggers
  → Créer de nouveaux statuts ou étapes si nécessaire

CAS INTERDIT : Toute modification qui SUPPRIMERAIT des données existantes
  → Utiliser des colonnes deprecated_ au lieu de DROP COLUMN
  → Créer des vues de compatibilité
```

---

## PHASE 5 : VALIDATION & SÉCURITÉ

### 5.1 — Checklist sécurité pour chaque nouveau backend

```
□ RLS activé sur chaque nouvelle table
□ Policies cohérentes avec le système de rôles (10 rôles, 43 permissions)
□ Validation des inputs dans les Edge Functions
□ Pas de SELECT * — toujours des colonnes spécifiques
□ Pas de clés/secrets dans le code frontend
□ Rate limiting sur les Edge Functions sensibles
□ Audit log pour les actions critiques (suppression, modification prix)
```

### 5.2 — Checklist performance

```
□ Indexes sur les colonnes de recherche et de tri
□ Pagination sur toutes les listes (pas de SELECT sans LIMIT)
□ Lazy loading des images produits
□ Code splitting par route (React.lazy)
□ Bundle size < 500KB gzipped
□ Lighthouse score > 85
□ Temps de réponse Supabase < 200ms par requête
```

---

## RÈGLES IMPÉRATIVES

```
BACKEND :
1. CHAQUE nouvelle table a obligatoirement : id (uuid), created_at, updated_at
2. CHAQUE nouvelle table a RLS activé avec au minimum une policy SELECT
3. CHAQUE migration est testée individuellement avant la suivante
4. JAMAIS de suppression de données existantes
5. TOUJOURS un rollback possible (migration DOWN)
6. Types TypeScript régénérés après CHAQUE migration

FRONTEND :
7. NE JAMAIS modifier le design Stitch (layout, couleurs, spacing)
8. NE JAMAIS utiliser d'émojis → Lucide React uniquement
9. TOUJOURS implémenter les 3 langues (FR/ID/EN)
10. TOUJOURS tester sur résolution tablette (1024×768 min)
11. TOUJOURS gérer les états : vide, chargement, erreur, succès
12. TOUJOURS des boutons tactiles ≥ 44px

PROCESSUS :
13. UNE page = UNE session Claude Code (pas de méga-sessions)
14. COMMITTER après chaque page assemblée avec succès
15. TESTER avec les données réelles (358 produits, etc.)
16. DOCUMENTER chaque nouveau hook, table, function
```

---

## FORMAT DE RAPPORT PAR PAGE

```
Après chaque page assemblée, produire :

═══════════════════════════════════════════════════
PAGE : [Nom de la page Stitch]
STATUS : ✅ Assemblée / ⚠️ Partielle / ❌ Bloquée
═══════════════════════════════════════════════════

BACKEND CRÉÉ/MODIFIÉ :
  - Tables créées : [liste]
  - Tables modifiées : [liste + colonnes ajoutées]
  - Edge Functions créées : [liste]
  - Triggers créés : [liste]
  - Migrations appliquées : [numéros]

DÉPENDANCES AJOUTÉES :
  - npm : [packages installés]

HOOK REACT :
  - Fichier : /src/hooks/use[Module].ts
  - Queries : [liste des queries]
  - Mutations : [liste des mutations]
  - Realtime : [oui/non, canal]

COMPOSANTS CONNECTÉS :
  - [Composant Stitch] → [Hook] → [Table(s)]

TESTS PASSÉS :
  □ CRUD complet
  □ Permissions
  □ Responsive tablette
  □ i18n (FR/ID/EN)
  □ États vides/chargement/erreur
  □ Données réelles affichées

PROBLÈMES / TODO :
  - [Liste si applicable]
═══════════════════════════════════════════════════
```

---

# CHRONOLOGIE DÉTAILLÉE — VERSION FRONTEND-DRIVEN

## Pré-requis (Jours -2 à 0)

| Action | Durée | Responsable |
|--------|-------|-------------|
| Export complet design Stitch (tous les fichiers JSX/TSX, assets, CSS) | 0.5j | Mamat |
| Backup DB Supabase complète | 0.5j | Claude Code |
| Snapshot du code frontend actuel (git tag v0-pre-assembly) | 0.5j | Claude Code |
| Installer les dépendances de base (TanStack Query, i18next, lucide) | 0.5j | Claude Code |

---

## Sprint 0 : Fondations & Gap Analysis (Jours 1-4)

**Objectif** : Savoir EXACTEMENT ce qu'il faut créer

| Jour | Tâche | Livrable |
|------|-------|----------|
| J1 | Scanner toutes les pages Stitch — produire les fiches (Phase 0.1) | Document `stitch-pages-inventory.md` |
| J2 | Inventorier le backend existant (68 tables, 7 functions, RLS) | Document `backend-inventory.md` |
| J3 | Gap Analysis complète (Phase 0.2) — tableau croisé | Document `gap-analysis.md` avec tableau 🟢🟡🔴 |
| J4 | Plan de création backend (Phase 0.3) — migrations ordonnées | Document `backend-creation-plan.md` |

**Checkpoint** : On sait précisément combien de tables créer, combien de fonctions, combien de modifications. Le plan est validé par Mamat.

---

## Sprint 1 : Création Backend Manquant (Jours 5-10)

**Objectif** : Le backend couvre 100% des besoins du design Stitch

| Jour | Tâche | Livrable |
|------|-------|----------|
| J5 | Exécuter toutes les migrations 🔴 — nouvelles tables | Tables créées + RLS |
| J6 | Exécuter toutes les migrations 🟡 — ALTER tables existantes | Tables modifiées, données préservées |
| J7 | Créer les nouvelles Edge Functions | Functions déployées et testées |
| J8 | Créer triggers, vues, fonctions PostgreSQL | Automatisations opérationnelles |
| J9 | Régénérer types TypeScript + créer TOUS les hooks React | `/src/types/` + `/src/hooks/` complets |
| J10 | Tests backend complets — vérifier chaque table, RLS, function | Rapport de test backend |

**Checkpoint** : Le backend est complet. Chaque page Stitch a son hook prêt à brancher.

---

## Sprint 2 : Assemblage Pages Critiques (Jours 11-17)

**Objectif** : Le cœur de l'app fonctionne

| Jour | Tâche | Pages |
|------|-------|-------|
| J11 | Auth PIN + écran login | Login, sélection utilisateur |
| J12 | POS — layout + grille produits + catégories | POS principal |
| J13 | POS — panier + modifiers + taxes + paiement | POS complet |
| J14 | KDS — affichage temps réel + workflow statuts | KDS cuisine |
| J15 | Customer Display — promos + commande live | Écran client |
| J16 | Dashboard principal — KPIs + graphiques | Dashboard |
| J17 | Test workflow complet : Login → POS → KDS → Display | Intégration validée |

**Checkpoint** : Un employé peut se connecter, prendre une commande, encaisser, la cuisine voit la commande, le client voit l'écran.

---

## Sprint 3 : Assemblage Gestion Quotidienne (Jours 18-24)

| Jour | Tâche | Pages |
|------|-------|-------|
| J18 | Catalogue produits — liste, fiche, CRUD | Produits + catégories |
| J19 | Catalogue — combos, recettes, modifiers | Sous-pages produits |
| J20 | Stock — dashboard, mouvements, alertes | Stock principal |
| J21 | Stock — inventaire, transferts | Inventaire + transferts |
| J22 | Clients — liste, fiche, historique | CRM |
| J23 | Fidélité — programme, points, récompenses | Fidélité |
| J24 | Test intégration Sprint 3 | Tous workflows gestion |

---

## Sprint 4 : Assemblage Business & Nouvelles Pages (Jours 25-31)

| Jour | Tâche | Pages |
|------|-------|-------|
| J25 | B2B — commandes, prix, workflow | Module B2B |
| J26 | Achats — fournisseurs, bons de commande | Achats |
| J27 | Promotions — création, gestion, affichage | Promotions |
| J28 | **NOUVELLES PAGES STITCH** — pages identifiées en Phase 0 | Nouvelles pages (lot 1) |
| J29 | **NOUVELLES PAGES STITCH** — suite | Nouvelles pages (lot 2) |
| J30 | Rapports & Analytics | Dashboard rapports |
| J31 | Plan de salle + Paramètres | Config & plan |

---

## Sprint 5 : Polish, i18n & Déploiement (Jours 32-38)

| Jour | Tâche | Livrable |
|------|-------|----------|
| J32 | i18n complet — vérification FR/ID/EN sur TOUTES les pages | Traductions complètes |
| J33 | Audit sécurité — RLS, permissions, inputs, Edge Functions | Rapport sécurité |
| J34 | Optimisation performance — bundle, lazy loading, queries | Lighthouse > 85 |
| J35 | Polish UI — animations, transitions, micro-interactions, sons KDS | UX fluide |
| J36 | Tests end-to-end — tous les workflows business | Rapport test complet |
| J37 | Build PWA + test installation tablette Android + Windows | Builds testés |
| J38 | Documentation technique + guide utilisateur | Docs livrées |

**LIVRABLE FINAL** : AppGrav production-ready, tous modules assemblés, backend adapté au design Stitch.

---

## Résumé chronologie

| Sprint | Jours | Durée | Focus | Résultat |
|--------|-------|-------|-------|----------|
| **Pré-requis** | -2 à 0 | 2j | Préparation | Export Stitch + backup |
| **Sprint 0** | 1-4 | 4j | Audit & Gap Analysis | Plan complet documenté |
| **Sprint 1** | 5-10 | 6j | Création backend manquant | Backend 100% couvert |
| **Sprint 2** | 11-17 | 7j | Pages critiques (POS/KDS/Auth) | Caisse opérationnelle |
| **Sprint 3** | 18-24 | 7j | Gestion quotidienne | Produits, stock, clients |
| **Sprint 4** | 25-31 | 7j | Business + nouvelles pages | Tous modules + nouveautés |
| **Sprint 5** | 32-38 | 7j | Polish + déploiement | Production-ready |
| **TOTAL** | | **~38 jours (8 semaines)** | | **AppGrav en production** |

---

## Conseils clés pour maximiser les résultats

1. **Sprint 0 est LE sprint le plus important** : Un Gap Analysis bâclé = des surprises en plein assemblage. Investis le temps nécessaire.

2. **Créer TOUT le backend avant d'assembler le frontend** (Sprint 1 entier avant Sprint 2). Assembler une page dont le backend est incomplet génère de la dette technique et des workarounds.

3. **Une page Stitch = une session Claude Code** avec ce prompt en contexte + la fiche de la page + le hook correspondant. Ne pas surcharger le contexte.

4. **Sessions nocturnes autonomes** : Les Sprints 2-4 (assemblage pur) sont idéaux pour les sessions nocturnes. Donner un prompt clair : "Assemble la page [X] en suivant le workflow Phase 2, hook [Y] est prêt, les tables sont [Z]."

5. **Valider visuellement après chaque page** : Comparer le rendu avec le design Stitch original. Toute dérive doit être corrigée immédiatement, pas "plus tard".

6. **Si le temps manque** : Sprint 2 seul (Auth + POS + KDS + Customer Display + Dashboard) donne un produit minimum viable utilisable en production. Les Sprints 3-4 peuvent être ajoutés progressivement.

7. **Committer fréquemment avec des tags** : `v1.0-auth`, `v1.1-pos`, `v1.2-kds`, etc. Permet de rollback proprement si un module casse les précédents.

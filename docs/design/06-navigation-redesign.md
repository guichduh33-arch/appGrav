# Refonte Navigation

> Audit UI/UX AppGrav - Propositions Navigation
> Date : 2026-02-13

---

## 1. Sidebar Back-Office - État Actuel

### Problèmes Identifiés
1. Active state utilise `--color-rose-poudre` (rose) au lieu de gold
2. Pas de badges dynamiques (commandes en attente, alertes stock)
3. Pas de sous-menus expandables
4. Pas de breadcrumbs dans le contenu
5. 3 sections (Operations, Management, Admin) pourraient être mieux structurées

---

## 2. Sidebar Redesign

### Structure des Groupes

```
OPÉRATIONS
├── Dashboard          (LayoutDashboard)     [badge: alertes]
├── Orders             (ShoppingBag)         [badge: en attente]
├── POS Terminal       (Monitor)             [lien externe → /pos]
├── KDS                (ChefHat)             [lien externe → /kds]
└── Production         (Factory)

CATALOGUE
├── Products           (Package)
│   ├── All Products
│   ├── Categories
│   ├── Combos
│   ├── Promotions
│   └── Category Pricing
├── Inventory          (Warehouse)           [badge: stock critique]
│   ├── Stock Levels
│   ├── Movements
│   ├── Stock Opname
│   └── Suppliers
└── Purchasing         (ClipboardList)

CLIENTS & B2B
├── Customers          (Users)
│   ├── All Customers
│   ├── Categories
│   └── Loyalty
└── B2B Orders         (Building2)

FINANCE
├── Accounting         (Calculator)
│   ├── Chart of Accounts
│   ├── Journal Entries
│   ├── General Ledger
│   ├── Trial Balance
│   ├── Balance Sheet
│   ├── Income Statement
│   └── VAT Management
└── Reports            (BarChart3)

ADMINISTRATION
├── Users              (UserCog)
├── Settings           (Settings)
└── Audit Log          (Shield)
```

### Comportement Sous-menus

```
Interaction :
1. Click sur item parent (ex: "Products") → navigue vers la page principale
2. Chevron à droite → expand/collapse le sous-menu
3. Sous-menu : items indentés 12px, font text-sm, pas d'icône
4. Active state parent : persiste quand un enfant est actif

Collapsed mode :
- Hover sur icon parent → tooltip avec nom
- Click → navigue vers page principale
- Pas de sous-menus en mode collapsed (accès direct)
```

### Badges Dynamiques

| Badge | Source | Couleur | Affichage |
|-------|--------|---------|-----------|
| Orders en attente | `useOrders({ status: 'new' })` | `bg-info` bleu | Compteur numérique |
| Stock critique | `useInventory({ alert: 'critical' })` | `bg-danger` rouge | Compteur numérique |
| Sync en attente | `useSyncStore().pendingCount` | `bg-warning` ambre | Compteur numérique |
| Alertes | Composé | `bg-danger` rouge | Dot (sans chiffre) |

### Active State Corrigé

```css
/* AVANT (incohérent) */
.nav-item-active {
  background: var(--color-rose-poudre);
  color: white;
}

/* APRÈS (cohérent avec design system) */
.nav-item-active {
  background: rgba(201, 165, 92, 0.08); /* primary/8% */
  color: var(--color-primary-dark); /* #9A7B3A */
  border-left: 3px solid var(--color-primary); /* #C9A55C */
  font-weight: 500;
}
```

---

## 3. Navigation POS

### Header POS Simplifié

```
AVANT (trop chargé) :
[Logo] [User pill] [___Time___] [Status icons] [Menu btn]

APRÈS (rationalisé) :
[Logo 24px] [Session #XX] [____] [Time mono] [🔴/🟢 Online] [☰]

- Logo : SVG The Breakery, 24px, opacity 60%
- Session : "#42 - Marie" text-sm
- Time : JetBrains Mono, 16px, tabular-nums
- Online dot : 8px, vert (#22C55E) ou rouge (#EF4444)
- Menu : hamburger icon 44x44px
```

### Catégories POS

#### Variante A : Sidebar Verticale (Actuel, Amélioré)

```
Largeur : 180px (réduit de 200px)
Items : 44px hauteur minimum
Active : bg-primary/12, border-left 3px primary
Scroll : vertical, overscroll-behavior contain
Fond : bg-elevated
Position : fixed left

Améliorations :
+ Dot de couleur par catégorie (6px, left of name)
+ Counter produits par catégorie (text-muted, right)
+ "All" en premier, font-weight 600
```

#### Variante B : Tabs Horizontaux (Alternative)

```
Position : sous le header, full-width
Height : 48px
Items : pill buttons, 36px height
Active : bg-primary, text-stone-900
Inactive : bg-surface, text-secondary
Scroll : horizontal, snap to item
Avantage : plus d'espace pour la grille produits (+180px)
Inconvénient : scrolling si beaucoup de catégories
```

#### Recommandation
**Variante A (sidebar)** pour The Breakery car :
- Nombre modéré de catégories (~8-12)
- Layout plus stable, pas de scroll horizontal
- Aligné avec Lightspeed (référence pour boulangerie)
- Plus confortable pour les sessions longues

---

## 4. Breadcrumbs

### Implémentation

```tsx
// Composant Breadcrumbs automatique basé sur le router
<Breadcrumbs>
  <BreadcrumbItem href="/">Dashboard</BreadcrumbItem>
  <BreadcrumbItem href="/inventory">Inventory</BreadcrumbItem>
  <BreadcrumbItem current>Product Detail</BreadcrumbItem>
</Breadcrumbs>
```

### Placement
- Position : en haut du contenu principal, sous le titre de page
- Hauteur : 36px (incluant padding)
- Style : text-sm, text-secondary, separator ChevronRight 14px
- Max profondeur affichée : 3 niveaux
- Dernier item : text-primary, font-weight 500

---

## 5. Transitions de Page

### Animation

```css
/* Page entrante */
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: page-enter 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Respecter prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .page-enter {
    animation: none;
    opacity: 1;
  }
}
```

---

## 6. Raccourcis Clavier (Dual-Screen Windows)

### POS Shortcuts

| Raccourci | Action |
|-----------|--------|
| `F1` | Recherche produit (focus search) |
| `F2` | Appliquer remise |
| `F3` | Mettre en attente (hold) |
| `F5` | Rafraîchir produits |
| `F12` ou `Enter` | Paiement (ouvrir modal) |
| `Esc` | Fermer modal / Annuler |
| `+` / `-` | Augmenter / Diminuer quantité item sélectionné |
| `Delete` | Supprimer item sélectionné |
| `Ctrl+Z` | Annuler dernière action |
| `1-9` | Sélection rapide catégorie |

### Back-Office Shortcuts

| Raccourci | Action |
|-----------|--------|
| `Ctrl+K` | Recherche globale (command palette) |
| `Ctrl+S` | Sauvegarder formulaire actif |
| `Esc` | Fermer modal |
| `[` / `]` | Collapse/expand sidebar |

---

*Document généré dans le cadre de l'audit UI/UX complet d'AppGrav*

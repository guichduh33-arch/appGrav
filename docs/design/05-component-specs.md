# Spécifications Composants UI

> Audit UI/UX AppGrav - Détail de chaque composant
> Date : 2026-02-13

---

## 1. Boutons

### Implémentation Tailwind (Option C)

```tsx
// Button variants - à ajouter dans button.tsx (CVA)
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:ring-3 focus-visible:ring-primary/25 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-primary text-stone-900 hover:brightness-105 hover:-translate-y-px active:brightness-95 active:scale-[0.98] shadow-sm hover:shadow-md",
        secondary: "bg-transparent text-stone-600 border border-stone-300 hover:bg-stone-100 active:bg-stone-200",
        ghost: "bg-transparent text-stone-600 hover:bg-stone-100 active:bg-stone-200",
        danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
        success: "bg-green-500 text-white hover:bg-green-600 active:bg-green-700",
        outline: "bg-transparent text-primary border border-primary hover:bg-primary/10 active:bg-primary/20",
      },
      size: {
        sm: "h-8 px-3 text-[13px] rounded-md",
        md: "h-10 px-4 text-sm rounded-md",
        lg: "h-12 px-5 text-base rounded-lg",
        xl: "h-14 px-6 text-lg rounded-lg font-semibold", // POS
        icon: "h-10 w-10 rounded-md",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)
```

### Bouton PAY (POS) - Spécification Détaillée

```
Dimensions : full-width, 56px hauteur
Font : DM Sans 18px, font-weight 700, uppercase
Background : gradient linear(180deg, #C9A55C 0%, #9A7B3A 100%)
Text Color : #1C1917 (near-black pour contraste)
Border-radius : 12px
Shadow : 0 4px 12px rgba(201,165,92,0.3)
Hover : brightness(1.08), shadow augmenté
Active : scale(0.98), brightness(0.95)
Disabled : opacity 0.5, no gradient (solid #C9A55C50)
Icon : CreditCard (Lucide) 20px à gauche du texte
```

### Bouton KDS Bump - Spécification Détaillée

```
Dimensions : full-width de la carte, 56px hauteur minimum
Font : DM Sans 16px, font-weight 600
Variants par action :
  Start : bg-blue-500, text-white, icon: Play
  Ready : bg-green-500, text-white, icon: Check
  Served : bg-stone-500, text-white, icon: CheckCheck
Border-radius : 8px
Touch target : 56px hauteur minimum (cuisine, mains mouillées)
```

---

## 2. Cards

### Product Card (POS)

```
Dimensions : flexible, minimum 100x100px
Background : var(--bg-surface) (#1A1A1E en dark)
Border : 1px solid var(--border-subtle)
Border-radius : 8px
Padding : 12px

Contenu :
├── Image (optionnel) : 40x40px, radius 6px, object-cover
├── Nom produit : 14px, font-weight 500, truncate 2 lignes
├── Prix : 14px, font-weight 600, tabular-nums
├── Badge stock faible (optionnel) : dot orange 6px
└── Indicateur catégorie : dot 4px couleur catégorie, top-right

Hover : bg-elevated (#232328), border-primary/20, translateY(-1px)
Active : scale(0.97)
Disabled (out of stock) : opacity 0.4, cursor-not-allowed
Micro-animation ajout : scale(1.03) 150ms puis retour
```

### KDS Order Card

```
Dimensions : flexible, min-width 280px
Background : var(--bg-surface) (#1A1A1E)
Border-left : 4px solid [couleur-statut]
Border-radius : 8px
Padding : 16px

Layout :
├── Header (flex, space-between)
│   ├── Order # : 24px, font-weight 800
│   ├── Type icon : Lucide 18px (UtensilsCrossed/Package/Bike/Building2)
│   └── Timer : 18px, JetBrains Mono, couleur dynamique
├── Progress bar : 4px height, couleur timer, largeur = elapsed/max
├── Items list
│   ├── Item : 16px, font-weight 600
│   ├── Qty : 20px, font-weight 800, couleur primaire
│   └── Modifier : 13px, italic, text-muted
├── Footer (flex)
│   ├── Table/Customer : text-sm, icon MapPin/User
│   └── Bump button : full-width, 48px
```

### Stat Card (Dashboard)

```
Dimensions : flexible, grid
Background : var(--bg-surface)
Border : 1px solid var(--border-default)
Border-radius : 12px
Shadow : shadow-sm
Padding : 20px

Layout :
├── Header (flex, space-between)
│   ├── Label : 13px, text-secondary, uppercase
│   └── Icon : 20px, text-muted, bg-elevated, 36x36 rounded-lg
├── Value : 28px, font-weight 700, tabular-nums
├── Trend (flex, gap-4)
│   ├── Arrow icon : 14px, vert (up) ou rouge (down)
│   ├── Percentage : 13px, font-weight 600, vert ou rouge
│   └── Label : 13px, text-muted, "vs hier"
└── Sparkline (optionnel) : 40px height, couleur primaire, opacity 0.3
```

---

## 3. Inputs

### Text Input

```
Height : 40px
Padding : 10px 14px
Font : 14px, DM Sans
Background : var(--bg-surface)
Border : 1.5px solid var(--border-default)
Border-radius : 8px
Placeholder : text-muted, opacity 0.7

Focus : border-color var(--primary), shadow 0 0 0 3px rgba(201,165,92,0.15)
Error : border-color var(--danger), shadow 0 0 0 3px rgba(239,68,68,0.15)
  + message erreur : 12px, text-danger, margin-top 4px
Disabled : bg-elevated, opacity 0.6
```

### Search Input (POS)

```
Height : 44px (POS tactile)
Padding : 10px 14px 10px 40px (icône gauche)
Border-radius : 8px (pas rounded-full)
Icon Search : 18px, position absolute left 12px, text-muted
Clear button : X icon, 32x32, position absolute right 4px, visible quand non-vide
Background : var(--bg-elevated) en dark mode
Placeholder : "Search products..."
```

### Select / Dropdown

```
Trigger : même style que text input, chevron-down 16px à droite
Content : bg-surface, shadow-lg, border border-default, radius 8px
Item : padding 8px 12px, hover bg-hover
Item active : bg-primary/10, text-brand
Separator : border-subtle, margin 4px 0
```

---

## 4. Tables

### Table Standard (Back-office)

```
Container : bg-surface, border border-default, radius 12px, overflow hidden

Header row :
  bg : var(--bg-elevated)
  font : 12px, uppercase, tracking +0.05em, font-weight 600
  color : text-secondary
  padding : 12px 16px
  border-bottom : border-default
  position : sticky top-0

Body row :
  padding : 12px 16px
  border-bottom : border-subtle
  hover : bg-hover
  transition : background 150ms

Number cells : tabular-nums, text-align right, font-weight 500
Status cells : badge component
Action cells : ghost buttons, 32px height

Pagination :
  padding : 12px 16px
  border-top : border-default
  justify-between : "Showing X-Y of Z" | page buttons
  page buttons : 32x32, ghost, active = primary/10
```

### Table Inventory (avec Stock Level)

```
Low stock row : pas de fond rouge gradient
  -> badge "Low" (warning) dans la colonne stock
  -> icon AlertTriangle 14px inline

Critical stock row :
  -> badge "Critical" (danger) dans la colonne stock
  -> icon AlertCircle 14px inline

Out of stock :
  -> opacity 0.6 sur toute la ligne
  -> badge "Out" (danger)
```

---

## 5. Modals

### Modal Standard

```
Overlay : rgba(28,25,23,0.6), backdrop-blur(4px)
Container :
  bg : var(--bg-surface)
  radius : 16px
  shadow : shadow-xl
  max-width : 560px
  width : 90vw (mobile) / auto
  max-height : 90vh
  overflow : hidden

Header :
  padding : 20px 24px
  border-bottom : border-subtle
  font : 20px Cormorant Garamond, font-weight 600
  close button : ghost, 36x36, top-right

Body :
  padding : 24px
  overflow-y : auto

Footer :
  padding : 16px 24px
  border-top : border-subtle
  gap : 8px
  justify-end (ou space-between si cancel+confirm)

Animation in : fade 200ms + translateY(10px -> 0) + scale(0.96 -> 1)
Animation out : fade 150ms + scale(1 -> 0.96)
```

### Modal Paiement (POS) - Full Screen

```
Overlay : rgba(0,0,0,0.8), no blur
Container :
  full screen (100vw x 100vh)
  bg : var(--bg-app) dark mode (#111113)
  no radius

Layout :
├── Header : Order # + total, close button
├── Left panel (60%)
│   ├── Amount display : 48px, gold, tabular-nums
│   ├── Numpad : 3x4 grid, 64px buttons, rounded-lg
│   └── Quick amounts : row de pills (50k, 100k, exact)
├── Right panel (40%)
│   ├── Payment methods : large icon buttons (Cash, Card, QRIS, etc.)
│   ├── Split payments : liste avec montants
│   └── Summary : subtotal, tax, discount, total
└── Footer : PAY button (xl, full-width, gold gradient)
```

---

## 6. Toasts / Notifications

### Sonner Configuration

```tsx
<Toaster
  position="top-right"
  richColors
  duration={3000}
  toastOptions={{
    classNames: {
      toast: "bg-surface border border-default shadow-lg rounded-xl",
      title: "text-primary font-medium text-sm",
      description: "text-secondary text-xs",
      actionButton: "bg-primary text-stone-900 font-medium",
    },
  }}
/>
```

### Variants avec Icônes

| Variant | Icône Lucide | Durée | Bordure gauche |
|---------|-------------|-------|---------------|
| Success | `CheckCircle` 18px | 3s | 3px `#22C55E` |
| Error | `AlertCircle` 18px | 8s | 3px `#EF4444` |
| Warning | `AlertTriangle` 18px | 5s | 3px `#F59E0B` |
| Info | `Info` 18px | 3s | 3px `#3B82F6` |
| Loading | Spinner 18px | Until dismiss | 3px `#C9A55C` |

---

## 7. Badges / Status Tags

### Order Status Badges

| Statut | Variant | Icône | Label |
|--------|---------|-------|-------|
| New | info | `Clock` | New |
| Preparing | warning | `ChefHat` | Preparing |
| Ready | success | `CheckCircle` | Ready |
| Completed | default | `CheckCheck` | Completed |
| Voided | danger | `XCircle` | Voided |
| Refunded | danger | `RotateCcw` | Refunded |

### Stock Level Badges

| Niveau | Variant | Icône | Label |
|--------|---------|-------|-------|
| In Stock | success | none | "XX units" |
| Low (< 10) | warning | `AlertTriangle` | "Low: XX" |
| Critical (< 5) | danger | `AlertCircle` | "Critical: XX" |
| Out of Stock | danger | `XCircle` | "Out of Stock" |

### Order Type Badges (POS/KDS)

| Type | Icône Lucide | Couleur |
|------|-------------|---------|
| Dine-in | `UtensilsCrossed` | `#22C55E` (vert) |
| Takeaway | `Package` | `#F59E0B` (ambre) |
| Delivery | `Bike` | `#3B82F6` (bleu) |
| B2B | `Building2` | `#8B5CF6` (violet) |

---

## 8. Empty States

### Template Unifié

```
Container : centered, padding 48px
Icon : 48px, text-muted, opacity 0.5
Title : 18px, font-weight 600, text-primary, margin-top 16px
Description : 14px, text-secondary, max-width 360px, text-center
Action (optionnel) : primary button, margin-top 24px

Exemples :
  - Panier vide : ShoppingBag icon + "Your cart is empty" + "Add products from the grid"
  - Recherche : Search icon + "No results found" + "Try different keywords"
  - Table vide : Inbox icon + "No data yet" + "Create your first [item]" + [Create button]
  - Erreur : AlertCircle icon + "Something went wrong" + "Please try again" + [Retry button]
```

---

## 9. Loading States

### Skeleton Loader (Recommandé)

```
Background : var(--bg-elevated)
Animation : pulse (opacity 0.4 -> 0.7, 1.5s infinite)
Border-radius : match le composant remplacé

Skeleton Card : radius 12px, hauteur variable
Skeleton Table Row : radius 4px, hauteur 48px, gap 12px
Skeleton Text : radius 4px, hauteur 14px, largeur variable (60-90%)
Skeleton Chart : radius 8px, hauteur chart area
```

### Spinner (Actions)

```
Size : 16px (inline), 24px (standalone), 40px (page)
Color : var(--primary) (gold)
Animation : spin 0.8s linear infinite
Stroke-width : 2px
Style : cercle avec gap (pas de points)
```

---

## 10. Navigation - Breadcrumbs

### Spécification

```
Container : flex, items-center, gap-2, padding 8px 0
Item : text-sm, text-secondary, hover:text-primary
Separator : ChevronRight 14px, text-muted
Active (last) : text-primary, font-weight 500, no hover
Max depth : 3 niveaux affichés

Exemple : Dashboard > Inventory > Product Detail
```

---

*Document généré dans le cadre de l'audit UI/UX complet d'AppGrav*

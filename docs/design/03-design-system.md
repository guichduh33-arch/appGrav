# Design System AppGrav - The Breakery

> Spécifications complètes du design system unifié
> Basé sur Option C (Hybride Moderne)
> Date : 2026-02-13

---

## 1. Typographie

### Polices

| Usage | Police | Fallback | Raison |
|-------|--------|----------|--------|
| **Display / Headings** | Cormorant Garamond (600) | Georgia, serif | Identité française, élégance |
| **Body / UI** | DM Sans (400, 500, 600) | system-ui, sans-serif | Lisibilité, chiffres clairs |
| **Mono / Chiffres** | JetBrains Mono | SF Mono, Consolas | Timers KDS, montants alignés |

### Recommandation : Conserver les polices actuelles
- **Cormorant Garamond** pour les headings est un différenciateur (aucun concurrent n'utilise de serif)
- **DM Sans** est excellent pour les données et l'UI (alternative à Inter, plus de personnalité)
- Ajouter **JetBrains Mono** pour les timers KDS et montants financiers (meilleure lisibilité que SF Mono)

### Échelle Typographique

| Token | Taille | Line-Height | Letter-Spacing | Usage |
|-------|--------|-------------|----------------|-------|
| `text-xs` | 11px / 0.6875rem | 1.45 (16px) | +0.02em | Micro-labels, timestamps |
| `text-sm` | 13px / 0.8125rem | 1.4 (18px) | +0.01em | Labels, table data, badges |
| `text-base` | 14px / 0.875rem | 1.5 (21px) | 0 | Body, inputs, boutons |
| `text-lg` | 16px / 1rem | 1.5 (24px) | 0 | Body large, nav items |
| `text-xl` | 18px / 1.125rem | 1.4 (25px) | -0.01em | Section headings |
| `text-2xl` | 22px / 1.375rem | 1.3 (29px) | -0.015em | Page titles |
| `text-3xl` | 28px / 1.75rem | 1.2 (34px) | -0.02em | KPIs, grands chiffres |
| `text-4xl` | 36px / 2.25rem | 1.1 (40px) | -0.025em | Display, hero numbers |

### POS Spécifique

| Élément | Taille Min | Police | Poids |
|---------|-----------|--------|-------|
| Nom produit (carte) | 14px | DM Sans | 500 |
| Prix produit | 14px | DM Sans | 600 |
| Nom catégorie | 13px | DM Sans | 500 |
| Ligne panier | 14px | DM Sans | 400 |
| Total panier | 24px | DM Sans | 700 |
| Bouton PAY | 18px | DM Sans | 700 |

### KDS Spécifique (Lisibilité à 2-3m)

| Élément | Taille Min | Police | Poids |
|---------|-----------|--------|-------|
| Numéro commande | 28px | DM Sans | 800 |
| Nom item | 18px | DM Sans | 600 |
| Quantité | 22px | DM Sans | 800 |
| Modificateur | 14px | DM Sans | 400 italic |
| Timer | 20px | JetBrains Mono | 600 |
| Type commande | 14px | DM Sans | 500 |

---

## 2. Iconographie

### Règles Strictes

1. **Lucide Icons exclusivement** (déjà installé)
2. **Aucun emoji** dans l'interface applicative
3. Style : **outline** (stroke-width: 1.5) pour navigation, **outline** (stroke-width: 2) pour actions POS
4. Taille uniforme par contexte :

| Contexte | Taille | Stroke |
|----------|--------|--------|
| Navigation sidebar | 20px | 1.5 |
| Actions boutons | 18px | 2 |
| Inline texte | 16px | 1.5 |
| POS actions | 24px | 2 |
| KDS actions | 24px | 2 |
| Badges/status | 14px | 1.5 |

### Remplacement Emojis -> Lucide

| Emoji Actuel | Icône Lucide | Import |
|-------------|-------------|--------|
| 🥐 (logo) | Logo SVG The Breakery | `<BreakeryLogo />` composant |
| 🍽️ (dine-in) | `UtensilsCrossed` | `lucide-react` |
| 🥡 (takeaway) | `Package` | `lucide-react` |
| 🚴 (delivery) | `Bike` | `lucide-react` |
| 🏢 (B2B) | `Building2` | `lucide-react` |
| ☕ (café) | `Coffee` | `lucide-react` |
| 🍞 (pain) | `Croissant` ou icône custom | `lucide-react` |
| 📍 (location) | `MapPin` | `lucide-react` |
| 👤 (customer) | `User` | `lucide-react` |
| 🛒 (panier vide) | `ShoppingBag` | `lucide-react` |
| 🔍 (recherche) | `Search` | `lucide-react` |
| 🧪 (recette) | `FlaskConical` | `lucide-react` |
| 📥 (réception) | `PackageCheck` | `lucide-react` |
| 🗑️ (déchet) | `Trash2` | `lucide-react` |
| 📱 (mobile) | `Smartphone` | `lucide-react` |
| 🎁 (combo) | `Gift` | `lucide-react` |

---

## 3. Espacement & Grille

### Système de Spacing (base 4px)

| Token | Valeur | Usage |
|-------|--------|-------|
| `space-0.5` | 2px | Micro-gaps |
| `space-1` | 4px | Inline spacing |
| `space-1.5` | 6px | Compact padding |
| `space-2` | 8px | Input padding, badge padding |
| `space-3` | 12px | Card padding compact, gaps |
| `space-4` | 16px | Card padding standard, section gaps |
| `space-5` | 20px | Large padding |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Page section gaps |
| `space-10` | 40px | Large section gaps |
| `space-12` | 48px | Page padding |
| `space-16` | 64px | Hero spacing |

### Border Radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `rounded-sm` | 4px | Badges, tags, petits éléments |
| `rounded` | 6px | Inputs, boutons small |
| `rounded-md` | 8px | Boutons standard, dropdowns |
| `rounded-lg` | 12px | Cards, modals, toasts |
| `rounded-xl` | 16px | Login card, panels larges |
| `rounded-full` | 9999px | Avatars, pills, toggle |

### Ombres

| Token | Valeur | Usage |
|-------|--------|-------|
| `shadow-sm` | `0 1px 2px rgba(28,25,23,0.05)` | Cards, inputs focus |
| `shadow-md` | `0 4px 6px rgba(28,25,23,0.07), 0 2px 4px rgba(28,25,23,0.04)` | Cards elevées, dropdowns |
| `shadow-lg` | `0 10px 15px rgba(28,25,23,0.1), 0 4px 6px rgba(28,25,23,0.05)` | Modals, popovers |
| `shadow-xl` | `0 20px 25px rgba(28,25,23,0.12), 0 8px 10px rgba(28,25,23,0.06)` | Overlays |
| `shadow-glow` | `0 0 20px rgba(201,165,92,0.15)` | Focus gold, bouton PAY |

### Grille Responsive

| Breakpoint | Largeur | Colonnes Grille | Usage |
|-----------|---------|----------------|-------|
| `sm` | >= 640px | 1-2 | Mobile landscape |
| `md` | >= 768px | 2-3 | Tablette portrait |
| `lg` | >= 1024px | 3-4 | Tablette paysage, petit desktop |
| `xl` | >= 1280px | 4-6 | Desktop standard |
| `2xl` | >= 1536px | 4-6 | Grand desktop, dual-screen |

---

## 4. Composants UI

### Boutons

#### Variants
| Variant | Fond | Texte | Bordure | Usage |
|---------|------|-------|---------|-------|
| **primary** | `#C9A55C` | `#1C1917` | none | CTA principal, PAY, Save |
| **secondary** | transparent | `#57534E` | `#E5E2DC` | Actions secondaires |
| **ghost** | transparent | `#57534E` | none | Actions tertiaires |
| **danger** | `#EF4444` | `#FFFFFF` | none | Suppression, annulation |
| **success** | `#22C55E` | `#FFFFFF` | none | Validation, envoi cuisine |
| **outline** | transparent | `#C9A55C` | `#C9A55C` | Alternative au primary |

#### Tailles
| Taille | Hauteur | Padding | Font | Usage |
|--------|---------|---------|------|-------|
| `sm` | 32px | 8px 12px | 13px | Inline, table actions |
| `md` | 40px | 10px 16px | 14px | Standard, formulaires |
| `lg` | 48px | 12px 20px | 16px | Actions importantes |
| `xl` | 56px | 14px 24px | 18px | POS Pay, KDS bump |

#### États
| État | Transformation |
|------|---------------|
| Hover | brightness(1.05), translateY(-1px) |
| Active | brightness(0.95), scale(0.98) |
| Focus | ring 3px `#C9A55C40`, offset 2px |
| Disabled | opacity 0.5, cursor not-allowed |
| Loading | spinner 16px + opacity text 0.7 |

### Cards

| Variant | Fond | Bordure | Radius | Shadow | Usage |
|---------|------|---------|--------|--------|-------|
| **default** | `bg-surface` | `border-default` | 12px | `shadow-sm` | Standard |
| **elevated** | `bg-surface` | none | 12px | `shadow-md` | Dashboard KPIs |
| **product** (POS) | `bg-surface` dark | `border-subtle` | 8px | none | Grille produits |
| **kds-order** | `bg-surface` dark | bordure gauche colorée 4px | 8px | none | Carte commande KDS |
| **stat** | `bg-surface` | `border-default` | 12px | `shadow-sm` | KPI back-office |

### Inputs

| État | Fond | Bordure | Shadow |
|------|------|---------|--------|
| Default | `bg-surface` | `border-default` 1.5px | none |
| Hover | `bg-surface` | `#A8A29E` | none |
| Focus | `bg-surface` | `#C9A55C` | `0 0 0 3px #C9A55C25` |
| Error | `bg-surface` | `#EF4444` | `0 0 0 3px #EF444425` |
| Disabled | `bg-elevated` | `border-subtle` | none, opacity 0.6 |

Hauteur : 40px (md), padding 10px 14px, font 14px.

### Badges / Tags

| Variant | Fond | Texte | Usage |
|---------|------|-------|-------|
| **default** | `#F5F4F1` | `#57534E` | Catégories, labels |
| **primary** | `#C9A55C20` | `#9A7B3A` | Accent, sélection |
| **success** | `#22C55E15` | `#16A34A` | Statut complété |
| **warning** | `#F59E0B15` | `#D97706` | Attention, stock faible |
| **danger** | `#EF444415` | `#DC2626` | Erreur, urgent |
| **info** | `#3B82F615` | `#2563EB` | Information |

Padding : 4px 10px, font 12px, border-radius 4px.

### Tables

| Élément | Style |
|---------|-------|
| Header | `bg-elevated`, font 12px uppercase, tracking +0.05em, font-weight 600, color `text-secondary` |
| Row | `bg-surface`, hover `bg-hover`, border-bottom `border-subtle` |
| Cell padding | 12px 16px |
| Number cells | `font-variant-numeric: tabular-nums`, text-align right |
| Action buttons | Ghost variant, 32px height |
| Pagination | Bottom, centered, 32px buttons |
| Empty state | Centered, icon + text + action button |

### Modals / Dialogs

| Élément | Style |
|---------|-------|
| Overlay | `rgba(28,25,23,0.6)`, `backdrop-filter: blur(4px)` |
| Container | `bg-surface`, radius 16px, shadow-xl, max-width 560px |
| Header | padding 24px, border-bottom `border-subtle` |
| Body | padding 24px |
| Footer | padding 16px 24px, border-top `border-subtle`, flex end |
| Animation In | fade 200ms + scale(0.95 -> 1) + translateY(10px -> 0) |
| Animation Out | fade 150ms + scale(1 -> 0.95) |

### Toasts / Notifications

| Variant | Fond (dark) | Icône | Position |
|---------|------------|-------|----------|
| Success | `#052E16` border `#22C55E` | `CheckCircle` | top-right |
| Error | `#450A0A` border `#EF4444` | `AlertCircle` | top-right |
| Warning | `#451A03` border `#F59E0B` | `AlertTriangle` | top-right |
| Info | `#172554` border `#3B82F6` | `Info` | top-right |

Durée : 3s (success/info), 5s (warning), 8s (error).
Radius : 12px. Animation : slide-in-from-right 300ms.

### Navigation Sidebar

| Élément | Light Mode | Collapsed |
|---------|-----------|-----------|
| Width | 280px | 72px |
| Background | `bg-sidebar` (`#F5F4F1`) | idem |
| Nav Item | 40px height, padding 8px 12px | 40x40 icon only |
| Active Item | `bg-sidebar-active`, text `text-brand`, barre gauche 3px gold | icon gold, tooltip |
| Hover | `bg-hover` | `bg-hover` |
| Section Title | 11px uppercase, tracking +0.08em, `text-muted` | masqué |
| Badge | 20px pill, `bg-danger`, white text | superposé sur icon |
| Separator | `border-subtle`, margin 8px 0 | idem |

---

## 5. Animations & Transitions

### Durées Standard

| Token | Durée | Easing | Usage |
|-------|-------|--------|-------|
| `duration-fast` | 150ms | `ease-out` | Hover states, toggles |
| `duration-normal` | 250ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Transitions UI standard |
| `duration-slow` | 350ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Modals, panels |
| `duration-page` | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Transitions de page |

### Animations Clés

| Nom | Durée | Usage | Interruptible |
|-----|-------|-------|--------------|
| `fade-in` | 200ms | Apparition éléments | oui |
| `slide-up` | 300ms | Modals, cards | oui |
| `slide-in-right` | 300ms | Panels, toasts | oui |
| `scale-in` | 200ms | Popovers, dropdowns | oui |
| `pulse-urgent` | 1s infinite | KDS commande urgente | non |
| `pulse-new` | 2s x3 | KDS nouvelle commande | oui |
| `shake` | 400ms | Erreur PIN | oui |
| `cart-bounce` | 300ms | Ajout panier | oui |

### Règle : `prefers-reduced-motion`
Toutes les animations respectent `@media (prefers-reduced-motion: reduce)` :
- Transitions réduites à 0ms
- Animations `infinite` remplacées par état statique
- Seuls les changements de couleur/opacité restent

---

## 6. Z-Index Stack

| Token | Valeur | Usage |
|-------|--------|-------|
| `z-base` | 0 | Contenu normal |
| `z-dropdown` | 100 | Dropdowns, selects |
| `z-sticky` | 200 | Headers sticky, sidebars |
| `z-modal-backdrop` | 300 | Overlay modal |
| `z-modal` | 400 | Contenu modal |
| `z-toast` | 500 | Notifications toast |
| `z-tooltip` | 600 | Tooltips |

---

## 7. Accessibilité

### Contraste (WCAG AA)

| Combinaison | Ratio | Statut |
|-------------|-------|--------|
| `text-primary` sur `bg-app` (light) | 15.3:1 | PASS |
| `text-primary` sur `bg-app` (dark) | 14.8:1 | PASS |
| `text-secondary` sur `bg-surface` (light) | 7.2:1 | PASS |
| `text-secondary` sur `bg-surface` (dark) | 5.1:1 | PASS |
| `text-brand` sur `bg-surface` (light) | 5.8:1 | PASS |
| `primary` sur `bg-surface` (dark) | 6.2:1 | PASS |
| `text-primary-contrast` sur `primary` | 8.4:1 | PASS |

### Cibles Tactiles

| Contexte | Taille Minimum |
|----------|---------------|
| POS boutons actions | 48x48px |
| POS produit card | 80x80px minimum |
| KDS bump button | 56x56px |
| Back-office boutons | 40x40px (44px recommandé) |
| Navigation items | 40px hauteur, full-width |
| Input fields | 40px hauteur |

### Focus Visible
- Ring : 3px solid `#C9A55C40`
- Offset : 2px
- Uniquement sur `:focus-visible` (pas `:focus`)

---

## 8. Intégration Logo The Breakery

| Emplacement | Taille | Opacité | Style |
|-------------|--------|---------|-------|
| **Login** | 120px largeur | 100% | Centré, seul moment proéminent |
| **Sidebar (expanded)** | 32px hauteur | 100% | En haut, avec "The Breakery" texte |
| **Sidebar (collapsed)** | 28px | 100% | Monogramme "B" ou icône simplifiée |
| **POS Header** | 24px | 60% | Petit, coin gauche, discret |
| **KDS Header** | 24px | 80% | Petit, avec nom station |
| **Customer Display** | 80px | 10% | Filigrane centré bas d'écran |
| **Reçu imprimé** | 40mm largeur | 100% | En-tête centré |
| **Favicon** | 32x32 / 16x16 | 100% | Version icône simplifiée |
| **PWA Icon** | 192x192 / 512x512 | 100% | Version complète sur fond `#111113` |

---

*Document généré dans le cadre de l'audit UI/UX complet d'AppGrav*

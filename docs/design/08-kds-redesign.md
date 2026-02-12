# Propositions Redesign KDS

> Audit UI/UX AppGrav - Kitchen Display System
> Date : 2026-02-13

---

## Contexte
- KDS affiché sur écran mural en cuisine (22-32")
- Lisible à 2-3 mètres de distance
- Utilisé avec des mains mouillées/farinées
- Environnement : chaleur, vapeur, lumière forte
- Stations : Hot Kitchen, Barista, Display, Waiter

---

## 1. Corrections Prioritaires (P0-P1)

### Remplacer les Emojis

| Avant | Après | Icône Lucide |
|-------|-------|-------------|
| 🥐 The Breakery KDS | Logo SVG + "KDS" | `<BreakeryLogo />` |
| 🍽️ Dine-in | Icône + label | `UtensilsCrossed` |
| 🥡 Takeaway | Icône + label | `Package` |
| 🚴 Delivery | Icône + label | `Bike` |
| 🏢 B2B | Icône + label | `Building2` |
| 📍 Table/Location | Icône inline | `MapPin` |
| 👤 Customer | Icône inline | `User` |

### Augmenter les Cibles Tactiles

```css
/* AVANT */
.kds-header-btn { width: 40px; height: 40px; } /* < 44px minimum */

/* APRÈS */
.kds-header-btn { width: 48px; height: 48px; min-width: 48px; }
```

### Augmenter la Typographie

| Élément | Avant | Après |
|---------|-------|-------|
| Numéro commande | ~20px | 28px, font-weight 800 |
| Nom item | ~14px | 18px, font-weight 600 |
| Quantité | ~16px | 22px, font-weight 800 |
| Modificateur | ~12px | 14px, italic |
| Timer | ~16px | 20px, JetBrains Mono |

---

## 2. Progress Bar Temporelle

### Spécification

```
Position : sous le header de chaque carte (entre order# et items)
Hauteur : 4px
Border-radius : 2px
Background : rgba(255,255,255,0.1)
Fill : couleur dynamique selon temps écoulé

Calcul :
  maxTime = 20 minutes (configurable)
  progress = min(elapsedMinutes / maxTime, 1.0)

  if progress < 0.25 : #22C55E (vert)
  if progress < 0.50 : #F59E0B (ambre)
  if progress < 0.75 : #F97316 (orange)
  if progress >= 0.75 : #EF4444 (rouge)

Animation : width transition 1s linear (update chaque seconde)
```

### Implémentation

```tsx
function OrderProgressBar({ startTime, maxMinutes = 20 }: Props) {
  const elapsed = useElapsedMinutes(startTime);
  const progress = Math.min(elapsed / maxMinutes, 1);

  const color = progress < 0.25 ? '#22C55E'
    : progress < 0.5 ? '#F59E0B'
    : progress < 0.75 ? '#F97316'
    : '#EF4444';

  return (
    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-linear"
        style={{ width: `${progress * 100}%`, backgroundColor: color }}
      />
    </div>
  );
}
```

---

## 3. Layout Adaptatif

### Mode Kanban (Actuel, Amélioré)

```
┌────────────────────────────────────────────────────┐
│ Header: [Logo KDS] [Station Badge] [Counts] [Time] │
├─────────┬──────────┬───────────┬──────────────────┤
│ URGENT  │ NEW      │ PREPARING │ READY            │
│ (rouge) │ (bleu)   │ (ambre)   │ (vert)           │
│         │          │           │                  │
│ Card    │ Card     │ Card      │ Card             │
│ Card    │ Card     │ Card      │ Card             │
│         │ Card     │           │                  │
│         │ Card     │           │                  │
└─────────┴──────────┴───────────┴──────────────────┘
```

Améliorations :
- Colonnes avec compteurs dans le header : "NEW (4)" "PREPARING (2)" etc.
- Auto-scroll dans chaque colonne si overflow
- Colonne URGENT n'apparaît que si des commandes urgentes existent
- Colonne READY : cards avec opacity réduite (0.7) pour focus sur actif

### Mode File Unique (Alternative pour petites cuisines)

```
┌─────────────────────────────────────────────────────┐
│ Header: [Logo KDS] [Station] [All-day] [Counts]     │
├─────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ Card 1  │ │ Card 2  │ │ Card 3  │ │ Card 4  │   │
│ │ URGENT  │ │ NEW     │ │ NEW     │ │ PREP    │   │
│ │ 🔴 12m  │ │ 🟡 6m  │ │ 🟢 2m  │ │ 🟡 8m  │   │
│ │         │ │         │ │         │ │         │   │
│ │ Items.. │ │ Items.. │ │ Items.. │ │ Items.. │   │
│ │         │ │         │ │         │ │         │   │
│ │ [BUMP]  │ │ [START] │ │ [START] │ │ [READY] │   │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ Card 5  │ │ Card 6  │ │ Card 7  │ │ Card 8  │   │
│ ...                                                 │
└─────────────────────────────────────────────────────┘
```

- Toutes les commandes dans une grille unique
- Triées par priorité : URGENT > NEW (oldest first) > PREPARING > READY
- Statut indiqué par la bordure gauche colorée
- Plus adapté aux petites cuisines avec 1 seul cuisinier

### Toggle Mode
```
Settings > KDS > Display Mode :
  ○ Kanban (columns by status)
  ● Grid (single flow, sorted by priority)
```

---

## 4. Carte Commande Redesign

### Structure

```
┌──────────────────────────────────────┐
│ #042         🔵 Dine-in    ⏱ 6:32  │ ← Header
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░ │ ← Progress bar 4px
├──────────────────────────────────────┤
│  2x  Croissant Beurre               │ ← Items
│  1x  Cappuccino                      │
│       + Extra shot                   │ ← Modifier
│       + Oat milk                     │
│  1x  Pain au Chocolat                │
│  3x  Baguette Tradition             │
├──────────────────────────────────────┤
│ 📍 Table 7    👤 Marie               │ ← Footer info
├──────────────────────────────────────┤
│ ┌────────────────────────────────┐   │
│ │          START                  │   │ ← Bump button
│ └────────────────────────────────┘   │
└──────────────────────────────────────┘

Bordure gauche : 4px couleur statut
```

### Détails Visuels

| Élément | Specs |
|---------|-------|
| Card bg | `#1A1A1E` |
| Card radius | 8px |
| Card padding | 16px |
| Card min-width | 280px |
| Card max-width | 360px |
| Border-left | 4px solid [couleur statut] |
| Order # | DM Sans, 24px, weight 800, white |
| Type icon | Lucide 18px, même ligne que order #, text-muted |
| Timer | JetBrains Mono, 20px, weight 600, couleur dynamique |
| Progress bar | 4px, see section 2 |
| Item quantity | DM Sans, 20px, weight 800, primary gold |
| Item name | DM Sans, 18px, weight 600, white |
| Modifier | DM Sans, 14px, weight 400, italic, text-muted, indent 32px |
| Footer info | DM Sans, 14px, weight 400, text-muted, icons 14px |
| Bump button | 48px hauteur, full-width, couleur selon action |

### Bump Button Variants

| Statut Actuel | Texte Bouton | Couleur | Icône |
|---------------|-------------|---------|-------|
| New | "START" | `#3B82F6` (bleu) | `Play` |
| Preparing | "READY" | `#22C55E` (vert) | `Check` |
| Ready | "SERVED" | `#6B7280` (gris) | `CheckCheck` |

### Animation Nouvelle Commande

```
Séquence d'apparition :
1. Carte slide-in depuis le haut (300ms)
2. Border-left pulse bleu (3 cycles, 2s)
3. Son "ding" (si activé)
4. Flash léger du fond (opacity 0 -> 0.1 -> 0, 500ms)

Séquence bump "READY" :
1. Carte scale(1.02) pendant 200ms
2. Border-left → vert (200ms)
3. Carte se déplace vers la colonne READY (slide-right 400ms)
4. Position libérée, cartes restantes remontent (300ms)
```

---

## 5. All-Day Count

### Display

```
┌─────────────────────────────────────┐
│ ALL-DAY COUNT                   [X] │
├─────────────────────────────────────┤
│ Croissant Beurre           ████ 12  │
│ Cappuccino                 ███  8   │
│ Pain au Chocolat           ██   6   │
│ Baguette Tradition         ██   5   │
│ Latte                      ██   4   │
│ Sandwich Club              █    2   │
└─────────────────────────────────────┘

- Panneau overlay, slide-in depuis la droite
- Largeur : 320px
- Fond : bg-surface (dark)
- Items triés par quantité décroissante
- Barre horizontale proportionnelle (primary gold)
- Toggle via bouton header (ClipboardList icon)
```

---

## 6. Sons & Alertes

### Configuration Sonore

| Événement | Son | Volume | Condition |
|-----------|-----|--------|-----------|
| Nouvelle commande | "ding" court | 70% | Toujours si son activé |
| Commande urgente (>15min) | "alarm" loop | 90% | Toutes les 30s |
| Commande prête (bump) | "success" court | 50% | Optionnel |

### Alerte Visuelle (quand son désactivé)

```
Nouvelle commande sans son :
- Flash de l'écran entier (white overlay 5%, 300ms, 2x)
- Badge "NEW" rouge pulsant dans le header
- Compteur "New" dans le header fait un bump

Commande urgente sans son :
- Bordure de la carte pulse rouge continu
- Header flash rouge subtil (red overlay 3%, 1s loop)
```

---

## 7. Responsive KDS

| Écran | Colonnes Kanban | Taille Carte | Font Scale |
|-------|----------------|-------------|-----------|
| < 768px (tablette portrait) | 1 (scroll) | Full-width | 0.85x |
| 768-1024px (tablette paysage) | 2 | 50% width | 0.9x |
| 1024-1440px (écran standard) | 3-4 | 25-33% | 1x |
| > 1440px (grand écran) | 4 | 25% | 1.1x |

---

*Document généré dans le cadre de l'audit UI/UX complet d'AppGrav*

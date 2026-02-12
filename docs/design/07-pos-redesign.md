# Propositions Redesign POS

> Audit UI/UX AppGrav - Point de Vente
> Date : 2026-02-13

---

## Contexte
Le POS est l'écran **le plus critique** d'AppGrav :
- Utilisé 8h+ par jour en continu
- 200+ transactions quotidiennes
- Environnement : comptoir boulangerie, tablette 10" et dual-screen Windows
- Utilisateurs : staff multilingue, souvent sous pression

---

## Variante 1 : Évolution (Quick Wins)

### Philosophie
Conserver le layout actuel 3 colonnes mais corriger les problèmes identifiés dans l'audit. Effort minimal, impact maximal.

### Changements

#### Layout Dimensions
```
AVANT :
[Sidebar 200px] [Products flex] [Cart 460px]
Header 64px / Footer 56px

APRÈS :
[Sidebar 172px] [Products flex] [Cart 380px]
Header 56px / Footer 52px
```
- Panier réduit de 460px à 380px (+80px pour les produits)
- Sidebar réduite de 200px à 172px
- Header/footer compactés de 8px et 4px

#### Remplacement Emojis
```
🍽️ → UtensilsCrossed (Lucide)
🥡 → Package (Lucide)
🚴 → Bike (Lucide)
🏢 → Building2 (Lucide)
🥐 → Logo SVG The Breakery (24px)
```

#### Couleurs Centralisées
```css
/* AVANT : hardcoded */
background: #020617;
border-color: #2a2a30;

/* APRÈS : CSS vars */
background: var(--pos-bg-deep);
border-color: var(--pos-border);
```

#### Feedback Ajout Panier
```
Au click produit :
1. Scale bounce sur la carte (1.03 → 1, 150ms)
2. Badge counter du panier fait un bump (scale 1.2, 200ms)
3. Toast discret en bas "Product added" (1.5s)
```

#### Bouton PAY Redesign
```
AVANT : bouton standard dans une row de boutons
APRÈS :
- Position : bottom du cart, sticky
- Dimensions : full-width, 56px
- Style : gradient gold (#C9A55C → #9A7B3A)
- Font : 18px, bold, uppercase "PAY IDR XXX,XXX"
- Icône : CreditCard 20px gauche
- Shadow : 0 -4px 12px rgba(201,165,92,0.2)
- Le total est DANS le bouton (pas séparé)
```

#### Product Cards Améliorées
```
Ajouts :
+ Dot catégorie (4px, top-right, couleur catégorie)
+ Badge stock faible (si stock < 10) : orange dot 6px bottom-left
+ Image produit (si disponible) : 48x48, radius 6px, top
+ Hover : légère élévation + border primary/20
```

---

## Variante 2 : Quick Service Mode

### Philosophie
Mode optimisé pour le service au comptoir boulangerie. Interface simplifiée, maximum d'items visibles, flux "scanner, ajouter, payer" ultra-rapide.

### Layout

```
┌──────────────────────────────────────────────────┐
│ Header: [Logo] [Search expanded] [Session] [Time]│
├──────────────────────────────────────────────────┤
│ Categories (horizontal tabs, scroll)              │
├──────────────────────────────────────────────────┤
│                                      │           │
│  Product Grid (large area)           │  Cart     │
│  ┌──────┬──────┬──────┬──────┐      │  (320px)  │
│  │ Prod │ Prod │ Prod │ Prod │      │           │
│  ├──────┼──────┼──────┼──────┤      │  Items    │
│  │ Prod │ Prod │ Prod │ Prod │      │  list     │
│  ├──────┼──────┼──────┼──────┤      │           │
│  │ Prod │ Prod │ Prod │ Prod │      │  ─────    │
│  ├──────┼──────┼──────┼──────┤      │  Total    │
│  │ Prod │ Prod │ Prod │ Prod │      │           │
│  └──────┴──────┴──────┴──────┘      │  [PAY]    │
│                                      │           │
└──────────────────────────────────────┴───────────┘
```

### Différences avec Variante 1
- **Catégories en tabs horizontaux** (économise 172px sidebar)
- **Cart réduit à 320px** (juste l'essentiel)
- **Grille produits maximisée** : 4-5 colonnes au lieu de 3
- **Search bar** : expanded dans le header (pas caché dans la grille)
- **Pas de footer** : boutons d'action intégrés dans le cart

### Cart Simplifié (320px)
```
┌──────────────────────┐
│ [Dine-in][Take][Del] │ ← Type selector, pills
├──────────────────────┤
│ 2x Croissant    6,000│ ← Compact line items
│ 1x Latte       35,000│
│ 1x Pain Complet 8,000│
│                       │
├──────────────────────┤
│ Subtotal     49,000   │
│ Tax (10%)     4,454   │
│ ───────────────────── │
│ TOTAL       49,000    │ ← Bold, 24px
├──────────────────────┤
│ [Discount] [Hold] [X] │ ← Action buttons row
│ ┌────────────────────┐│
│ │    PAY IDR 49,000  ││ ← Gold gradient, 56px
│ └────────────────────┘│
└──────────────────────┘
```

### Avantage Principal
- **+172px** pour les produits par rapport à la Variante 1
- Plus de produits visibles sans scroll
- Flow plus rapide pour comptoir boulangerie (scan -> pay)

---

## Variante 3 : Dual-Screen Optimisé

### Philosophie
Exploiter les setups dual-screen Windows (écran caissier + écran client). Layout adapté pour résolutions 1920px+ avec zone dédiée customer display.

### Layout Écran Principal (1920x1080)

```
┌─────────────────────────────────────────────────────────┐
│ Header: [Logo] [Search] [Session] [Shift] [Time] [Menu] │
├────────────┬────────────────────────────┬───────────────┤
│ Categories │  Product Grid              │    Cart       │
│ (200px)    │  (flex, 5-6 cols)          │    (440px)    │
│            │                            │               │
│ All        │  ┌────┬────┬────┬────┬────┐│  Items +      │
│ Breads     │  │    │    │    │    │    ││  modifiers    │
│ Pastries   │  ├────┼────┼────┼────┼────┤│               │
│ Coffee     │  │    │    │    │    │    ││  Customer     │
│ Drinks     │  ├────┼────┼────┼────┼────┤│  info         │
│ Sandwich   │  │    │    │    │    │    ││               │
│ Desserts   │  ├────┼────┼────┼────┼────┤│  Discount     │
│ Combos     │  │    │    │    │    │    ││               │
│            │  └────┴────┴────┴────┴────┘│  ────────     │
│            │                            │  Total + Tax  │
│ [Shift     │  [Held Orders: 3]          │               │
│  Info]     │                            │  [HOLD] [CLR] │
│            │                            │  [PAY $$$$$$] │
├────────────┴────────────────────────────┴───────────────┤
│ Footer: [F1 Search] [F2 Disc.] [F3 Hold] [F12 Pay]     │
└─────────────────────────────────────────────────────────┘
```

### Spécificités
- **5-6 colonnes produits** sur écran large
- **Cart plus large (440px)** pour afficher les modificateurs inline
- **Footer avec raccourcis clavier** affichés
- **Held orders indicator** dans la zone produits
- **Customer info** directement dans le cart (nom, loyalty tier)

### Responsive Breakpoints POS

| Largeur | Colonnes Produits | Cart | Catégories |
|---------|-------------------|------|------------|
| < 768px | 2 | Full-screen overlay | Horizontal tabs |
| 768-1024px | 3 | 320px | Horizontal tabs |
| 1024-1280px | 3-4 | 360px | Sidebar 172px |
| 1280-1536px | 4-5 | 380px | Sidebar 172px |
| > 1536px | 5-6 | 440px | Sidebar 200px |

---

## Recommandation

### Pour The Breakery (Contexte)
- **Service principal** : comptoir boulangerie (80% des ventes)
- **Service secondaire** : table-service pour la partie café/restaurant
- **Hardware** : tablette Android 10" (comptoir) + dual-screen Windows (caisse principale)

### Proposition
1. **Implémenter Variante 1** en priorité (quick wins, effort minimal)
2. **Ajouter Variante 3** pour le dual-screen Windows
3. **Variante 2** comme option future (toggle "Quick Service" dans les settings)

### Mode Quick Service (Toggle)
```
Settings > POS > Display Mode :
  ○ Standard (sidebar + grid + cart)
  ● Quick Service (tabs + expanded grid + compact cart)
```

---

## Améliorations Transversales (Toutes Variantes)

### 1. Gestion des Promotions
```
Carte produit en promo :
- Badge "PROMO" coin top-left, bg-danger, text-white, 10px
- Prix barré (text-muted, line-through) + nouveau prix (text-success)
- Animation : pulse subtile du badge (2s, 3 cycles puis stop)
```

### 2. Stock Faible sur Cartes
```
Stock < 10 :
- Dot orange 6px, bottom-left de la carte
- Tooltip on hover : "Only X left"

Stock = 0 :
- Carte entière opacity 0.4
- Badge "OUT" overlay center
- Click = toast "This product is out of stock"
```

### 3. Recherche Produit Optimisée
```
Search flow :
1. Focus search (ou F1)
2. Grille filtrée en temps réel (debounce 200ms)
3. Si 0 résultat : empty state "No products match 'xxx'"
4. Si 1 résultat : highlight + auto-select avec Enter
5. Esc : clear search, retour grille complète
```

### 4. Held Orders (Commandes en Attente)
```
Indicateur :
- Badge numérique sur le bouton Hold
- Au hover : mini-preview des held orders (nom + total)
- Click : panneau slide-over avec liste des held orders
- Chaque held order : restore button + delete button
- Auto-delete des held orders > 4h
```

### 5. Animation Paiement Réussi
```
Séquence (1.5s total) :
1. Modal paiement → fond vert progressif (200ms)
2. Grande icône CheckCircle + "Payment Successful" (300ms, scale-in)
3. Montant payé + change affiché (200ms, fade-in)
4. Auto-close après 2s OU touch anywhere
5. Impression reçu déclenchée en parallèle
6. Cart vidé, retour à l'écran produits
```

---

*Document généré dans le cadre de l'audit UI/UX complet d'AppGrav*

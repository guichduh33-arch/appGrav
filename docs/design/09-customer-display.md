# Propositions Customer Display

> Audit UI/UX AppGrav - Écran Client
> Date : 2026-02-13

---

## Contexte
- Écran face client (2ème écran ou tablette dédiée)
- Affichage passif uniquement (pas d'interaction)
- Doit renforcer l'image de marque The Breakery
- Visible par les clients pendant l'attente
- Transitions fluides entre les états

---

## 1. États de l'Écran

### État 1 : Veille (Idle)

Affiché quand aucune commande n'est en cours.

```
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│          [Logo The Breakery]             │
│          Artisan French Bakery           │
│                                          │
│     ┌──────────────────────────────┐     │
│     │                              │     │
│     │    [Image produit du jour]   │     │
│     │                              │     │
│     │   "Fresh Croissants"         │     │
│     │    Baked daily at 6am        │     │
│     │                              │     │
│     └──────────────────────────────┘     │
│                                          │
│           ─── Welcome ───                │
│                                          │
│     [Logo watermark 10% opacity]         │
└──────────────────────────────────────────┘
```

#### Spécifications
- **Fond** : `#111113` (warm black)
- **Logo** : SVG centré, 120px largeur, white/gold
- **Sous-titre** : Cormorant Garamond, 18px, `#A8A29E`
- **Carousel produits** : rotation toutes les 8 secondes
  - Image : 480x320px, radius 16px, object-cover
  - Nom : DM Sans, 24px, weight 600, white
  - Description : DM Sans, 16px, `#A8A29E`
  - Transition : crossfade 600ms
- **Watermark** : Logo SVG centré bas, opacity 8%, 200px largeur

#### Contenu Carousel
1. Produit phare du jour
2. Promotion en cours
3. Nouveau produit
4. Image ambiance boulangerie
5. Message saisonnier

---

### État 2 : Commande en Cours (Active Cart)

Affiché quand le caissier ajoute des produits au panier.

```
┌──────────────────────────────────────────┐
│  [Logo 32px]              Your Order     │
├──────────────────────────────────────────┤
│                                          │
│   2x  Croissant Beurre        12,000    │
│   1x  Cappuccino              35,000    │
│       + Extra shot              5,000    │
│   1x  Pain au Chocolat        15,000    │
│                                          │
│                                          │
│                                          │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│            IDR 67,000                    │
│              TOTAL                       │
│                                          │
│     [Logo watermark 6% opacity]          │
└──────────────────────────────────────────┘
```

#### Spécifications
- **Header** : Logo 32px gauche, "Your Order" DM Sans 18px, weight 600
- **Items** :
  - Quantité : DM Sans, 16px, weight 600, gold `#C9A55C`
  - Nom : DM Sans, 18px, weight 500, white
  - Prix : DM Sans, 18px, weight 500, `#A8A29E`, tabular-nums, align right
  - Modifier : DM Sans, 14px, italic, `#78716C`, indent 40px
- **Total** :
  - Montant : DM Sans, 48px, weight 700, gold `#C9A55C`, tabular-nums
  - Label "TOTAL" : DM Sans, 14px, uppercase, tracking +0.1em, `#78716C`
- **Animation ajout item** : nouveau item slide-in depuis droite (300ms), flash highlight gold/10% (200ms)
- **Animation update total** : scale bounce 1.05 (200ms)

---

### État 3 : Paiement en Cours

```
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│                                          │
│            IDR 67,000                    │
│              TOTAL                       │
│                                          │
│         ◐ Processing...                  │
│                                          │
│                                          │
│                                          │
│     [Logo watermark 6% opacity]          │
└──────────────────────────────────────────┘
```

- **Montant** : 56px, gold, centré
- **Spinner** : 24px, gold, animation spin 0.8s
- **Label** : "Processing..." DM Sans, 16px, text-muted

---

### État 4 : Paiement Réussi

```
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│              ✓                            │
│         Thank You!                       │
│                                          │
│       Order #042                         │
│                                          │
│     Change: IDR 33,000                   │
│                                          │
│                                          │
│      Merci de votre visite               │
│   Thank you for your visit               │
│                                          │
│     [Logo watermark 8% opacity]          │
└──────────────────────────────────────────┘
```

- **Checkmark** : `CheckCircle` Lucide 64px, `#22C55E`, scale-in 300ms
- **"Thank You!"** : Cormorant Garamond, 36px, weight 600, white
- **Order #** : DM Sans, 20px, weight 600, gold
- **Change** : DM Sans, 24px, weight 600, white (si applicable)
- **Messages bilingues** : DM Sans, 16px, `#78716C`, italic
- **Durée affichage** : 5 secondes puis transition vers idle
- **Animation** :
  1. Fond -> légèrement verdâtre (`#0A1F0A`) 200ms
  2. Checkmark scale-in avec bounce
  3. Texte fade-in séquentiel (200ms delay chacun)

---

### État 5 : Commande Prête (KDS -> Display)

```
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│          YOUR ORDER IS READY             │
│                                          │
│              #042                        │
│                                          │
│         Please collect at the            │
│              counter                     │
│                                          │
│                                          │
│     [Logo watermark 8% opacity]          │
└──────────────────────────────────────────┘
```

- **"YOUR ORDER IS READY"** : DM Sans, 28px, weight 700, `#22C55E`, uppercase
- **Numéro** : DM Sans, 64px, weight 800, gold `#C9A55C`
- **Message** : DM Sans, 18px, weight 400, `#A8A29E`
- **Animation** : pulse border vert subtil (2s, infinite)
- **Durée** : jusqu'à la prochaine commande ou timeout 2 minutes

---

## 2. Transitions entre États

| De -> Vers | Transition | Durée |
|-----------|-----------|-------|
| Idle -> Active | Crossfade | 500ms |
| Active -> Processing | Slide-up items, scale-down total | 400ms |
| Processing -> Success | Fade fond vert, scale-in checkmark | 500ms |
| Success -> Idle | Crossfade | 600ms |
| Active -> Idle (abandon) | Fade-out items, crossfade carousel | 500ms |
| Any -> Ready | Slide-up, scale-in numéro | 400ms |

### Respect Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Toutes transitions -> opacity fade 200ms uniquement */
  /* Pas de scale, slide, bounce */
}
```

---

## 3. Mode Queue (Multi-Commandes)

Pour les moments de rush, afficher plusieurs commandes en préparation.

```
┌──────────────────────────────────────────┐
│  [Logo]     Orders in Progress     [Time]│
├──────────────────────────────────────────┤
│                                          │
│  PREPARING                               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ #038 │ │ #039 │ │ #040 │ │ #041 │   │
│  │  ⏳  │ │  ⏳  │ │  ⏳  │ │  ⏳  │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
│                                          │
│  READY FOR PICKUP                        │
│  ┌──────┐ ┌──────┐                      │
│  │ #036 │ │ #037 │                      │
│  │  ✓   │ │  ✓   │                      │
│  └──────┘ └──────┘                      │
│                                          │
│     [Logo watermark 6% opacity]          │
└──────────────────────────────────────────┘
```

- **Numéros** : 36px, weight 800
- **Preparing** : border ambre, icône `Clock`
- **Ready** : border vert, icône `CheckCircle`, fond vert subtil
- **Animation** : nouveau numéro slide-in, ready = bounce + vert
- **Max affiché** : 8 preparing + 4 ready, scroll si plus

---

## 4. Thème & Identité

### Fond
- **Base** : `#111113` (warm black, pas pur noir)
- **Pas de gradient** : fond uni pour lisibilité maximale
- **Option** : texture très subtile type papier kraft (opacity 2-3%)

### Logo
- Version "display" du logo : white ou gold selon le fond
- Placement : header (petit, 32px) + watermark (grand, ~200px, opacity 6-10%)
- Pas de version plein écran sauf idle state

### Couleur Accent
- Gold `#C9A55C` : prix, totaux, numéros de commande
- Blanc `#F5F4F1` : texte principal
- Stone `#A8A29E` / `#78716C` : texte secondaire
- Vert `#22C55E` : statut "ready"

---

## 5. Considérations Techniques

### Performance
- **60fps obligatoire** pour toutes les transitions
- Utiliser `transform` et `opacity` uniquement (GPU-accelerated)
- Pas de `layout shift` pendant les transitions
- Carousel : preload images next/prev

### Veille Longue
- Après 30 min sans activité : baisser luminosité à 70%
- Carousel ralentit (15s au lieu de 8s)
- Pas de screensaver (l'affichage est le screensaver)

### Connexion POS
- Via `BroadcastChannel` API (même machine) ou LAN websocket
- Latence max acceptable : 200ms entre action POS et affichage
- Fallback : polling toutes les 2s si WebSocket down

---

*Document généré dans le cadre de l'audit UI/UX complet d'AppGrav*

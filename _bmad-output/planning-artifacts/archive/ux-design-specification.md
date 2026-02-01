---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
status: complete
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-AppGrav-2026-01-30.md
  - _bmad-output/planning-artifacts/prd.md
  - docs/index.md
  - docs/architecture-main.md
  - docs/data-models.md
  - docs/user-guide.md
  - docs/COMBOS_AND_PROMOTIONS.md
  - docs/STOCK_MOVEMENTS_MODULE.md
date: 2026-01-30
author: MamatCEO
projectName: AppGrav
---

# UX Design Specification - AppGrav

**Author:** MamatCEO
**Date:** 2026-01-30

---

## Executive Summary

### Project Vision

AppGrav est un système ERP/POS éducatif conçu pour The Breakery, une boulangerie artisanale française à Lombok, Indonésie. La philosophie centrale : **éduquer en protégeant** — permettre aux employés peu qualifiés de prendre des décisions simples sans risque de catastrophe, tout en automatisant les contrôles pour libérer le manager unique.

**Principes UX Fondamentaux :**
- Décisions à faible enjeu avec erreurs réversibles
- Feedback discret mais encourageant (toasts légers)
- Interface lisible : Icône + Texte, tailles généreuses
- Filet de sécurité manager pour décisions sensibles
- Résilience offline transparente

### Target Users

| Persona | Contexte | Besoin UX Principal |
|---------|----------|---------------------|
| **Manager (MamatCEO)** | Entrepreneur seul, 30 employés à gérer | Dashboard consolidé, visibilité 30 secondes, alertes proactives |
| **Équipe Production** | 20-25 ans, peur de mal faire | Protocoles visuels, checkpoints qualité, zéro décision critique |
| **Équipe Café/Service** | Contrôle qualité avant service | Interface ultra-fluide, checkpoints obligatoires |
| **Caissier (Budi)** | Face aux coupures internet quotidiennes | Mode offline transparent, indicateurs non anxiogènes |
| **Serveur (Marie)** | Allers-retours constants vers la caisse | App mobile, envoi direct KDS, autonomie en salle |
| **Client (Pak Wayan)** | Veut sa commande en temps réel | Customer Display transparent, confiance renforcée |

### Key Design Challenges

1. **Résilience Offline**
   - Transition online↔offline imperceptible (< 2 secondes)
   - Toutes les fonctionnalités disponibles en mode dégradé
   - Indicateur de statut visible mais non stressant

2. **Checkpoints Qualité (À concevoir)**
   - Flux Production → Café → Client à designer
   - Validation obligatoire avant passage à l'étape suivante
   - Traçabilité des refus et corrections

3. **Multi-Device Synchronisation**
   - POS (Chrome), Mobile (Capacitor), KDS, Customer Display
   - Communication LAN temps réel sans dépendance internet
   - État cohérent entre tous les appareils

4. **Interface pour Utilisateurs Non-Techniques**
   - Zones tactiles généreuses (44x44px minimum)
   - Texte lisible (18px minimum, 24px pour prix)
   - Feedback discret : toasts encourageants, jamais accusateurs

### Design Opportunities

1. **Customer Display comme Outil de Confiance**
   - Transparence totale : articles, prix, total en temps réel
   - Différenciateur client : "Ici, vous voyez tout"

2. **App Mobile Serveur comme Libérateur**
   - Fin des allers-retours caisse
   - Serveurs plus disponibles pour les clients
   - Envoi direct en cuisine = service plus rapide

3. **Feedback Émotionnel Discret**
   - Toasts positifs ("Commande envoyée") renforçant la confiance
   - Messages d'erreur reformulés en opportunités ("Vérifions ensemble")
   - Tonalité professionnelle et bienveillante

4. **Mode Offline comme Avantage Compétitif**
   - 2h d'autonomie = continuité de service garantie
   - Synchronisation automatique = zéro perte de données
   - Expérience utilisateur identique online/offline

---

## Core User Experience

### Defining Experience

**L'Action Critique : La Prise de Commande**

Le cœur battant d'AppGrav est la prise de commande au POS. Si cette action échoue, bloque ou frustre, tout le reste perd son sens. Cette interaction doit être :
- **Infaillible** : Fonctionne toujours, online ou offline
- **Rapide** : Produit ajouté en 1 tap, variante en 2 taps maximum
- **Informative** : Stock, prix, options visibles instantanément
- **Réversible** : Erreur = correction facile, pas de panique

### Platform Strategy

| Plateforme | Rôle | Interaction Primaire |
|------------|------|----------------------|
| **POS (Chrome)** | Caisse principale | Tactile, écran large, flux d'encaissement |
| **Mobile (Capacitor)** | Serveurs en salle | Tactile, écran compact, prise de commande rapide |
| **KDS (Chrome)** | Cuisine | Tactile, lecture seule, marquage "prêt" |
| **Customer Display** | Client face comptoir | Lecture seule, transparence commande |

**Contraintes Techniques :**
- Communication LAN obligatoire (offline-first)
- Synchronisation cloud opportuniste
- État cohérent entre tous les appareils en < 1 seconde (LAN)

### Effortless Interactions

**Ce qui doit être invisible :**

1. **Disponibilité Stock**
   - Badge visuel sur chaque produit (vert/orange/rouge)
   - Stock exact visible au survol/tap long
   - Impossible d'ajouter un produit en rupture (grisé avec explication)

2. **Variantes et Options**
   - Affichage automatique des variantes à la sélection du produit
   - Prix ajusté en temps réel selon les options
   - Options fréquentes en premier (apprentissage par usage)

3. **Transition Offline**
   - Indicateur discret mais visible (icône, pas de texte alarmant)
   - Aucune fonctionnalité bloquée
   - Synchronisation silencieuse au retour online

4. **Calculs et Totaux**
   - Sous-total, taxes, remises : calcul instantané
   - Customer Display synchronisé en < 500ms

### Critical Success Moments

**Le Succès se Mesure en Fin de Journée**

Contrairement aux produits "wow" qui cherchent un moment magique, AppGrav vise la **fatigue zéro**. Le succès n'est pas "Waouh, c'est génial !" mais "Tiens, c'était facile aujourd'hui".

**Moments Critiques par Persona :**

| Persona | Moment Critique | Indicateur de Succès |
|---------|-----------------|----------------------|
| **Caissier** | Première coupure internet | "Je n'ai même pas remarqué" |
| **Serveur** | Première commande envoyée depuis la salle | "La cuisine l'a reçue instantanément" |
| **Client** | Voir sa commande s'afficher | "Je vois exactement ce que je paie" |
| **Manager** | Consultation du dashboard le matin | "Tout est là en 30 secondes" |

**Moment Make-or-Break :**
Un nouvel employé qui termine sa première journée sans avoir eu besoin d'appeler le manager pour un problème d'interface = victoire UX.

### Experience Principles

1. **"Le POS est Sacré"**
   - Rien ne bloque jamais la prise de commande
   - Toute information nécessaire est visible sans navigation
   - Les erreurs sont réversibles en 1 tap

2. **"Information Proactive"**
   - L'interface montre avant qu'on demande
   - Stock, variantes, prix : visibles au bon moment
   - Zéro recherche, zéro menu caché pour l'essentiel

3. **"Fatigue Zéro"**
   - Chaque interaction économise de l'énergie cognitive
   - Zones tactiles généreuses, contrastes forts
   - Feedback discret mais présent

4. **"Offline = Normal"**
   - Le cloud est un bonus, pas une dépendance
   - L'expérience est identique online/offline
   - La synchronisation est invisible et fiable

---

## Emotional Response Design

### Desired User Feelings

**Tonalité Générale : Professionnelle et Rassurante**

AppGrav ne cherche pas à impressionner mais à **rassurer**. L'émotion cible n'est pas l'excitation mais la **confiance tranquille**.

| Contexte | Émotion Visée | Anti-Pattern à Éviter |
|----------|---------------|----------------------|
| **Action réussie** | Satisfaction discrète | Célébration excessive |
| **Erreur utilisateur** | Sérénité ("on corrige") | Culpabilisation |
| **Coupure internet** | Indifférence | Alarme / Panique |
| **Fin de journée** | Fierté calme | Épuisement |

### Feedback Intensity Scale

**Niveau choisi : Très Discret**

| Type de Feedback | Implémentation |
|------------------|----------------|
| **Succès** | Toast léger (2-3 sec), coin inférieur, icône ✓ verte |
| **Information** | Toast neutre, icône ℹ️ bleue |
| **Attention** | Toast orange, persiste 4 sec, icône ⚠️ |
| **Erreur** | Toast rouge, action requise, message reformulé positivement |

### Emotional Micro-Copy Guidelines

**Principes de rédaction :**

1. **Jamais accusateur**
   - ❌ "Erreur : Stock insuffisant"
   - ✅ "Ce produit n'est plus en stock — voulez-vous une alternative ?"

2. **Toujours une solution**
   - ❌ "Impossible de synchroniser"
   - ✅ "Mode hors ligne actif — vos données sont en sécurité"

3. **Court et actionnable**
   - ❌ "La commande a été envoyée avec succès au système de cuisine"
   - ✅ "Envoyé en cuisine ✓"

4. **Personnalisé quand pertinent**
   - "Commande Table 7 prête" plutôt que "Commande #1234 prête"

### Stress-Free States

**États potentiellement stressants → Réponse UX :**

| État | Réponse UX |
|------|------------|
| **Offline** | Icône wifi barrée (grise, pas rouge), pas de message intrusif |
| **Stock bas** | Badge orange discret sur le produit, info au tap |
| **Erreur de saisie** | Champ surligné + suggestion, pas de popup |
| **Attente sync** | Indicateur rotatif subtil, pas de "chargement..." |

---

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Référentiels Indonésiens Analysés :**

| Produit | Type | Leçon Principale |
|---------|------|------------------|
| **Gojek/Grab** | Super-app | Navigation par icônes géantes, bottom bar fixe |
| **Moka POS** | POS leader | Grille photos, panier visible, paiement 2 taps |
| **GoPay/OVO** | E-wallet | Gros boutons, confirmation visuelle forte |
| **WhatsApp** | Communication | Double-check statut, interface universelle |

**Pourquoi ces références :**
Ces apps sont utilisées quotidiennement par les employés de The Breakery. Ils en maîtrisent les patterns inconsciemment. Réutiliser ces patterns = courbe d'apprentissage quasi nulle.

### Transferable UX Patterns

**Navigation :**
- Grille produits avec photos obligatoires
- Bottom bar fixe pour actions principales
- Tabs horizontaux pour catégories
- Sidebar panier toujours visible (POS)

**Interactions :**
- Tap = action immédiate (ajouter au panier)
- Long press = options/variantes
- Swipe = actions secondaires (supprimer)
- Pull to refresh = synchronisation manuelle

**Feedback :**
- Double-check (✓✓) pour statut synchronisation
- Badges numériques pour notifications
- Toasts non-bloquants pour confirmations
- Haptic feedback sur mobile

### Anti-Patterns to Avoid

| Éviter | Raison | Alternative |
|--------|--------|-------------|
| Popups bloquantes | Interrompent le flux | Toasts discrets |
| Menu hamburger | Cache les fonctions | Bottom bar visible |
| Texte sans icône | Illisible | Icône + texte court |
| Rouge = offline | Crée panique | Gris neutre |
| Confirmations multiples | Ralentit | 1 confirmation max |

### Design Inspiration Strategy

**Principe directeur :** Réutiliser les patterns que les utilisateurs connaissent déjà (Gojek, WhatsApp, Moka) pour éliminer la courbe d'apprentissage.

**Cohérence cross-platform :**
- POS, Mobile, KDS partagent les mêmes patterns de base
- Seule la densité d'information change selon la taille d'écran
- Même langage visuel partout = formation minimale

---

## Design System Foundation

### Design System Choice

**Choix : Tailwind CSS + shadcn/ui**

| Aspect | Décision |
|--------|----------|
| **Framework CSS** | Tailwind CSS (déjà en place) |
| **Bibliothèque de composants** | shadcn/ui |
| **Icônes** | Lucide React (déjà en place) |
| **Approche** | Composants copiés, pas installés — contrôle total |

### Rationale for Selection

**Pourquoi shadcn/ui pour AppGrav :**

1. **Accessibilité native** — Basé sur Radix UI, composants accessibles par défaut (ARIA, keyboard navigation)
2. **Contrôle total** — Code copié dans le projet, pas de dépendance npm à maintenir
3. **Cohérence Tailwind** — Stylé avec les mêmes classes Tailwind, pas de conflit de styles
4. **Composants utiles** — Toast, Dialog, Select, Tabs, Badge couvrent 80% des besoins AppGrav
5. **Personnalisation facile** — Fichier `components.json` + CSS variables pour le thème
6. **Communauté active** — Bien documenté, patterns éprouvés

### Implementation Approach

**Étapes d'intégration :**

```bash
# 1. Initialiser shadcn/ui
npx shadcn-ui@latest init

# 2. Ajouter les composants nécessaires
npx shadcn-ui@latest add toast dialog select tabs badge button card
```

**Structure des composants :**
```
src/components/
├── ui/           # Composants shadcn/ui (copiés)
│   ├── toast.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── tabs.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   └── card.tsx
├── pos/          # Composants métier POS
├── inventory/    # Composants métier Inventaire
└── ...
```

### Customization Strategy

**Design Tokens AppGrav :**

```css
/* globals.css - Thème AppGrav */
:root {
  /* Couleurs principales */
  --primary: 222.2 47.4% 11.2%;      /* Bleu foncé professionnel */
  --primary-foreground: 210 40% 98%;

  /* États */
  --success: 142 76% 36%;            /* Vert stock OK */
  --warning: 38 92% 50%;             /* Orange attention */
  --destructive: 0 84% 60%;          /* Rouge erreur */

  /* Surfaces */
  --background: 0 0% 100%;
  --card: 0 0% 100%;
  --muted: 210 40% 96%;

  /* Rayons */
  --radius: 0.5rem;                  /* Coins arrondis modérés */
}
```

**Adaptations spécifiques AppGrav :**

| Composant | Personnalisation |
|-----------|------------------|
| **Toast** | Position: bottom-right, durée: 3s par défaut |
| **Button** | Taille minimum: 44x44px, padding augmenté |
| **Dialog** | Overlay semi-transparent, animation douce |
| **Badge** | 3 variantes: stock-ok, stock-low, stock-out |
| **Card** | Ombre légère, hover subtil pour produits |

### Component Priority List

**Phase 1 — Critiques (immédiat) :**
- `Toast` — Feedback utilisateur
- `Button` — Actions principales
- `Badge` — Statuts stock
- `Card` — Grille produits

**Phase 2 — Importants (court terme) :**
- `Dialog` — Confirmations, PIN manager
- `Select` — Variantes produits
- `Tabs` — Catégories, navigation

**Phase 3 — Utiles (moyen terme) :**
- `Sheet` — Panels latéraux mobile
- `Dropdown` — Menus contextuels
- `Tooltip` — Aide contextuelle

---

## Visual Foundation

### Color Palette

**Couleurs Principales :**

| Rôle | Couleur | Hex | Usage |
|------|---------|-----|-------|
| **Primary** | Bleu professionnel | `#1e3a5f` | Actions principales, headers |
| **Secondary** | Gris chaud | `#64748b` | Texte secondaire, bordures |
| **Accent** | Orange boulangerie | `#f59e0b` | Highlights, promotions |

**Couleurs Sémantiques :**

| État | Couleur | Hex | Usage |
|------|---------|-----|-------|
| **Success** | Vert | `#22c55e` | Stock OK, confirmations |
| **Warning** | Orange | `#f97316` | Stock bas, attention |
| **Error** | Rouge | `#ef4444` | Erreurs, rupture stock |
| **Info** | Bleu clair | `#3b82f6` | Informations, aide |
| **Offline** | Gris | `#9ca3af` | Mode hors ligne (neutre, pas alarmant) |

**Surfaces :**

| Surface | Couleur | Usage |
|---------|---------|-------|
| **Background** | `#ffffff` | Fond principal |
| **Card** | `#ffffff` | Cartes produits |
| **Muted** | `#f8fafc` | Fonds secondaires |
| **Border** | `#e2e8f0` | Séparateurs |

### Typography

**Police : System UI Stack**
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

**Échelle Typographique :**

| Élément | Taille | Poids | Usage |
|---------|--------|-------|-------|
| **H1** | 28px | 700 | Titres de page |
| **H2** | 22px | 600 | Sections |
| **H3** | 18px | 600 | Sous-sections |
| **Body** | 16px | 400 | Texte courant |
| **Body Large** | 18px | 400 | Texte important (POS) |
| **Price** | 24px | 700 | Prix affichés |
| **Small** | 14px | 400 | Labels, métadonnées |
| **Tiny** | 12px | 500 | Badges, statuts |

### Spacing System

**Échelle basée sur 4px :**

| Token | Valeur | Usage |
|-------|--------|-------|
| `space-1` | 4px | Micro-espacement |
| `space-2` | 8px | Entre éléments proches |
| `space-3` | 12px | Padding interne |
| `space-4` | 16px | Espacement standard |
| `space-6` | 24px | Entre sections |
| `space-8` | 32px | Marges de page |

### Touch Targets

**Tailles minimales obligatoires :**

| Élément | Taille Min | Contexte |
|---------|------------|----------|
| **Bouton principal** | 48x48px | POS, Mobile |
| **Bouton secondaire** | 44x44px | Back-office |
| **Item de liste** | 48px hauteur | Listes cliquables |
| **Zone de tap produit** | 80x80px min | Grille produits |

---

## Screen Layouts

### POS Layout (Écran Principal)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  The Breakery POS    [🔄 Sync ✓✓] [👤 Budi] [⚙️]   │  <- Header 56px
├─────────────────────────────────────────────────────────────┤
│ [Viennoiseries] [Boissons] [Pâtisseries] [Sandwichs] [Tous] │  <- Tabs catégories
├────────────────────────────────────┬────────────────────────┤
│                                    │                        │
│   ┌─────┐  ┌─────┐  ┌─────┐       │   PANIER              │
│   │ 🥐  │  │ ☕  │  │ 🥖  │       │                        │
│   │Crois│  │Café │  │Bague│       │   Croissant    x2  30K│
│   │ 15K │  │ 20K │  │ 25K │       │   Café         x1  20K│
│   │ 🟢  │  │ 🟢  │  │ 🟠  │       │   ─────────────────── │
│   └─────┘  └─────┘  └─────┘       │   Sous-total     50K  │
│                                    │   TVA (10%)       5K  │
│   ┌─────┐  ┌─────┐  ┌─────┐       │   ═══════════════════ │
│   │ 🍰  │  │ 🥪  │  │ 🍪  │       │   TOTAL          55K  │
│   │Tarte│  │Sand.│  │Cookie│      │                        │
│   │ 35K │  │ 40K │  │ 10K │       │  ┌──────────────────┐ │
│   │ 🟢  │  │ 🔴  │  │ 🟢  │       │  │   ENCAISSER      │ │
│   └─────┘  └─────┘  └─────┘       │  │      55K         │ │
│                                    │  └──────────────────┘ │
│        [60% largeur]               │    [40% largeur]      │
└────────────────────────────────────┴────────────────────────┘
```

### Mobile Layout (Serveur)

```
┌─────────────────────┐
│ Table 7     [✓✓]   │  <- Header compact
├─────────────────────┤
│[Vienn][Boiss][Pâtis]│  <- Tabs scrollables
├─────────────────────┤
│ ┌─────┐  ┌─────┐   │
│ │ 🥐  │  │ ☕  │   │
│ │Crois│  │Café │   │   Grille 2 colonnes
│ │ 15K │  │ 20K │   │
│ └─────┘  └─────┘   │
│ ┌─────┐  ┌─────┐   │
│ │ 🥖  │  │ 🍰  │   │
│ │Bague│  │Tarte│   │
│ │ 25K │  │ 35K │   │
│ └─────┘  └─────┘   │
├─────────────────────┤
│ Panier (3)    55K  │  <- Bottom bar fixe
│ [Envoyer en cuisine]│
└─────────────────────┘
```

### Customer Display Layout

```
┌─────────────────────────────────────┐
│                                     │
│         THE BREAKERY                │  <- Logo centré
│                                     │
├─────────────────────────────────────┤
│                                     │
│   Croissant              15,000    │
│   Café Latte             20,000    │
│   Pain au chocolat       18,000    │  <- Items animés
│                                     │
├─────────────────────────────────────┤
│                                     │
│         TOTAL                       │
│        53,000 IDR                   │  <- Prix géant
│                                     │
│   Terima kasih! 🙏                  │
└─────────────────────────────────────┘
```

### KDS Layout (Cuisine)

```
┌──────────────────────────────────────────────────────────┐
│  CUISINE - Kitchen Display    [En attente: 3] [Prêt: 2] │
├──────────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌────────────┐ ┌────────────┐            │
│ │ TABLE 7    │ │ COMPTOIR   │ │ TABLE 3    │            │
│ │ 🕐 2:34    │ │ 🕐 1:12    │ │ 🕐 0:45    │            │
│ ├────────────┤ ├────────────┤ ├────────────┤            │
│ │ 2x Crois.  │ │ 1x Sandwich│ │ 3x Pain ch.│            │
│ │ 1x Baguette│ │ 2x Quiche  │ │            │            │
│ │            │ │            │ │            │            │
│ ├────────────┤ ├────────────┤ ├────────────┤            │
│ │  [PRÊT ✓]  │ │  [PRÊT ✓]  │ │  [PRÊT ✓]  │            │
│ └────────────┘ └────────────┘ └────────────┘            │
└──────────────────────────────────────────────────────────┘
```

---

## Key User Flows

### Flow 1 : Prise de Commande POS

```
[Démarrage]
     │
     ▼
┌─────────────┐
│ Tap produit │ ──► Produit ajouté au panier (toast discret)
└─────────────┘
     │
     ▼ (si variantes)
┌─────────────┐
│ Modal       │ ──► Sélection variante ──► Fermeture auto
│ Variantes   │     (taille, options)
└─────────────┘
     │
     ▼
┌─────────────┐
│ Continuer   │ ──► Répéter pour autres produits
│ ou Payer    │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Tap         │
│ ENCAISSER   │
└─────────────┘
     │
     ▼
┌─────────────┐     ┌─────────────┐
│ Espèces     │ ou  │ Carte/QRIS  │
└─────────────┘     └─────────────┘
     │                    │
     ▼                    ▼
┌─────────────┐     ┌─────────────┐
│ Rendu       │     │ Attente     │
│ monnaie     │     │ paiement    │
└─────────────┘     └─────────────┘
     │                    │
     └────────┬───────────┘
              ▼
       ┌─────────────┐
       │ Toast:      │
       │ "Commande   │
       │ validée ✓"  │
       └─────────────┘
              │
              ▼
       [Panier vidé, prêt pour suivant]
```

### Flow 2 : Mode Offline

```
[Internet OK]  ──────►  [Coupure détectée]
     │                        │
     │                        ▼
     │                 ┌─────────────┐
     │                 │ Icône wifi  │
     │                 │ grise       │  ← Pas de popup !
     │                 │ (header)    │
     │                 └─────────────┘
     │                        │
     │                        ▼
     │                 [Fonctionnement normal]
     │                 - Commandes OK
     │                 - Paiements OK
     │                 - KDS via LAN
     │                        │
     │                        ▼
     │                 [Stockage local]
     │                 - IndexedDB
     │                 - File d'attente sync
     │                        │
     └────────────────────────┤
                              ▼
                       [Internet revient]
                              │
                              ▼
                       ┌─────────────┐
                       │ Sync auto   │
                       │ (silencieux)│
                       └─────────────┘
                              │
                              ▼
                       ┌─────────────┐
                       │ ✓✓ affiché  │
                       │ (double     │
                       │  check)     │
                       └─────────────┘
```

### Flow 3 : Checkpoint Qualité (À Implémenter)

```
[Production termine un produit]
              │
              ▼
       ┌─────────────┐
       │ Marquer     │
       │ "Terminé"   │
       └─────────────┘
              │
              ▼
       ┌─────────────┐
       │ Photo +     │  ← Optionnel mais encouragé
       │ Note qualité│
       └─────────────┘
              │
              ▼
[Produit visible sur écran Café]
              │
              ▼
       ┌─────────────┐
       │ Café        │
       │ vérifie     │
       └─────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
   [OK ✓]        [Refus]
       │             │
       ▼             ▼
  [Service]    ┌─────────────┐
               │ Raison +    │
               │ Retour prod │
               └─────────────┘
```

---

## Responsive & Accessibility

### Breakpoints

| Breakpoint | Largeur | Cible |
|------------|---------|-------|
| **Mobile** | < 640px | App serveur, téléphones |
| **Tablet** | 640-1024px | Tablette serveur, petit écran |
| **Desktop** | > 1024px | POS principal, back-office |

### Adaptations par Taille

| Élément | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Grille produits** | 2 colonnes | 3 colonnes | 4 colonnes |
| **Panier** | Bottom sheet | Sidebar réduite | Sidebar fixe 40% |
| **Navigation** | Bottom bar | Bottom bar | Sidebar + header |
| **Taille boutons** | 48px | 44px | 44px |
| **Taille texte prix** | 20px | 22px | 24px |

### Accessibilité

**Principes appliqués :**

1. **Contraste**
   - Ratio minimum 4.5:1 pour texte normal
   - Ratio minimum 3:1 pour texte large
   - Jamais de texte gris clair sur fond blanc

2. **Focus Visible**
   - Outline visible sur tous les éléments focusables
   - Navigation clavier complète
   - Skip links pour navigation rapide

3. **Labels**
   - Tous les inputs ont des labels explicites
   - Icônes accompagnées de texte ou aria-label
   - Messages d'erreur associés aux champs

4. **Motion**
   - Animations réduites si `prefers-reduced-motion`
   - Pas d'animation essentielle à la compréhension

---

## Implementation Checklist

### Phase 1 — MVP Offline & Customer Display

| Composant | Priorité | Complexité |
|-----------|----------|------------|
| Indicateur statut connexion | P0 | Faible |
| File d'attente offline (IndexedDB) | P0 | Élevée |
| Sync automatique au retour | P0 | Moyenne |
| Customer Display - route `/display` | P0 | Moyenne |
| Communication LAN (WebSocket) | P0 | Élevée |

### Phase 2 — App Mobile Serveur

| Composant | Priorité | Complexité |
|-----------|----------|------------|
| Layout mobile responsive | P1 | Moyenne |
| Sélection table | P1 | Faible |
| Envoi commande KDS | P1 | Moyenne |
| Notification "commande prête" | P2 | Moyenne |

### Phase 3 — Améliorations UX

| Composant | Priorité | Complexité |
|-----------|----------|------------|
| Badges stock sur produits | P1 | Faible |
| Modal variantes améliorée | P1 | Moyenne |
| Toasts système (shadcn/ui) | P1 | Faible |
| Checkpoints qualité | P2 | Élevée |

---

## Summary & Next Steps

### Ce Document Définit

✅ **Vision UX** — Système éducatif, fatigue zéro, confiance tranquille
✅ **Personas** — 6 utilisateurs avec besoins spécifiques
✅ **Principes** — POS sacré, information proactive, offline = normal
✅ **Design System** — Tailwind + shadcn/ui
✅ **Patterns** — Inspirés Gojek/Moka/WhatsApp
✅ **Layouts** — POS, Mobile, KDS, Customer Display
✅ **Flows** — Commande, Offline, Qualité

### Prochaines Étapes Recommandées

1. **Architecture** → Créer le document d'architecture technique
2. **Epics & Stories** → Transformer les flows en user stories
3. **Prototypage** → Wireframes interactifs des écrans clés
4. **Intégration shadcn/ui** → Installer et configurer les composants
5. **Implémentation** → Commencer par le mode offline (critique)

---

*Document généré le 2026-01-30 avec le workflow BMAD UX Design*
*Auteur : MamatCEO | Facilitatrice UX : Sally*

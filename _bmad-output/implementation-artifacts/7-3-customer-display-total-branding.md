# Story 7.3: Customer Display Total & Branding

Status: ready-for-dev

## Story

As a **Client**,
I want **voir le total et le branding de la boulangerie**,
So that **je sais combien payer et l'expérience est professionnelle**.

## Acceptance Criteria

### AC1: Affichage du Total Géant
**Given** une commande en cours
**When** je regarde le Display
**Then** le montant total (Grand Total) est affiché en bas à droite dans une police très large et contrastée
**And** la devise "Rp" est clairement visible

### AC2: Branding The Breakery
**Given** l'application Display
**When** elle est active
**Then** le logo de The Breakery est affiché élégamment en haut de l'écran
**And** les couleurs respectent la charte graphique de la boulangerie

### AC3: Écran de Veille (Idle State)
**Given** aucune commande n'est en cours (panier vide)
**When** le POS est en attente
**Then** le Display affiche un diaporama d'images de produits promotionnels ou un message d'accueil "Welcome to The Breakery"

## Tasks

- [ ] **Task 1: Composant Totaux**
  - [ ] 1.1: Créer `src/components/display/TotalSummary.tsx`
  - [ ] 1.2: Afficher le sous-total, les taxes et le total final

- [ ] **Task 2: Mode Veille**
  - [ ] 2.1: Implémenter un système de timer pour basculer en mode "Idle" si aucune activité `cart:update` n'est reçue pendant 2 minutes

- [ ] **Task 3: Assets**
  - [ ] 3.1: Intégrer les images haute résolution du catalogue pour le mode veille

## Dev Notes

### UI
- Design épuré, type "Apple Store" ou "Bakery Premium".
- Pas de boutons interactifs (screen is read-only).

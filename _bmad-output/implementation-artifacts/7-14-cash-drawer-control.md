# Story 7.14: Cash Drawer Control

Status: ready-for-dev

## Story

As a **Caissier**,
I want **que le tiroir-caisse s'ouvre automatiquement**,
So that **je peux rendre la monnaie rapidement et sécuriser les fonds**.

## Acceptance Criteria

### AC1: Ouverture sur Paiement Cash
**Given** une transaction validée avec le mode de paiement "Cash"
**When** le ticket s'imprime
**Then** le signal d'ouverture (Pulse) est envoyé au tiroir via l'imprimante
**And** le tiroir s'ouvre physiquement

### AC2: Ouverture Manuelle (Admin)
**Given** un manager authentifié
**When** il clique sur le bouton "Open Drawer" dans les options de session
**Then** le tiroir s'ouvre
**And** l'événement est enregistré dans les logs d'audit avec la raison "Manual Open"

### AC3: Détection d'État (Optionnel)
**Given** un tiroir intelligent
**When** le tiroir reste ouvert plus de 30 secondes
**Then** une alerte sonore ou visuelle est émise pour demander sa fermeture

## Tasks

- [ ] **Task 1: Commande ESC/POS Pulse**
  - [ ] 1.1: Intégrer la commande `ESC p 0 25 250` dans le flux d'impression de reçu

- [ ] **Task 2: Permission de Tiroir**
  - [ ] 2.1: Ajouter la permission `sales.drawer.open` dans le système de rôles
  - [ ] 2.2: Créer le bouton d'ouverture manuelle dans `src/components/pos/HeaderActions.tsx`

- [ ] **Task 3: Logs de Sécurité**
  - [ ] 3.1: Enregistrer chaque ouverture dans `audit_logs` avec l'ID du shift actif

## Dev Notes

### Wiring
- Connexion standard RJ11 via l'imprimante de tickets.
- Vérifier la compatibilité des tensions (12V/24V) du tiroir.

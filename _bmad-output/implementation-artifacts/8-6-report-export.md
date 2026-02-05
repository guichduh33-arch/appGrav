# Story 8.6: Report Export (CSV & PDF)

Status: ready-for-dev

## Story

As a **Manager**,
I want **exporter les rapports au format CSV et PDF**,
So that **je peux les analyser sur Excel ou les envoyer par email**.

## Acceptance Criteria

### AC1: Export CSV
**Given** n'importe quel tableau de rapport
**When** je clique sur "Export CSV"
**Then** un fichier est téléchargé contenant toutes les lignes visibles (et filtrées) au format tabulaire.

### AC2: Génération de PDF Pro
**Given** une vue de rapport
**When** je clique sur "Print PDF"
**Then** un document PDF mis en page avec header/footer et logo The Breakery est généré.

### AC3: Volume de Données
**Given** un export de 5000+ lignes
**When** je lance l'action
**Then** le système gère l'export en tâche de fond avec un indicateur de progression si cela prend plus de 2 secondes.

## Tasks

- [ ] **Task 1: Utilitaire CSV**
  - [ ] 1.1: Créer `src/lib/exportUtils.ts` utilisant `PapaParse` ou une logique simple.

- [ ] **Task 2: Génération PDF**
  - [ ] 2.1: Intégrer `@react-pdf/renderer` ou `jsPDF` pour transformer les visuels React en PDF.

- [ ] **Task 3: Watermark Sécurité**
  - [ ] 3.1: Ajouter le nom de l'utilisateur ayant généré l'export et le timestamp sur chaque page du PDF.

## Dev Notes

### Performance
- Pour les très gros exports, envisager de faire la génération côté serveur via une Edge Function pour ne pas bloquer le thread UI du navigateur.

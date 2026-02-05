# Story 7.5: Mobile App Product Catalog

Status: ready-for-dev

## Story

As a **Serveur**,
I want **parcourir le catalogue de produits sur ma tablette**,
So that **je peux conseiller les clients et créer des commandes rapidement**.

## Acceptance Criteria

### AC1: Navigation par Catégorie Tap-Friendly
**Given** je suis connecté sur l'app mobile
**When** je regarde le catalogue
**Then** je vois des onglets ou une barre latérale pour les catégories
**And** les produits s'affichent sous forme de grille de cartes avec de larges zones de clic

### AC2: Recherche Instantanée
**Given** une tablette en main
**When** je tape dans la barre de recherche
**Then** les produits sont filtrés en temps réel parmi les données cachées localement (Dexie)

### AC3: Affichage des Disponibilités
**Given** un produit en rupture de stock
**When** le stock est à 0 dans le cache local
**Then** l'item s'affiche avec un badge "Out of Stock" et est désactivé pour l'ajout au panier

## Tasks

- [ ] **Task 1: Vue Catalogue Mobile**
  - [ ] 1.1: Créer `src/pages/mobile/CatalogPage.tsx`
  - [ ] 1.2: Implémenter le défilement infini ou la pagination optimisée pour tablette

- [ ] **Task 2: Shared Hooks**
  - [ ] 2.1: Réutiliser `useOfflineData(['products'])` pour assurer la cohérence avec le POS principal

- [ ] **Task 3: Performance Image**
  - [ ] 3.1: Utiliser des vignettes (thumbnails) pour accélérer le chargement sur réseau WiFi instable

## Dev Notes

### Design
- Focus sur la vitesse. Moins de texte, plus d'images et d'icônes.
- Support du mode portrait et paysage.

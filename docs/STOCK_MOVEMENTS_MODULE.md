# Module de Mouvements de Stock et Transferts Internes

## Résumé

Ce module permet de gérer les mouvements de stock entre le dépôt principal (Main Warehouse) et les différentes sections (POS, Production, etc.).

## Fichiers créés

### 1. Migration Database ✅
**Fichier:** `supabase/migrations/038_stock_movements_and_transfers.sql`

**Tables créées:**
- `stock_locations` - Emplacements de stock (Dépôt principal, sections)
- `stock_movements` - Historique de tous les mouvements
- `internal_transfers` - Demandes de transfert interne
- `transfer_items` - Lignes d'articles pour chaque transfert
- `stock_balances` (VIEW) - Stock en temps réel par emplacement

**Fonctionnalités:**
- Génération automatique de numéros de transfert (TR2601-0001)
- Création automatique de mouvements de stock lors de la réception
- Calcul automatique des totaux de transfert
- 4 emplacements par défaut: Main Warehouse, POS, Production, Waste

### 2. Page Mouvements de Stock ✅
**Fichier:** `src/pages/inventory/StockMovementsPage.tsx` + CSS

**Fonctionnalités:**
- Affichage de l'historique complet des mouvements
- Filtres: type, emplacement, dates, recherche
- Statistiques: total mouvements, entrées, sorties, valeur
- Types de mouvements: transfert, ajustement, production, vente, perte, etc.
- Export possible (bouton prévu)

## Fichiers à créer

### 3. Page Transferts Internes
**Fichier à créer:** `src/pages/inventory/InternalTransfersPage.tsx` + CSS

**Fonctionnalités nécessaires:**
- Liste de tous les transferts avec filtres par statut
- Statistiques: transferts en attente, complétés, valeur
- Actions: créer transfert, voir détails, recevoir
- Statuts: brouillon, en attente, en transit, reçu, annulé

### 4. Formulaire de Transfert
**Fichier à créer:** `src/pages/inventory/TransferFormPage.tsx` + CSS

**Fonctionnalités nécessaires:**
- Sélection: origine (dépôt) et destination (section)
- Sélection de produits avec quantités
- Personne responsable (obligatoire)
- Date de transfert
- Notes
- Validation des stocks disponibles
- États: créer brouillon ou envoyer directement

### 5. Page Détails Transfert
**Fichier à créer:** `src/pages/inventory/TransferDetailPage.tsx` + CSS

**Fonctionnalités nécessaires:**
- Affichage complet du transfert
- Liste des articles
- Workflow de réception:
  - Confirmer les quantités reçues
  - Marquer comme reçu
  - Créer automatiquement les mouvements de stock
- Historique des actions

### 6. Page Stock par Emplacement
**Fichier à créer:** `src/pages/inventory/StockByLocationPage.tsx` + CSS

**Fonctionnalités nécessaires:**
- Vue en temps réel du stock de chaque emplacement
- Utilise la vue `stock_balances`
- Filtres par emplacement
- Recherche de produits
- Affichage: Main Warehouse + toutes les sections
- Alertes pour stocks faibles

## Routes à ajouter dans App.tsx

```typescript
// Dans le BackOfficeLayout
<Route path="/inventory/movements" element={<StockMovementsPage />} />
<Route path="/inventory/transfers" element={<InternalTransfersPage />} />
<Route path="/inventory/transfers/new" element={<TransferFormPage />} />
<Route path="/inventory/transfers/:id" element={<TransferDetailPage />} />
<Route path="/inventory/transfers/:id/edit" element={<TransferFormPage />} />
<Route path="/inventory/stock-by-location" element={<StockByLocationPage />} />
```

## Navigation à ajouter

Dans la section **Inventory**, ajouter les liens:
- "Mouvements de Stock" → `/inventory/movements`
- "Transferts Internes" → `/inventory/transfers`
- "Stock par Emplacement" → `/inventory/stock-by-location`

## Workflow type

### Transfert quotidien du dépôt vers POS

1. **Matin**: Responsable POS crée un transfert
   - Origine: Main Warehouse
   - Destination: Section POS
   - Produits: Pain x50, Croissants x30, etc.
   - Responsable: "Marie Dupont"
   - Date: aujourd'hui

2. **Validation**: Transfert enregistré avec statut "pending"

3. **Préparation**: Status passe à "in_transit"

4. **Réception**: Responsable POS confirme réception
   - Vérifie les quantités
   - Marque comme "received"
   - → Mouvements de stock créés automatiquement
   - → Stock Main Warehouse diminué
   - → Stock POS augmenté

5. **Traçabilité**:
   - Historique complet dans Stock Movements
   - Détails du transfert conservés
   - Stock en temps réel visible partout

## Avantages

- ✅ Traçabilité complète de tous les mouvements
- ✅ Stock en temps réel par emplacement
- ✅ Responsabilité claire (qui a pris quoi, quand)
- ✅ Historique d'audit complet
- ✅ Prévention des pertes/vols
- ✅ Optimisation des niveaux de stock par section
- ✅ Rapports possibles sur les consommations par section

## Prochaines étapes

Pour compléter le module, créer les fichiers manquants dans l'ordre:
1. InternalTransfersPage (liste)
2. TransferFormPage (création/édition)
3. TransferDetailPage (détails + réception)
4. StockByLocationPage (vue stock temps réel)
5. Ajouter les routes
6. Ajouter les liens de navigation

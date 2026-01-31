---
stepsCompleted: [1, 2, 3, 4]
status: complete
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - docs/architecture-main.md
  - docs/data-models.md
  - docs/COMBOS_AND_PROMOTIONS.md
  - docs/STOCK_MOVEMENTS_MODULE.md
  - docs/user-guide.md
  - CLAUDE.md
workflowType: 'epics-and-stories'
lastStep: 1
status: 'in-progress'
---

# AppGrav - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for AppGrav, decomposing the requirements from the PRD, UX Design, Architecture, and existing system documentation into implementable stories.

**Scope**: Système ERP/POS complet pour The Breakery incluant:
- Core POS & Ventes
- Gestion Produits, Recettes & Costing
- Inventaire & Stock Management
- Achats & Fournisseurs
- Clients & Fidélité
- Utilisateurs & Permissions
- Paramètres & Configuration
- Module B2B
- Combos & Promotions
- Reports & Analytics
- **MVP Nouvelles Features**: Offline, Customer Display, Mobile Serveurs, LAN

---

## Requirements Inventory

### Functional Requirements

#### Core POS & Ventes (FR-POS)

- **FR-POS-01**: Le Caissier peut ajouter des produits au panier en un tap
- **FR-POS-02**: Le Caissier peut modifier les quantités des produits dans le panier
- **FR-POS-03**: Le Caissier peut supprimer des produits du panier
- **FR-POS-04**: Le Caissier peut appliquer des modifiers/variantes aux produits
- **FR-POS-05**: Le Caissier peut sélectionner un type de commande (dine_in, takeaway, delivery)
- **FR-POS-06**: Le Caissier peut sélectionner une table pour les commandes sur place
- **FR-POS-07**: Le Caissier peut associer un client à la commande
- **FR-POS-08**: Le Caissier peut appliquer une remise globale (pourcentage ou montant)
- **FR-POS-09**: Le Système calcule automatiquement le sous-total, taxes (10% inclus) et total
- **FR-POS-10**: Le Caissier peut finaliser la commande avec différents modes de paiement (espèces, carte, QRIS, split)
- **FR-POS-11**: Le Caissier peut gérer le rendu monnaie pour les paiements espèces
- **FR-POS-12**: Le Système génère automatiquement un numéro de commande unique (SALE-YYYYMMDD-XXX)
- **FR-POS-13**: Le Caissier peut envoyer la commande en cuisine (dispatch par station: barista, kitchen, display)
- **FR-POS-14**: Le Système verrouille les items envoyés en cuisine (PIN manager requis pour modification)
- **FR-POS-15**: Le Caissier peut mettre une commande en attente (held orders)
- **FR-POS-16**: Le Caissier peut reprendre une commande en attente
- **FR-POS-17**: Le Manager peut annuler une commande (avec PIN et raison)
- **FR-POS-18**: Le Manager peut effectuer un remboursement (avec PIN et raison)

#### Kitchen Display System (FR-KDS)

- **FR-KDS-01**: Le Cuisinier peut voir les commandes en attente organisées par station
- **FR-KDS-02**: Le Cuisinier peut voir le temps d'attente de chaque commande
- **FR-KDS-03**: Le Cuisinier peut marquer des items comme "en préparation"
- **FR-KDS-04**: Le Cuisinier peut marquer des items comme "prêt"
- **FR-KDS-05**: Le Cuisinier peut voir la table ou le type de commande d'origine
- **FR-KDS-06**: Le Système affiche les commandes par priorité (temps d'attente)

#### Gestion Produits (FR-PROD)

- **FR-PROD-01**: L'Admin peut créer un nouveau produit (finished, semi_finished, raw_material)
- **FR-PROD-02**: L'Admin peut définir les informations de base (SKU, nom, description, catégorie)
- **FR-PROD-03**: L'Admin peut définir les prix (retail_price, wholesale_price, cost_price)
- **FR-PROD-04**: L'Admin peut uploader une image produit
- **FR-PROD-05**: L'Admin peut définir la station de dispatch (barista, kitchen, display, none)
- **FR-PROD-06**: L'Admin peut activer/désactiver un produit
- **FR-PROD-07**: L'Admin peut définir la visibilité POS
- **FR-PROD-08**: L'Admin peut gérer les catégories (nom, icône, couleur, ordre de tri)
- **FR-PROD-09**: L'Admin peut créer des modifiers/variantes (taille, options, personnalisations)
- **FR-PROD-10**: L'Admin peut définir des ajustements de prix par modifier
- **FR-PROD-11**: L'Admin peut définir des unités de mesure alternatives (UoM)

#### Recettes & Costing (FR-RECIPE)

- **FR-RECIPE-01**: L'Admin peut créer une recette pour un produit fini
- **FR-RECIPE-02**: L'Admin peut définir les ingrédients avec quantités et unités
- **FR-RECIPE-03**: Le Système calcule automatiquement le coût de revient (cost_price)
- **FR-RECIPE-04**: Le Système calcule automatiquement la marge brute
- **FR-RECIPE-05**: L'Admin peut modifier une recette existante
- **FR-RECIPE-06**: Le Système recalcule les coûts lors de modification des prix ingrédients

#### Production (FR-PRODUCTION)

- **FR-PRODUCTION-01**: Le Producteur peut enregistrer une production (lot)
- **FR-PRODUCTION-02**: Le Système génère un numéro de lot (batch_number)
- **FR-PRODUCTION-03**: Le Système décrémente automatiquement le stock des ingrédients
- **FR-PRODUCTION-04**: Le Système incrémente automatiquement le stock du produit fini
- **FR-PRODUCTION-05**: Le Producteur peut annuler une production (avec stock rollback)
- **FR-PRODUCTION-06**: Le Manager peut voir l'historique des productions

#### Inventaire & Stock (FR-STOCK)

- **FR-STOCK-01**: Le Système maintient le stock en temps réel par emplacement
- **FR-STOCK-02**: L'Admin peut définir des emplacements de stock (Main Warehouse, POS, Production, etc.)
- **FR-STOCK-03**: Le Manager peut voir le stock par emplacement
- **FR-STOCK-04**: Le Manager peut créer un ajustement de stock (in/out) avec raison
- **FR-STOCK-05**: Le Système enregistre tous les mouvements de stock avec traçabilité
- **FR-STOCK-06**: Le Manager peut créer un transfert interne entre emplacements
- **FR-STOCK-07**: Le Destinataire peut réceptionner un transfert (avec validation quantités)
- **FR-STOCK-08**: Le Système génère automatiquement les mouvements lors de réception
- **FR-STOCK-09**: Le Manager peut effectuer un inventaire physique (stock opname)
- **FR-STOCK-10**: Le Système compare stock système vs compté et génère les écarts
- **FR-STOCK-11**: Le Manager peut valider l'inventaire (création ajustements automatiques)
- **FR-STOCK-12**: Le Système affiche des alertes pour stock bas (< 10 warning, < 5 critical)
- **FR-STOCK-13**: Le Système empêche les ventes si stock insuffisant

#### Achats & Fournisseurs (FR-PURCHASE)

- **FR-PURCHASE-01**: L'Admin peut créer/modifier/supprimer des fournisseurs
- **FR-PURCHASE-02**: L'Admin peut définir les informations fournisseur (code, nom, contact, conditions paiement)
- **FR-PURCHASE-03**: Le Manager peut créer un bon de commande (PO)
- **FR-PURCHASE-04**: Le Système génère un numéro PO unique (PO-YYYYMM-XXXX)
- **FR-PURCHASE-05**: Le Manager peut ajouter des produits au PO avec quantités et prix
- **FR-PURCHASE-06**: Le Manager peut envoyer le PO au fournisseur (changement statut)
- **FR-PURCHASE-07**: Le Réceptionnaire peut enregistrer une réception partielle ou totale
- **FR-PURCHASE-08**: Le Système met à jour le stock automatiquement lors de réception
- **FR-PURCHASE-09**: Le Manager peut enregistrer un retour fournisseur avec raison
- **FR-PURCHASE-10**: Le Manager peut voir l'historique des actions sur un PO
- **FR-PURCHASE-11**: Le Système calcule la valeur totale du PO

#### Clients & Fidélité (FR-CUSTOMER)

- **FR-CUSTOMER-01**: L'Admin peut créer/modifier un profil client
- **FR-CUSTOMER-02**: L'Admin peut définir le type client (retail, wholesale)
- **FR-CUSTOMER-03**: L'Admin peut assigner une catégorie de prix (retail, wholesale, discount_percentage, custom)
- **FR-CUSTOMER-04**: Le Système applique automatiquement le prix selon la catégorie client
- **FR-CUSTOMER-05**: Le Système gère les points de fidélité (1 point = 1000 IDR)
- **FR-CUSTOMER-06**: Le Système détermine automatiquement le tier fidélité (Bronze, Silver, Gold, Platinum)
- **FR-CUSTOMER-07**: Le Système applique la remise fidélité selon le tier (0%, 5%, 8%, 10%)
- **FR-CUSTOMER-08**: Le Client peut consulter son solde de points
- **FR-CUSTOMER-09**: Le Client peut utiliser ses points comme paiement partiel
- **FR-CUSTOMER-10**: Le Système enregistre l'historique des transactions de points

#### Module B2B (FR-B2B)

- **FR-B2B-01**: Le Manager peut créer une commande B2B (wholesale)
- **FR-B2B-02**: Le Système applique automatiquement les prix wholesale
- **FR-B2B-03**: Le Manager peut définir des conditions de paiement (comptant, crédit)
- **FR-B2B-04**: Le Manager peut enregistrer des paiements partiels
- **FR-B2B-05**: Le Système track le statut de paiement (paid, partial, unpaid)
- **FR-B2B-06**: Le Manager peut voir les créances clients B2B

#### Combos & Promotions (FR-PROMO)

- **FR-PROMO-01**: L'Admin peut créer un combo (offre groupée) avec prix fixe
- **FR-PROMO-02**: L'Admin peut définir des groupes de choix dans un combo (min/max selections)
- **FR-PROMO-03**: L'Admin peut définir des ajustements de prix par item dans un groupe
- **FR-PROMO-04**: Le Système calcule automatiquement l'économie vs prix normal
- **FR-PROMO-05**: L'Admin peut créer une promotion (pourcentage, montant fixe, buy X get Y, produit offert)
- **FR-PROMO-06**: L'Admin peut définir des contraintes temporelles (dates, jours, heures)
- **FR-PROMO-07**: L'Admin peut définir des conditions d'achat (montant min, quantité min)
- **FR-PROMO-08**: L'Admin peut définir des limites d'utilisation (totale, par client)
- **FR-PROMO-09**: Le Système applique automatiquement les promotions éligibles au panier
- **FR-PROMO-10**: Le Système enregistre l'utilisation des promotions

#### Utilisateurs & Permissions (FR-USER)

- **FR-USER-01**: L'Admin peut créer/modifier des utilisateurs
- **FR-USER-02**: L'Admin peut assigner des rôles aux utilisateurs
- **FR-USER-03**: L'Admin peut définir un PIN par utilisateur (4-6 chiffres)
- **FR-USER-04**: Le Système authentifie par PIN (edge function)
- **FR-USER-05**: L'Admin peut gérer les permissions par rôle
- **FR-USER-06**: L'Admin peut accorder/révoquer des permissions individuelles
- **FR-USER-07**: Le Système vérifie les permissions avant chaque action sensible
- **FR-USER-08**: Le Système enregistre un audit log de toutes les actions

#### Sessions POS (FR-SHIFT)

- **FR-SHIFT-01**: Le Caissier peut ouvrir une session de caisse
- **FR-SHIFT-02**: Le Caissier doit saisir le fond de caisse à l'ouverture
- **FR-SHIFT-03**: Le Système génère un numéro de session unique
- **FR-SHIFT-04**: Le Caissier peut clôturer sa session
- **FR-SHIFT-05**: Le Caissier doit saisir les montants réels (espèces, carte, QRIS)
- **FR-SHIFT-06**: Le Système calcule automatiquement les écarts
- **FR-SHIFT-07**: Le Manager peut voir l'historique des sessions

#### Paramètres (FR-SETTINGS)

- **FR-SETTINGS-01**: L'Admin peut configurer les informations de l'établissement
- **FR-SETTINGS-02**: L'Admin peut configurer les taux de taxe
- **FR-SETTINGS-03**: L'Admin peut configurer les méthodes de paiement
- **FR-SETTINGS-04**: L'Admin peut configurer les horaires d'ouverture
- **FR-SETTINGS-05**: L'Admin peut configurer les imprimantes (tickets, cuisine)
- **FR-SETTINGS-06**: L'Admin peut configurer les templates de reçus
- **FR-SETTINGS-07**: L'Utilisateur peut changer sa langue (FR, EN, ID)
- **FR-SETTINGS-08**: Le Système enregistre l'historique des modifications

#### Mode Offline & Synchronisation - MVP (FR-OFFLINE)

- **FR-OFFLINE-01 (=FR1)**: Le Caissier peut continuer à prendre des commandes lorsque internet est coupé
- **FR-OFFLINE-02 (=FR2)**: Le Système peut stocker les transactions localement pendant une période offline
- **FR-OFFLINE-03 (=FR3)**: Le Système peut synchroniser automatiquement les transactions offline quand internet revient
- **FR-OFFLINE-04 (=FR4)**: Le Caissier peut voir un indicateur du statut de connexion (online/offline)
- **FR-OFFLINE-05 (=FR5)**: Le Manager peut voir le nombre de transactions en attente de synchronisation
- **FR-OFFLINE-06 (=FR6)**: Le Système peut maintenir l'intégrité des données lors de la synchronisation

#### Customer Display - MVP (FR-DISPLAY)

- **FR-DISPLAY-01 (=FR7)**: Le Client peut voir les articles ajoutés à sa commande en temps réel
- **FR-DISPLAY-02 (=FR8)**: Le Client peut voir le prix de chaque article ajouté
- **FR-DISPLAY-03 (=FR9)**: Le Client peut voir le total de sa commande mis à jour dynamiquement
- **FR-DISPLAY-04 (=FR10)**: Le Customer Display peut recevoir les mises à jour depuis le POS via le réseau local

#### Application Mobile Serveurs - MVP (FR-MOBILE)

- **FR-MOBILE-01 (=FR11)**: Le Serveur peut se connecter à l'application mobile avec ses identifiants
- **FR-MOBILE-02 (=FR12)**: Le Serveur peut parcourir le catalogue de produits sur l'application mobile
- **FR-MOBILE-03 (=FR13)**: Le Serveur peut sélectionner une table pour la commande
- **FR-MOBILE-04 (=FR14)**: Le Serveur peut ajouter des produits à une commande
- **FR-MOBILE-05 (=FR15)**: Le Serveur peut appliquer des modifiers aux produits
- **FR-MOBILE-06 (=FR16)**: Le Serveur peut envoyer la commande directement au KDS depuis l'application mobile
- **FR-MOBILE-07 (=FR17)**: Le Serveur peut voir le statut de ses commandes envoyées

#### Communication Réseau Local (LAN) - MVP (FR-LAN)

- **FR-LAN-01 (=FR18)**: Les appareils (POS, Mobile, KDS, Display) peuvent communiquer via le réseau local câblé
- **FR-LAN-02 (=FR19)**: Le Système peut fonctionner en mode LAN-only quand internet est coupé
- **FR-LAN-03 (=FR20)**: Les commandes peuvent être transmises entre appareils sans dépendre d'internet

#### KDS Améliorations - MVP (FR-KDS-MVP)

- **FR-KDS-MVP-01 (=FR21)**: Le Cuisinier peut recevoir des commandes provenant de l'application mobile serveurs
- **FR-KDS-MVP-02 (=FR22)**: Le Cuisinier peut voir la table d'origine pour chaque commande
- **FR-KDS-MVP-03 (=FR23)**: Le Cuisinier peut marquer une commande comme "Prête"
- **FR-KDS-MVP-04 (=FR24)**: Le Serveur peut être notifié quand sa commande est prête (via l'app mobile)

#### Supervision & Monitoring - MVP (FR-MONITOR)

- **FR-MONITOR-01 (=FR25)**: Le Manager peut voir le statut de synchronisation du système
- **FR-MONITOR-02 (=FR26)**: Le Manager peut recevoir des alertes lors de coupures internet
- **FR-MONITOR-03 (=FR27)**: Le Manager peut voir un rapport des transactions synchronisées après une période offline
- **FR-MONITOR-04 (=FR28)**: Le Manager peut voir l'historique des périodes offline

#### Reports & Analytics (FR-REPORTS)

- **FR-REPORTS-01 (=FR29)**: Le Système peut afficher un Date Range Picker permettant de sélectionner des périodes personnalisées
- **FR-REPORTS-02 (=FR30)**: Le Système peut appliquer des filtres avancés sur les rapports
- **FR-REPORTS-03 (=FR31)**: Le Système peut permettre le drill-down depuis une vue agrégée vers les détails
- **FR-REPORTS-04 (=FR32)**: Le Système peut exporter les rapports en format CSV
- **FR-REPORTS-05 (=FR33)**: Le Système peut exporter les rapports en format PDF
- **FR-REPORTS-06 (=FR34)**: Le Système peut restreindre l'accès aux rapports selon les permissions
- **FR-REPORTS-07 (=FR35)**: Le Manager peut voir un rapport Profit/Loss
- **FR-REPORTS-08 (=FR36)**: Le Manager peut voir un rapport Sales by Customer
- **FR-REPORTS-09 (=FR37)**: Le Manager peut voir un rapport Sales by Hour
- **FR-REPORTS-10 (=FR38)**: Le Manager peut voir un rapport Cancellations
- **FR-REPORTS-11 (=FR39)**: Le Manager peut comparer deux périodes sur les rapports
- **FR-REPORTS-12 (=FR40)**: Le Cuisinier peut voir un rapport Stock Balance
- **FR-REPORTS-13 (=FR41)**: Le Cuisinier peut voir un rapport Stock Warning
- **FR-REPORTS-14 (=FR42)**: Le Cuisinier peut voir un rapport Expired Stock
- **FR-REPORTS-15 (=FR43)**: Le Manager peut voir un rapport Unsold Products
- **FR-REPORTS-16 (=FR44)**: La Comptable peut voir un rapport Cash Balance
- **FR-REPORTS-17 (=FR45)**: La Comptable peut voir un rapport Receivables
- **FR-REPORTS-18 (=FR46)**: La Comptable peut voir un rapport Expenses
- **FR-REPORTS-19 (=FR47)**: La Comptable peut voir le détail des taxes collectées
- **FR-REPORTS-20 (=FR48)**: Le Manager peut voir un rapport Purchase Returns
- **FR-REPORTS-21 (=FR49)**: Le Manager peut voir un rapport Outstanding Payments
- **FR-REPORTS-22 (=FR50)**: Le Manager peut voir un rapport Price Changes
- **FR-REPORTS-23 (=FR51)**: Le Manager peut voir un rapport Deleted Products
- **FR-REPORTS-24 (=FR52)**: Le Système enregistre toutes les actions dans un audit trail
- **FR-REPORTS-25 (=FR53)**: Le Système génère des alertes automatiques pour les anomalies
- **FR-REPORTS-26 (=FR54)**: Le Manager peut configurer les seuils d'alerte
- **FR-REPORTS-27 (=FR55)**: Le Manager peut voir un tableau de bord des alertes
- **FR-REPORTS-28 (=FR56)**: Le Manager peut marquer une alerte comme résolue

---

### Non-Functional Requirements

#### Performance (NFR-PERF)

- **NFR-PERF-01**: Latence Customer Display < 500ms en LAN
- **NFR-PERF-02**: Temps de synchronisation < 30 secondes pour 50 transactions
- **NFR-PERF-03**: Temps de réponse app mobile < 200ms
- **NFR-PERF-04**: Temps d'envoi commande au KDS < 1 seconde
- **NFR-PERF-05**: Démarrage app mobile < 3 secondes
- **NFR-PERF-06**: Chargement rapport < 2 secondes pour 30 jours
- **NFR-PERF-07**: Drill-down < 500ms
- **NFR-PERF-08**: Export CSV < 5 secondes pour 10,000 lignes
- **NFR-PERF-09**: Export PDF < 10 secondes
- **NFR-PERF-10**: Filtrage temps réel < 300ms

#### Reliability (NFR-REL)

- **NFR-REL-01**: Durée mode offline 2 heures minimum
- **NFR-REL-02**: Zéro perte de transaction offline
- **NFR-REL-03**: Zéro perte de transaction en cas de crash app
- **NFR-REL-04**: Capacité stockage offline 500 transactions minimum
- **NFR-REL-05**: Taux de succès synchronisation 99.9%
- **NFR-REL-06**: Rapports offline disponibles sur 7 derniers jours

#### Availability (NFR-AVAIL)

- **NFR-AVAIL-01**: Uptime système POS 99.5% (hors maintenance)
- **NFR-AVAIL-02**: Basculement offline transparent < 2 secondes
- **NFR-AVAIL-03**: Communication LAN indépendante d'internet

#### Security (NFR-SEC)

- **NFR-SEC-01**: Authentification PIN 4-6 chiffres par utilisateur
- **NFR-SEC-02**: Expiration session après 30 minutes d'inactivité
- **NFR-SEC-03**: Stockage local sécurisé (IndexedDB encapsulé)
- **NFR-SEC-04**: Transmission LAN sécurisée (HTTPS/WSS ou réseau isolé)
- **NFR-SEC-05**: Audit trail 100% des transactions loguées
- **NFR-SEC-06**: Contrôle d'accès par catégorie de rapport
- **NFR-SEC-07**: Filigrane sur exports PDF (nom utilisateur + date)
- **NFR-SEC-08**: PIN hash stocké (bcrypt), jamais en clair
- **NFR-SEC-09**: RLS (Row Level Security) sur toutes les tables

#### Usability (NFR-USE)

- **NFR-USE-01**: Lisibilité prix 24px minimum, articles 18px minimum
- **NFR-USE-02**: Zones tactiles 44x44px minimum
- **NFR-USE-03**: Feedback visuel < 100ms après interaction
- **NFR-USE-04**: Indicateur statut réseau toujours visible
- **NFR-USE-05**: Visualisations: Bar, Line, Pie, Table minimum
- **NFR-USE-06**: Rapports consultables sur tablette/mobile
- **NFR-USE-07**: Graphiques lisibles pour daltoniens

#### Maintainability (NFR-MAIN)

- **NFR-MAIN-01**: Distribution mobile APK/IPA direct (pas de store)
- **NFR-MAIN-02**: Mise à jour manuelle via download APK/IPA
- **NFR-MAIN-03**: Logs diagnostic: erreurs + warnings + actions critiques
- **NFR-MAIN-04**: Fichiers max 300 lignes

#### Compatibility (NFR-COMPAT)

- **NFR-COMPAT-01**: Navigateur POS/KDS/Display: Chrome 100+ uniquement
- **NFR-COMPAT-02**: App Mobile iOS: iOS 14+ via Capacitor
- **NFR-COMPAT-03**: App Mobile Android: Android 8+ (API 26+) via Capacitor
- **NFR-COMPAT-04**: Réseau local: Ethernet 100Mbps minimum

#### Internationalization (NFR-I18N)

- **NFR-I18N-01**: Support 3 langues: Français (défaut), English, Indonesian
- **NFR-I18N-02**: Toute nouvelle feature doit avoir traductions dans les 3 locales
- **NFR-I18N-03**: Devise IDR, arrondi au 100 le plus proche

#### Business Rules (NFR-BIZ)

- **NFR-BIZ-01**: Taxe 10% incluse dans les prix (tax = total × 10/110)
- **NFR-BIZ-02**: Fidélité: 1 point = 1,000 IDR dépensés
- **NFR-BIZ-03**: Tiers fidélité: Bronze 0%, Silver 500pts 5%, Gold 2000pts 8%, Platinum 5000pts 10%
- **NFR-BIZ-04**: Alertes stock: < 10 warning, < 5 critical
- **NFR-BIZ-05**: Types de commande: dine_in, takeaway, delivery, b2b

---

### Additional Requirements

#### From Architecture (9 ADRs)

- **ARCH-ADR-001**: Entités synchronisées offline définies (products, categories, customers, orders, etc.)
- **ARCH-ADR-002**: Stratégie de synchronisation Last-Write-Wins + Audit Trail
- **ARCH-ADR-003**: Politique de cache (refresh at startup + hourly, 30-day purge)
- **ARCH-ADR-004**: PIN verification offline (bcrypt compare, 24h expiration)
- **ARCH-ADR-005**: Permissions offline (cached role_permissions)
- **ARCH-ADR-006**: Socket.IO LAN architecture (POS = hub on port 3001)
- **ARCH-ADR-007**: Socket.IO events protocol (`{entity}:{action}` naming)
- **ARCH-ADR-008**: LAN discovery (fixed IP + QR fallback)
- **ARCH-ADR-009**: Failover strategy (each device independent, no auto-promotion)

#### Stack Additions (MVP)

- **STACK-01**: Dexie.js + dexie-react-hooks pour IndexedDB
- **STACK-02**: vite-plugin-pwa + workbox pour Service Worker
- **STACK-03**: Socket.IO pour communication LAN temps réel
- **STACK-04**: @capacitor/network pour détection réseau
- **STACK-05**: @capawesome/capacitor-background-task pour sync background

#### Pattern Requirements (Architecture)

- **PATTERN-01**: Tables Dexie préfixées `offline_`
- **PATTERN-02**: Events Socket.IO nommés `{entity}:{action}`
- **PATTERN-03**: Services offline dans `src/services/offline/`
- **PATTERN-04**: Services LAN dans `src/services/lan/`
- **PATTERN-05**: Hooks offline dans `src/hooks/offline/`
- **PATTERN-06**: Types: `I{Name}` pour interfaces, `T{Name}` pour types
- **PATTERN-07**: Fichiers max 300 lignes
- **PATTERN-08**: Wrapper standard `ISocketEvent<T>` pour events
- **PATTERN-09**: Structure standard `ISyncQueueItem` pour sync queue

#### From UX Design

- **UX-01**: Design System Tailwind CSS + shadcn/ui
- **UX-02**: Touch targets 48x48px POS/Mobile, 44x44px back-office
- **UX-03**: Feedback toasts discrets, jamais accusateurs
- **UX-04**: Indicateur offline: icône wifi grise (pas rouge)
- **UX-05**: Layout POS: 60% produits, 40% panier
- **UX-06**: Layout Mobile: 2 colonnes, bottom bar fixe
- **UX-07**: Layout Customer Display: logo, items animés, total géant
- **UX-08**: Layout KDS: colonnes par commande, timer, bouton "Prêt"
- **UX-09**: Breakpoints: Mobile < 640px, Tablet 640-1024px, Desktop > 1024px
- **UX-10**: Principes: POS sacré, information proactive, offline = normal

---

### FR Coverage Map

| FR Range | Epic | Description |
|----------|------|-------------|
| FR-USER-01 à FR-USER-08 | Epic 1 | Authentification & Permissions |
| FR-SETTINGS-01 à FR-SETTINGS-08 | Epic 1 | Configuration Système |
| FR-PROD-01 à FR-PROD-11 | Epic 2 | Gestion Produits |
| FR-RECIPE-01 à FR-RECIPE-06 | Epic 2 | Recettes & Costing |
| FR-PRODUCTION-01 à FR-PRODUCTION-06 | Epic 2 | Production |
| FR-POS-01 à FR-POS-18 | Epic 3 | Core POS |
| FR-SHIFT-01 à FR-SHIFT-07 | Epic 3 | Sessions Caisse |
| FR-OFFLINE-01 à FR-OFFLINE-06 | Epic 3 | Mode Offline |
| FR-KDS-01 à FR-KDS-06 | Epic 4 | Kitchen Display |
| FR-KDS-MVP-01 à FR-KDS-MVP-04 | Epic 4 | KDS Améliorations |
| FR-STOCK-01 à FR-STOCK-13 | Epic 5 | Inventaire & Stock |
| FR-PURCHASE-01 à FR-PURCHASE-11 | Epic 5 | Achats & Fournisseurs |
| FR-CUSTOMER-01 à FR-CUSTOMER-10 | Epic 6 | Clients & Fidélité |
| FR-B2B-01 à FR-B2B-06 | Epic 6 | Module B2B |
| FR-PROMO-01 à FR-PROMO-10 | Epic 6 | Combos & Promotions |
| FR-DISPLAY-01 à FR-DISPLAY-04 | Epic 7 | Customer Display |
| FR-MOBILE-01 à FR-MOBILE-07 | Epic 7 | App Mobile Serveurs |
| FR-LAN-01 à FR-LAN-03 | Epic 7 | Communication LAN |
| FR-MONITOR-01 à FR-MONITOR-04 | Epic 7 | Supervision & Monitoring |
| FR-REPORTS-01 à FR-REPORTS-28 | Epic 8 | Reports & Analytics |

---

## Epic List

### Epic 1: Core System — Authentification, Permissions & Configuration

Les utilisateurs peuvent se connecter par PIN (online/offline), le système contrôle les accès selon les rôles, et les admins peuvent configurer le système.

**FRs couverts:** FR-USER-01 à FR-USER-08, FR-SETTINGS-01 à FR-SETTINGS-08, FR-OFFLINE-04

**Offline Integration:** PIN hash caché localement (ADR-004), permissions cached (ADR-005)

#### Story 1.1: Offline PIN Cache Setup

**As a** Système,
**I want** stocker les PIN hash des utilisateurs dans IndexedDB,
**So that** les utilisateurs peuvent s'authentifier même sans internet.

**Acceptance Criteria:**

**Given** l'application démarre avec internet
**When** un utilisateur se connecte avec succès
**Then** son `pin_hash` et `permissions` sont cachés dans Dexie table `offline_users`
**And** les données sont chiffrées au repos (IndexedDB encapsulé)

**Given** le cache offline_users existe
**When** 24h se sont écoulées depuis le dernier login online
**Then** le cache est invalidé et force une reconnexion online

#### Story 1.2: Offline PIN Authentication

**As a** Caissier,
**I want** me connecter avec mon PIN même sans internet,
**So that** je peux continuer à travailler lors des coupures.

**Acceptance Criteria:**

**Given** internet est coupé ET le PIN de l'utilisateur est en cache
**When** l'utilisateur saisit son PIN
**Then** le système vérifie avec bcrypt compare côté client
**And** si valide, la session est créée localement

**Given** le PIN saisi est incorrect
**When** l'utilisateur tente de se connecter offline
**Then** un message d'erreur s'affiche sans révéler si le PIN existe
**And** après 3 tentatives, un délai de 30 secondes est imposé

#### Story 1.3: Offline Permissions Cache

**As a** Système,
**I want** cacher les permissions utilisateur localement,
**So that** les contrôles d'accès fonctionnent offline.

**Acceptance Criteria:**

**Given** un utilisateur se connecte online
**When** l'authentification réussit
**Then** ses `role_permissions` sont stockées dans Dexie
**And** la fonction `hasPermissionOffline(code)` est disponible

**Given** l'application est offline
**When** une action nécessite une permission
**Then** le système vérifie contre le cache local
**And** les actions sensibles (void, refund) requièrent toujours un PIN manager

#### Story 1.4: Network Status Indicator

**As a** Caissier,
**I want** voir un indicateur discret du statut réseau,
**So that** je sais si je suis online ou offline sans stress.

**Acceptance Criteria:**

**Given** l'application est online
**When** je regarde le header
**Then** je vois une icône wifi verte/bleue discrète

**Given** internet est coupé
**When** la connexion est perdue
**Then** l'icône devient grise (pas rouge, pas alarmant)
**And** aucune popup ne s'affiche
**And** la transition est < 2 secondes

#### Story 1.5: Settings Offline Cache

**As a** Système,
**I want** cacher les paramètres système localement,
**So that** la configuration est disponible offline.

**Acceptance Criteria:**

**Given** l'application démarre avec internet
**When** les settings sont chargés
**Then** ils sont stockés dans Dexie table `offline_settings`

**Given** l'application est offline
**When** un composant demande un setting
**Then** la valeur est retournée depuis le cache local

---

### Epic 2: Catalogue & Costing — Produits, Recettes & Production

Les admins peuvent créer des produits avec catégories, variantes, recettes et calculer les coûts. Les producteurs peuvent enregistrer des lots de production.

**FRs couverts:** FR-PROD-01 à FR-PROD-11, FR-RECIPE-01 à FR-RECIPE-06, FR-PRODUCTION-01 à FR-PRODUCTION-06

**Offline Integration:** Catalogue produits cached en read-only (ADR-001)

#### Story 2.1: Products Offline Cache

**As a** Caissier,
**I want** avoir accès au catalogue produits même offline,
**So that** je peux continuer à créer des commandes lors de coupures internet.

**Acceptance Criteria:**

**Given** l'application démarre avec internet
**When** les produits sont chargés depuis Supabase
**Then** ils sont stockés dans Dexie table `offline_products`
**And** les champs incluent: id, sku, name, retail_price, category_id, type, is_active, pos_visible

**Given** l'application est offline
**When** le POS affiche les produits
**Then** les données viennent du cache local
**And** les produits inactifs (`is_active: false`) sont filtrés

#### Story 2.2: Categories Offline Cache

**As a** Caissier,
**I want** voir les catégories de produits même offline,
**So that** la navigation par catégorie fonctionne sans internet.

**Acceptance Criteria:**

**Given** l'application charge les catégories online
**When** les données sont reçues
**Then** elles sont stockées dans Dexie table `offline_categories`
**And** l'ordre de tri (`sort_order`) est préservé

**Given** l'application est offline
**When** je navigue dans le POS
**Then** les catégories s'affichent avec leurs icônes et couleurs
**And** la station de dispatch est incluse pour le routing KDS

#### Story 2.3: Product Modifiers Offline Cache

**As a** Caissier,
**I want** appliquer des modifiers aux produits même offline,
**So that** les personnalisations (taille, options) fonctionnent toujours.

**Acceptance Criteria:**

**Given** les modifiers sont chargés online
**When** les données sont synchronisées
**Then** ils sont stockés dans Dexie table `offline_modifiers`
**And** les relations product_id sont préservées

**Given** j'ajoute un produit au panier offline
**When** je choisis un modifier
**Then** le prix s'ajuste correctement (`price_adjustment`)
**And** le modifier apparaît sur le ticket

#### Story 2.4: Recipes Read-Only Cache (Costing Display)

**As a** Manager,
**I want** consulter les coûts produits même offline,
**So that** je peux vérifier les marges sans internet.

**Acceptance Criteria:**

**Given** les recettes sont chargées online
**When** les données sont synchronisées
**Then** les champs `cost_price` et `margin` des produits sont inclus dans le cache
**And** la table `offline_products` inclut les champs de costing

**Given** je consulte un produit offline
**When** j'ouvre les détails
**Then** je vois le cost_price et la marge calculée
**And** la liste des ingrédients est visible (read-only)

#### Story 2.5: Production Records (Online-Only with Deferred Sync)

**As a** Producteur,
**I want** enregistrer une production même si internet est lent,
**So that** mon travail n'est pas bloqué par des problèmes réseau.

**Acceptance Criteria:**

**Given** j'enregistre une production online
**When** l'API répond avec succès
**Then** le stock est mis à jour en temps réel
**And** le batch_number est généré par le serveur

**Given** l'application est offline
**When** je tente d'enregistrer une production
**Then** un message indique "Production requires online mode"
**And** je peux ajouter une note/rappel pour plus tard

---

### Epic 3: POS & Ventes — Commandes, Encaissement & Sessions

Les caissiers peuvent prendre des commandes, appliquer des remises, encaisser et gérer leurs sessions de caisse — même sans internet.

**FRs couverts:** FR-POS-01 à FR-POS-18, FR-SHIFT-01 à FR-SHIFT-07, FR-OFFLINE-01 à FR-OFFLINE-03, FR-OFFLINE-05 à FR-OFFLINE-06

**Offline Integration:** Orders en read-write sync (ADR-001), sync queue (ADR-002), Dexie schemas

#### Story 3.1: Dexie Schema for Orders & Sync Queue

**As a** Système,
**I want** une structure IndexedDB pour les commandes et la sync queue,
**So that** les transactions peuvent être stockées et synchronisées.

**Acceptance Criteria:**

**Given** l'application s'initialise
**When** Dexie est configuré
**Then** les tables `offline_orders`, `offline_order_items`, `sync_queue` sont créées
**And** `sync_queue` suit le format `ISyncQueueItem` (entity, action, payload, created_at, attempts)

**Given** une commande est créée offline
**When** elle est sauvegardée
**Then** un UUID local est généré (préfixé `LOCAL-`)
**And** une entrée est ajoutée à `sync_queue` avec action `create`

#### Story 3.2: Cart Persistence Offline

**As a** Caissier,
**I want** que mon panier persiste même si l'app se ferme,
**So that** je ne perds pas une commande en cours lors d'un crash.

**Acceptance Criteria:**

**Given** j'ajoute des items au panier
**When** le panier change
**Then** il est sauvegardé dans `localStorage` ou Dexie `offline_cart`

**Given** l'app redémarre
**When** le POS s'ouvre
**Then** le panier est restauré avec tous les items et modifiers
**And** les items locked restent locked

#### Story 3.3: Offline Order Creation

**As a** Caissier,
**I want** créer une commande même sans internet,
**So that** les clients n'attendent pas.

**Acceptance Criteria:**

**Given** l'application est offline
**When** je finalise une commande
**Then** elle est sauvegardée dans Dexie `offline_orders`
**And** le numéro de commande est généré localement (OFFLINE-YYYYMMDD-XXX)
**And** le statut est `pending_sync`

**Given** la commande est créée offline
**When** je consulte l'historique
**Then** je vois l'indicateur "En attente de sync" (icône cloud)

#### Story 3.4: Offline Payment Processing

**As a** Caissier,
**I want** enregistrer les paiements même offline,
**So that** je peux encaisser normalement.

**Acceptance Criteria:**

**Given** je suis offline avec une commande à payer
**When** je sélectionne un mode de paiement (cash, card, QRIS)
**Then** le paiement est enregistré localement
**And** le rendu monnaie est calculé pour cash

**Given** le paiement est split (partiel cash + card)
**When** je finalise
**Then** tous les paiements sont stockés dans `offline_payments`
**And** liés à la commande par `order_id`

#### Story 3.5: POS Session Management Offline

**As a** Caissier,
**I want** ouvrir et fermer ma session de caisse offline,
**So that** le système reste utilisable pendant les coupures.

**Acceptance Criteria:**

**Given** je suis offline
**When** j'ouvre une session avec mon fond de caisse
**Then** la session est créée localement dans Dexie `offline_sessions`
**And** un ID local est généré

**Given** je ferme ma session offline
**When** je saisis les montants réels
**Then** les écarts sont calculés localement
**And** la session est marquée `pending_sync`

#### Story 3.6: Sync Queue Processing

**As a** Système,
**I want** synchroniser automatiquement les transactions quand internet revient,
**So that** les données sont cohérentes avec le serveur.

**Acceptance Criteria:**

**Given** internet revient après une période offline
**When** la connexion est détectée
**Then** la sync queue est traitée en FIFO (First In, First Out)
**And** chaque item est envoyé à Supabase

**Given** une transaction sync avec succès
**When** le serveur répond OK
**Then** l'item est supprimé de la queue
**And** l'ID local est remplacé par l'ID serveur

**Given** une transaction échoue
**When** le serveur retourne une erreur
**Then** le compteur `attempts` est incrémenté
**And** après 3 échecs, l'item est marqué `failed` avec le message d'erreur

#### Story 3.7: Kitchen Dispatch via LAN (Offline)

**As a** Caissier,
**I want** envoyer les commandes en cuisine même sans internet,
**So that** la production continue normalement.

**Acceptance Criteria:**

**Given** l'application est offline mais le LAN fonctionne
**When** j'envoie une commande au KDS
**Then** elle est transmise via Socket.IO sur le réseau local
**And** le KDS reçoit la commande en < 1 seconde

**Given** le KDS n'est pas atteignable (LAN down)
**When** j'envoie la commande
**Then** elle est marquée `dispatch_pending`
**And** sera envoyée automatiquement quand le LAN revient

#### Story 3.8: Pending Sync Counter Display

**As a** Manager,
**I want** voir combien de transactions attendent la sync,
**So that** je peux surveiller le système.

**Acceptance Criteria:**

**Given** des transactions sont en attente de sync
**When** je regarde le header/dashboard
**Then** je vois un compteur (ex: "5 pending")

**Given** je clique sur le compteur
**When** le panel s'ouvre
**Then** je vois la liste des transactions en attente
**And** leur statut (pending, syncing, failed)

---

### Epic 4: Cuisine & Dispatch — Kitchen Display System

Les cuisiniers reçoivent les commandes (POS et Mobile), voient les priorités et marquent les items comme prêts.

**FRs couverts:** FR-KDS-01 à FR-KDS-06, FR-KDS-MVP-01 à FR-KDS-MVP-04

**Offline Integration:** Communication LAN via Socket.IO (ADR-006)

#### Story 4.1: Socket.IO Server on POS (LAN Hub)

**As a** Système,
**I want** que le POS serve de hub Socket.IO sur le LAN,
**So that** les autres appareils peuvent communiquer sans internet.

**Acceptance Criteria:**

**Given** le POS démarre
**When** l'application s'initialise
**Then** un serveur Socket.IO écoute sur le port 3001
**And** les connexions LAN sont acceptées

**Given** un appareil se connecte (KDS, Mobile, Display)
**When** la connexion Socket.IO est établie
**Then** l'appareil est enregistré avec son type et son ID
**And** les events peuvent être échangés bidirectionnellement

#### Story 4.2: KDS Socket.IO Client Connection

**As a** KDS,
**I want** me connecter au POS via Socket.IO LAN,
**So that** je reçois les commandes même sans internet.

**Acceptance Criteria:**

**Given** le KDS démarre
**When** il détecte le réseau local
**Then** il se connecte au POS sur `ws://{POS_IP}:3001`
**And** l'IP est configurée ou découverte via QR code (ADR-008)

**Given** la connexion est établie
**When** le KDS s'identifie
**Then** il envoie `device:register` avec type="kds" et station="kitchen|barista"

#### Story 4.3: Order Dispatch to KDS via LAN

**As a** Cuisinier,
**I want** recevoir les commandes du POS via le réseau local,
**So that** je peux travailler même sans internet.

**Acceptance Criteria:**

**Given** le POS envoie une commande en cuisine
**When** l'event `order:dispatch` est émis
**Then** le KDS reçoit les items filtrés par sa station
**And** la commande s'affiche en < 1 seconde (NFR-PERF-04)

**Given** la commande a plusieurs stations
**When** elle est dispatchée
**Then** chaque KDS reçoit uniquement ses items (barista, kitchen, display)

#### Story 4.4: KDS Order Queue Display

**As a** Cuisinier,
**I want** voir les commandes organisées par priorité,
**So that** je traite les plus urgentes en premier.

**Acceptance Criteria:**

**Given** plusieurs commandes sont en attente
**When** je regarde l'écran KDS
**Then** elles sont triées par temps d'attente (plus ancien en premier)
**And** un timer affiche le temps écoulé pour chaque commande

**Given** une commande dépasse 10 minutes
**When** le timer atteint le seuil
**Then** la carte devient rouge/urgente visuellement

#### Story 4.5: KDS Item Status Update

**As a** Cuisinier,
**I want** marquer les items comme "en préparation" puis "prêt",
**So that** le POS et les serveurs connaissent l'avancement.

**Acceptance Criteria:**

**Given** je vois un item à préparer
**When** je le tape
**Then** il passe en statut "en préparation" (couleur jaune)
**And** l'event `item:preparing` est envoyé au POS

**Given** l'item est prêt
**When** je tape le bouton "Prêt"
**Then** il passe en statut "ready" (couleur verte)
**And** l'event `item:ready` est envoyé au POS

#### Story 4.6: Order Completion & Auto-Remove

**As a** Cuisinier,
**I want** que la commande disparaisse quand tous les items sont prêts,
**So that** l'écran reste propre.

**Acceptance Criteria:**

**Given** tous les items d'une commande sont marqués "prêt"
**When** le dernier item est complété
**Then** la commande reste visible 5 secondes (pour vérification)
**And** puis disparaît automatiquement de l'écran

**Given** une commande est complétée
**When** elle disparaît
**Then** l'event `order:completed` est envoyé au POS
**And** le serveur (app mobile) est notifié si applicable

---

### Epic 5: Stock & Approvisionnement — Inventaire, Transferts & Achats

Les managers peuvent voir le stock par emplacement, faire des transferts, des ajustements, des inventaires physiques et gérer les commandes fournisseurs.

**FRs couverts:** FR-STOCK-01 à FR-STOCK-13, FR-PURCHASE-01 à FR-PURCHASE-11

**Offline Integration:** Stock movements en write-only (post-MVP, mode dégradé)

#### Story 5.1: Stock Levels Read-Only Cache

**As a** Manager,
**I want** consulter les niveaux de stock même offline,
**So that** je peux vérifier les disponibilités sans internet.

**Acceptance Criteria:**

**Given** l'application synchronise les données
**When** les stock levels sont chargés
**Then** ils sont cachés dans Dexie `offline_stock_levels`
**And** incluent: product_id, location_id, quantity, last_updated

**Given** l'application est offline
**When** je consulte l'inventaire
**Then** je vois les niveaux de stock (lecture seule)
**And** un bandeau indique "Données au {last_sync_time}"

#### Story 5.2: Stock Alerts Offline Display

**As a** Manager,
**I want** voir les alertes de stock bas même offline,
**So that** je suis informé des ruptures potentielles.

**Acceptance Criteria:**

**Given** le cache stock contient des niveaux < 10
**When** je consulte le dashboard offline
**Then** je vois les alertes warning (< 10) et critical (< 5)
**And** les couleurs correspondent (jaune/rouge)

**Given** je suis offline depuis longtemps
**When** les alertes sont affichées
**Then** un avertissement indique que les données peuvent être obsolètes

#### Story 5.3: Stock Adjustment (Online-Only)

**As a** Manager,
**I want** créer un ajustement de stock,
**So that** je peux corriger les écarts.

**Acceptance Criteria:**

**Given** je suis online
**When** je crée un ajustement (in/out) avec raison
**Then** le mouvement est enregistré avec traçabilité
**And** le stock est mis à jour en temps réel

**Given** je suis offline
**When** je tente un ajustement
**Then** un message indique "Ajustements nécessitent une connexion"
**And** je peux noter l'ajustement pour plus tard

#### Story 5.4: Internal Transfer Creation

**As a** Manager,
**I want** créer un transfert entre emplacements,
**So that** je peux déplacer le stock.

**Acceptance Criteria:**

**Given** je suis online
**When** je crée un transfert (source → destination)
**Then** le transfert est créé avec statut "pending"
**And** le destinataire peut le réceptionner

**Given** le transfert est créé
**When** je consulte la liste
**Then** je vois le statut et les quantités

#### Story 5.5: Transfer Reception & Validation

**As a** Réceptionnaire,
**I want** valider un transfert entrant,
**So that** le stock est correctement mis à jour.

**Acceptance Criteria:**

**Given** un transfert est en attente pour mon emplacement
**When** je le réceptionne
**Then** je peux ajuster les quantités reçues (si différentes)
**And** les mouvements sont générés automatiquement

**Given** les quantités reçues diffèrent des quantités envoyées
**When** je valide la réception
**Then** l'écart est enregistré avec une note

#### Story 5.6: Purchase Order Creation

**As a** Manager,
**I want** créer un bon de commande fournisseur,
**So that** je peux commander des matières premières.

**Acceptance Criteria:**

**Given** je suis online
**When** je crée un PO avec fournisseur et produits
**Then** un numéro unique est généré (PO-YYYYMM-XXXX)
**And** le statut est "draft"

**Given** le PO est créé
**When** j'ajoute des lignes
**Then** le total est calculé automatiquement

#### Story 5.7: Purchase Order Workflow

**As a** Manager,
**I want** gérer le cycle de vie du PO,
**So that** je suis le processus d'achat.

**Acceptance Criteria:**

**Given** un PO en draft
**When** je l'envoie au fournisseur
**Then** le statut passe à "sent"
**And** l'historique est enregistré

**Given** un PO envoyé
**When** la marchandise arrive
**Then** je peux enregistrer une réception (partielle ou totale)

#### Story 5.8: Purchase Reception & Stock Update

**As a** Réceptionnaire,
**I want** enregistrer la réception d'une commande fournisseur,
**So that** le stock est mis à jour.

**Acceptance Criteria:**

**Given** un PO avec statut "sent"
**When** j'enregistre une réception
**Then** je saisis les quantités reçues par ligne
**And** le stock est incrémenté automatiquement

**Given** la réception est partielle
**When** certaines lignes ne sont pas complètes
**Then** le PO reste "partially_received"
**And** je peux faire des réceptions additionnelles

---

### Epic 6: Clients & Marketing — Fidélité, B2B, Combos & Promotions

Les clients peuvent accumuler des points fidélité, les managers peuvent gérer les commandes B2B, et les admins peuvent créer des offres marketing.

**FRs couverts:** FR-CUSTOMER-01 à FR-CUSTOMER-10, FR-B2B-01 à FR-B2B-06, FR-PROMO-01 à FR-PROMO-10

**Offline Integration:** Customers cached read-only, promotions cached avec dates validité (ADR-001, ADR-003)

#### Story 6.1: Customers Offline Cache

**As a** Caissier,
**I want** accéder aux clients même offline,
**So that** je peux associer un client à une commande.

**Acceptance Criteria:**

**Given** l'application synchronise les données
**When** les clients sont chargés
**Then** ils sont cachés dans Dexie `offline_customers`
**And** incluent: id, name, phone, email, category_slug, loyalty_tier, points_balance

**Given** je suis offline
**When** je cherche un client
**Then** la recherche fonctionne sur le cache local
**And** je peux l'associer à la commande

#### Story 6.2: Customer Category Pricing Offline

**As a** Caissier,
**I want** que les prix clients soient appliqués offline,
**So that** les wholesale et custom prices fonctionnent sans internet.

**Acceptance Criteria:**

**Given** un client wholesale est associé à la commande
**When** j'ajoute un produit
**Then** le `wholesale_price` est utilisé automatiquement

**Given** un client custom category est associé
**When** j'ajoute un produit
**Then** le prix vient de `offline_product_category_prices`

#### Story 6.3: Loyalty Points Display (Read-Only)

**As a** Caissier,
**I want** voir le solde de points fidélité offline,
**So that** je peux informer le client.

**Acceptance Criteria:**

**Given** un client fidèle est associé à la commande
**When** je vois ses informations
**Then** son tier (Bronze/Silver/Gold/Platinum) et solde de points s'affichent
**And** la remise fidélité applicable est indiquée

**Given** je suis offline
**When** le client demande à utiliser ses points
**Then** un message indique "Utilisation des points nécessite une connexion"

#### Story 6.4: Promotions Offline Cache

**As a** Système,
**I want** cacher les promotions actives,
**So that** elles s'appliquent automatiquement même offline.

**Acceptance Criteria:**

**Given** l'application synchronise
**When** les promotions sont chargées
**Then** seules les promotions actives et valides sont cachées
**And** incluent: dates, contraintes, type, valeur

**Given** la date système dépasse la date de fin
**When** une promotion est évaluée offline
**Then** elle est ignorée (expirée)

#### Story 6.5: Automatic Promotion Application

**As a** Caissier,
**I want** que les promotions s'appliquent automatiquement,
**So that** le client bénéficie des offres sans action manuelle.

**Acceptance Criteria:**

**Given** une promotion "10% sur les viennoiseries" est active
**When** j'ajoute une viennoiserie au panier
**Then** la remise s'applique automatiquement
**And** l'économie est affichée

**Given** plusieurs promotions sont éligibles
**When** elles sont évaluées
**Then** la meilleure pour le client est appliquée

#### Story 6.6: Combos Selection Flow

**As a** Caissier,
**I want** pouvoir sélectionner un combo avec ses options,
**So that** je peux vendre des offres groupées.

**Acceptance Criteria:**

**Given** je sélectionne un combo
**When** le modal s'ouvre
**Then** je vois les groupes de choix avec min/max
**And** les ajustements de prix par option sont affichés

**Given** je complète les choix requis
**When** je valide
**Then** le combo est ajouté au panier avec le prix fixe
**And** l'économie vs prix normal est affichée

#### Story 6.7: B2B Order Creation

**As a** Manager,
**I want** créer une commande B2B,
**So that** je peux gérer les clients wholesale.

**Acceptance Criteria:**

**Given** je crée une commande pour un client B2B
**When** j'ajoute des produits
**Then** les prix wholesale sont automatiquement appliqués
**And** je peux définir les conditions de paiement (comptant/crédit)

**Given** la commande est finalisée
**When** le paiement est crédit
**Then** la créance est enregistrée dans le système

#### Story 6.8: B2B Payments Tracking

**As a** Manager,
**I want** enregistrer les paiements B2B,
**So that** je suis les créances clients.

**Acceptance Criteria:**

**Given** une commande B2B avec créance
**When** le client paie partiellement
**Then** le paiement est enregistré
**And** le solde restant est mis à jour

**Given** je consulte les créances
**When** j'ouvre le rapport
**Then** je vois les commandes non soldées par client
**And** le total des créances

---

### Epic 7: Multi-Device — Customer Display, Mobile Serveurs & LAN Hub

Les clients voient leur commande en temps réel, les serveurs prennent les commandes en salle depuis leur tablette, tous les appareils communiquent via LAN.

**FRs couverts:** FR-DISPLAY-01 à FR-DISPLAY-04, FR-MOBILE-01 à FR-MOBILE-07, FR-LAN-01 à FR-LAN-03, FR-MONITOR-01 à FR-MONITOR-04

**Architecture:** Socket.IO hub sur POS (ADR-006), events protocol (ADR-007), discovery (ADR-008), failover (ADR-009)

#### Story 7.1: Customer Display Socket.IO Connection

**As a** Customer Display,
**I want** me connecter au POS via Socket.IO,
**So that** je reçois les mises à jour du panier en temps réel.

**Acceptance Criteria:**

**Given** le Customer Display démarre
**When** il se connecte au POS
**Then** il envoie `device:register` avec type="display"
**And** la connexion est établie sur le port 3001

**Given** la connexion est perdue
**When** le réseau revient
**Then** la reconnexion est automatique en < 5 secondes

#### Story 7.2: Customer Display Cart Updates

**As a** Client,
**I want** voir ma commande sur l'écran client,
**So that** je sais ce que le caissier ajoute.

**Acceptance Criteria:**

**Given** le display est connecté au POS
**When** le caissier ajoute un item au panier
**Then** l'item s'affiche avec animation (slide-in)
**And** la latence est < 500ms (NFR-PERF-01)

**Given** un item est modifié ou supprimé
**When** l'event `cart:update` est reçu
**Then** l'affichage se met à jour en temps réel

#### Story 7.3: Customer Display Total & Branding

**As a** Client,
**I want** voir le total et le branding de la boulangerie,
**So that** l'écran est professionnel et informatif.

**Acceptance Criteria:**

**Given** le panier contient des items
**When** le display s'affiche
**Then** le total est en très grande taille (UX-07)
**And** le logo The Breakery est visible en haut

**Given** le panier est vide
**When** aucune commande n'est en cours
**Then** un écran de veille avec logo et message d'accueil s'affiche

#### Story 7.4: Mobile App Authentication

**As a** Serveur,
**I want** me connecter à l'app mobile avec mon PIN,
**So that** je peux prendre des commandes en salle.

**Acceptance Criteria:**

**Given** j'ouvre l'app mobile (Capacitor)
**When** je saisis mon PIN
**Then** l'authentification fonctionne (online via Supabase, offline via cache)
**And** mes permissions sont chargées

**Given** je suis authentifié
**When** l'app s'ouvre
**Then** je vois la liste des tables disponibles

#### Story 7.5: Mobile App Product Catalog

**As a** Serveur,
**I want** parcourir le catalogue de produits sur ma tablette,
**So that** je peux créer des commandes.

**Acceptance Criteria:**

**Given** je suis authentifié
**When** je parcours le catalogue
**Then** les produits s'affichent par catégorie
**And** les images et prix sont visibles

**Given** l'app est offline
**When** je consulte le catalogue
**Then** les données viennent du cache IndexedDB

#### Story 7.6: Mobile App Order Creation

**As a** Serveur,
**I want** créer une commande depuis ma tablette,
**So that** je peux prendre les commandes en salle.

**Acceptance Criteria:**

**Given** je sélectionne une table
**When** j'ajoute des produits
**Then** le panier se construit avec modifiers
**And** le total se calcule en temps réel

**Given** la commande est prête
**When** je l'envoie
**Then** elle est transmise au POS via Socket.IO LAN
**And** le KDS reçoit les items à préparer

#### Story 7.7: Mobile App Order Status

**As a** Serveur,
**I want** voir le statut de mes commandes envoyées,
**So that** je sais quand aller chercher les plats.

**Acceptance Criteria:**

**Given** j'ai des commandes en cours
**When** je consulte la liste
**Then** je vois le statut de chaque commande (pending, preparing, ready)

**Given** une commande est prête
**When** le KDS marque "ready"
**Then** je reçois une notification sur ma tablette
**And** la commande passe en vert

#### Story 7.8: LAN Discovery via QR Code

**As a** Appareil (Mobile/Display/KDS),
**I want** découvrir le POS via QR code,
**So that** je n'ai pas à configurer l'IP manuellement.

**Acceptance Criteria:**

**Given** le POS est démarré
**When** l'admin ouvre les paramètres LAN
**Then** un QR code contenant l'IP et le port est affiché

**Given** je scanne le QR code avec l'app mobile
**When** le scan est réussi
**Then** l'IP du POS est sauvegardée
**And** la connexion Socket.IO s'établit automatiquement

#### Story 7.9: System Monitoring Dashboard

**As a** Manager,
**I want** voir le statut de tous les appareils connectés,
**So that** je peux surveiller le système.

**Acceptance Criteria:**

**Given** je consulte le dashboard monitoring
**When** des appareils sont connectés
**Then** je vois la liste avec type, nom, statut, dernière activité

**Given** un appareil se déconnecte
**When** la connexion est perdue
**Then** son statut passe à "offline" après 30 secondes

#### Story 7.10: Offline Period Logging

**As a** Manager,
**I want** voir l'historique des périodes offline,
**So that** je peux analyser la fiabilité du réseau.

**Acceptance Criteria:**

**Given** une coupure internet se produit
**When** la connexion est perdue puis rétablie
**Then** la période est enregistrée (start, end, duration, transactions_count)

**Given** je consulte l'historique
**When** j'ouvre le rapport
**Then** je vois les périodes offline avec les stats de sync

---

### Epic 8: Analytics & Intelligence — Reports Complets

Les managers et comptables peuvent consulter tous les rapports avec filtres, drill-down, comparaisons et exports.

**FRs couverts:** FR-REPORTS-01 à FR-REPORTS-28

**Offline Integration:** Rapports 7 derniers jours disponibles offline (NFR-REL-06)

#### Story 8.1: Report Framework Base

**As a** Manager,
**I want** un framework de reporting unifié,
**So that** tous les rapports ont une UX cohérente.

**Acceptance Criteria:**

**Given** j'ouvre un rapport
**When** la page charge
**Then** je vois un Date Range Picker avec presets (Today, Yesterday, Last 7 days, This Month, Custom)
**And** des filtres contextuels sont disponibles

**Given** les données sont chargées
**When** le rapport s'affiche
**Then** les visualisations (Bar, Line, Pie, Table) sont interactives
**And** le temps de chargement est < 2 secondes (NFR-PERF-06)

#### Story 8.2: Sales Reports Suite

**As a** Manager,
**I want** consulter les rapports de ventes,
**So that** je comprends la performance commerciale.

**Acceptance Criteria:**

**Given** j'ouvre le rapport Sales Overview
**When** je sélectionne une période
**Then** je vois: total CA, nombre de transactions, panier moyen, top produits

**Given** j'ouvre Sales by Hour
**When** les données s'affichent
**Then** je vois un graphique avec les ventes par heure
**And** je peux identifier les heures de pointe

**Given** j'ouvre Sales by Customer
**When** je consulte
**Then** je vois les clients classés par CA généré

#### Story 8.3: Inventory Reports Suite

**As a** Manager,
**I want** consulter les rapports d'inventaire,
**So that** je gère le stock efficacement.

**Acceptance Criteria:**

**Given** j'ouvre Stock Balance
**When** les données s'affichent
**Then** je vois le stock par emplacement avec valorisation

**Given** j'ouvre Stock Warning
**When** les données s'affichent
**Then** je vois les produits sous seuil (< 10 et < 5)
**And** ils sont colorés selon la criticité

**Given** j'ouvre Expired Stock
**When** les données s'affichent
**Then** je vois les produits périmés ou bientôt périmés

#### Story 8.4: Financial Reports Suite

**As a** Comptable,
**I want** consulter les rapports financiers,
**So that** je peux faire la comptabilité.

**Acceptance Criteria:**

**Given** j'ouvre Profit/Loss
**When** je sélectionne une période
**Then** je vois: CA, coûts, marge brute, marge nette

**Given** j'ouvre Cash Balance
**When** les données s'affichent
**Then** je vois les encaissements par mode de paiement

**Given** j'ouvre Receivables
**When** les données s'affichent
**Then** je vois les créances clients B2B par échéance

#### Story 8.5: Report Drill-Down

**As a** Manager,
**I want** faire du drill-down sur les rapports,
**So that** je peux investiguer les détails.

**Acceptance Criteria:**

**Given** je vois une ligne agrégée (ex: CA du jour)
**When** je clique dessus
**Then** je vois le détail (liste des transactions)
**And** le drill-down est < 500ms (NFR-PERF-07)

**Given** je suis dans une vue détaillée
**When** je veux remonter
**Then** un breadcrumb me permet de revenir au niveau précédent

#### Story 8.6: Report Export (CSV & PDF)

**As a** Manager,
**I want** exporter les rapports,
**So that** je peux les partager ou les archiver.

**Acceptance Criteria:**

**Given** je consulte un rapport
**When** je clique sur Export CSV
**Then** un fichier CSV est téléchargé en < 5 secondes pour 10,000 lignes (NFR-PERF-08)

**Given** je clique sur Export PDF
**When** le PDF est généré
**Then** il inclut un filigrane (nom utilisateur + date) (NFR-SEC-07)
**And** le temps est < 10 secondes (NFR-PERF-09)

#### Story 8.7: Period Comparison

**As a** Manager,
**I want** comparer deux périodes,
**So that** je vois l'évolution.

**Acceptance Criteria:**

**Given** j'ai sélectionné une période
**When** j'active "Compare to"
**Then** je peux sélectionner une deuxième période (Previous period, Same period last year)

**Given** la comparaison est activée
**When** les données s'affichent
**Then** je vois les variations en % et en valeur absolue
**And** les tendances sont colorées (vert = hausse, rouge = baisse)

#### Story 8.8: Reports Offline Cache (7 Days)

**As a** Manager,
**I want** consulter les rapports des 7 derniers jours offline,
**So that** je peux analyser même sans internet.

**Acceptance Criteria:**

**Given** l'application synchronise
**When** les données de reporting sont chargées
**Then** les 7 derniers jours sont cachés dans IndexedDB

**Given** je suis offline
**When** j'ouvre un rapport
**Then** les données des 7 derniers jours sont disponibles
**And** un bandeau indique "Mode offline - données jusqu'au {last_sync}"

#### Story 8.9: Audit Trail & Alerts

**As a** Manager,
**I want** voir l'audit trail et les alertes,
**So that** je détecte les anomalies.

**Acceptance Criteria:**

**Given** je consulte l'audit trail
**When** les données s'affichent
**Then** je vois toutes les actions critiques (void, refund, price change, etc.)
**And** chaque action a un timestamp et un utilisateur

**Given** une anomalie est détectée (ex: void > seuil)
**When** le système génère une alerte
**Then** elle apparaît dans le dashboard alertes
**And** je peux la marquer comme "résolue"

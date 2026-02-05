# Requirements Inventory

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

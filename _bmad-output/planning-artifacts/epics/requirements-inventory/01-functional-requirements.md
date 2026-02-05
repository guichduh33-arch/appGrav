### Functional Requirements

#### Core POS & Ventes (FR-POS)

* **FR-POS-01**: Le Caissier peut ajouter des produits au panier en un tap
* **FR-POS-02**: Le Caissier peut modifier les quantités des produits dans le panier
* **FR-POS-03**: Le Caissier peut supprimer des produits du panier
* **FR-POS-04**: Le Caissier peut appliquer des modifiers/variantes aux produits
* **FR-POS-05**: Le Caissier peut sélectionner un type de commande (dine\_in, takeaway, delivery)
* **FR-POS-06**: Le Caissier peut sélectionner une table pour les commandes sur place
* **FR-POS-07**: Le Caissier peut associer un client à la commande
* **FR-POS-08**: Le Caissier peut appliquer une remise globale (pourcentage ou montant)
* **FR-POS-09**: Le Système calcule automatiquement le sous-total, taxes (10% inclus) et total
* **FR-POS-10**: Le Caissier peut finaliser la commande avec différents modes de paiement (espèces, carte, QRIS, split)
* **FR-POS-11**: Le Caissier peut gérer le rendu monnaie pour les paiements espèces
* **FR-POS-12**: Le Système génère automatiquement un numéro de commande unique (SALE-YYYYMMDD-XXX)
* **FR-POS-13**: Le Caissier peut envoyer la commande en cuisine (dispatch par station: barista, kitchen, display)
* **FR-POS-14**: Le Système verrouille les items envoyés en cuisine (PIN manager requis pour modification)
* **FR-POS-15**: Le Caissier peut mettre une commande en attente (held orders)
* **FR-POS-16**: Le Caissier peut reprendre une commande en attente
* **FR-POS-17**: Le Manager peut annuler une commande (avec PIN et raison)
* **FR-POS-18**: Le Manager peut effectuer un remboursement (avec PIN et raison)

#### Kitchen Display System (FR-KDS)

* **FR-KDS-01**: Le Cuisinier peut voir les commandes en attente organisées par station
* **FR-KDS-02**: Le Cuisinier peut voir le temps d'attente de chaque commande
* **FR-KDS-03**: Le Cuisinier peut marquer des items comme "en préparation"
* **FR-KDS-04**: Le Cuisinier peut marquer des items comme "prêt"
* **FR-KDS-05**: Le Cuisinier peut voir la table ou le type de commande d'origine
* **FR-KDS-06**: Le Système affiche les commandes par priorité (temps d'attente)

#### Gestion Produits (FR-PROD)

* **FR-PROD-01**: L'Admin peut créer un nouveau produit (finished, semi\_finished, raw\_material)
* **FR-PROD-02**: L'Admin peut définir les informations de base (SKU, nom, description, catégorie)
* **FR-PROD-03**: L'Admin peut définir les prix (retail\_price, wholesale\_price, cost\_price)
* **FR-PROD-04**: L'Admin peut uploader une image produit
* **FR-PROD-05**: L'Admin peut définir la station de dispatch (barista, kitchen, display, none)
* **FR-PROD-06**: L'Admin peut activer/désactiver un produit
* **FR-PROD-07**: L'Admin peut définir la visibilité POS
* **FR-PROD-08**: L'Admin peut gérer les catégories (nom, icône, couleur, ordre de tri)
* **FR-PROD-09**: L'Admin peut créer des modifiers/variantes (taille, options, personnalisations)
* **FR-PROD-10**: L'Admin peut définir des ajustements de prix par modifier
* **FR-PROD-11**: L'Admin peut définir des unités de mesure alternatives (UoM)

#### Recettes & Costing (FR-RECIPE)

* **FR-RECIPE-01**: L'Admin peut créer une recette pour un produit fini
* **FR-RECIPE-02**: L'Admin peut définir les ingrédients avec quantités et unités
* **FR-RECIPE-03**: Le Système calcule automatiquement le coût de revient (cost\_price)
* **FR-RECIPE-04**: Le Système calcule automatiquement la marge brute
* **FR-RECIPE-05**: L'Admin peut modifier une recette existante
* **FR-RECIPE-06**: Le Système recalcule les coûts lors de modification des prix ingrédients

#### Production (FR-PRODUCTION)

* **FR-PRODUCTION-01**: Le Producteur peut enregistrer une production (lot)
* **FR-PRODUCTION-02**: Le Système génère un numéro de lot (batch\_number)
* **FR-PRODUCTION-03**: Le Système décrémente automatiquement le stock des ingrédients
* **FR-PRODUCTION-04**: Le Système incrémente automatiquement le stock du produit fini
* **FR-PRODUCTION-05**: Le Producteur peut annuler une production (avec stock rollback)
* **FR-PRODUCTION-06**: Le Manager peut voir l'historique des productions

#### Inventaire & Stock (FR-STOCK)

* **FR-STOCK-01**: Le Système maintient le stock en temps réel par emplacement
* **FR-STOCK-02**: L'Admin peut définir des emplacements de stock (Main Warehouse, POS, Production, etc.)
* **FR-STOCK-03**: Le Manager peut voir le stock par emplacement
* **FR-STOCK-04**: Le Manager peut créer un ajustement de stock (in/out) avec raison
* **FR-STOCK-05**: Le Système enregistre tous les mouvements de stock avec traçabilité
* **FR-STOCK-06**: Le Manager peut créer un transfert interne entre emplacements
* **FR-STOCK-07**: Le Destinataire peut réceptionner un transfert (avec validation quantités)
* **FR-STOCK-08**: Le Système génère automatiquement les mouvements lors de réception
* **FR-STOCK-09**: Le Manager peut effectuer un inventaire physique (stock opname)
* **FR-STOCK-10**: Le Système compare stock système vs compté et génère les écarts
* **FR-STOCK-11**: Le Manager peut valider l'inventaire (création ajustements automatiques)
* **FR-STOCK-12**: Le Système affiche des alertes pour stock bas (< 10 warning, < 5 critical)
* **FR-STOCK-13**: Le Système empêche les ventes si stock insuffisant

#### Achats & Fournisseurs (FR-PURCHASE)

* **FR-PURCHASE-01**: L'Admin peut créer/modifier/supprimer des fournisseurs
* **FR-PURCHASE-02**: L'Admin peut définir les informations fournisseur (code, nom, contact, conditions paiement)
* **FR-PURCHASE-03**: Le Manager peut créer un bon de commande (PO)
* **FR-PURCHASE-04**: Le Système génère un numéro PO unique (PO-YYYYMM-XXXX)
* **FR-PURCHASE-05**: Le Manager peut ajouter des produits au PO avec quantités et prix
* **FR-PURCHASE-06**: Le Manager peut envoyer le PO au fournisseur (changement statut)
* **FR-PURCHASE-07**: Le Réceptionnaire peut enregistrer une réception partielle ou totale
* **FR-PURCHASE-08**: Le Système met à jour le stock automatiquement lors de réception
* **FR-PURCHASE-09**: Le Manager peut enregistrer un retour fournisseur avec raison
* **FR-PURCHASE-10**: Le Manager peut voir l'historique des actions sur un PO
* **FR-PURCHASE-11**: Le Système calcule la valeur totale du PO

#### Clients & Fidélité (FR-CUSTOMER)

* **FR-CUSTOMER-01**: L'Admin peut créer/modifier un profil client
* **FR-CUSTOMER-02**: L'Admin peut définir le type client (retail, wholesale)
* **FR-CUSTOMER-03**: L'Admin peut assigner une catégorie de prix (retail, wholesale, discount\_percentage, custom)
* **FR-CUSTOMER-04**: Le Système applique automatiquement le prix selon la catégorie client
* **FR-CUSTOMER-05**: Le Système gère les points de fidélité (1 point = 1000 IDR)
* **FR-CUSTOMER-06**: Le Système détermine automatiquement le tier fidélité (Bronze, Silver, Gold, Platinum)
* **FR-CUSTOMER-07**: Le Système applique la remise fidélité selon le tier (0%, 5%, 8%, 10%)
* **FR-CUSTOMER-08**: Le Client peut consulter son solde de points
* **FR-CUSTOMER-09**: Le Client peut utiliser ses points comme paiement partiel
* **FR-CUSTOMER-10**: Le Système enregistre l'historique des transactions de points

#### Module B2B (FR-B2B)

* **FR-B2B-01**: Le Manager peut créer une commande B2B (wholesale)
* **FR-B2B-02**: Le Système applique automatiquement les prix wholesale
* **FR-B2B-03**: Le Manager peut définir des conditions de paiement (comptant, crédit)
* **FR-B2B-04**: Le Manager peut enregistrer des paiements partiels
* **FR-B2B-05**: Le Système track le statut de paiement (paid, partial, unpaid)
* **FR-B2B-06**: Le Manager peut voir les créances clients B2B

#### Combos & Promotions (FR-PROMO)

* **FR-PROMO-01**: L'Admin peut créer un combo (offre groupée) avec prix fixe
* **FR-PROMO-02**: L'Admin peut définir des groupes de choix dans un combo (min/max selections)
* **FR-PROMO-03**: L'Admin peut définir des ajustements de prix par item dans un groupe
* **FR-PROMO-04**: Le Système calcule automatiquement l'économie vs prix normal
* **FR-PROMO-05**: L'Admin peut créer une promotion (pourcentage, montant fixe, buy X get Y, produit offert)
* **FR-PROMO-06**: L'Admin peut définir des contraintes temporelles (dates, jours, heures)
* **FR-PROMO-07**: L'Admin peut définir des conditions d'achat (montant min, quantité min)
* **FR-PROMO-08**: L'Admin peut définir des limites d'utilisation (totale, par client)
* **FR-PROMO-09**: Le Système applique automatiquement les promotions éligibles au panier
* **FR-PROMO-10**: Le Système enregistre l'utilisation des promotions

#### Utilisateurs & Permissions (FR-USER)

* **FR-USER-01**: L'Admin peut créer/modifier des utilisateurs
* **FR-USER-02**: L'Admin peut assigner des rôles aux utilisateurs
* **FR-USER-03**: L'Admin peut définir un PIN par utilisateur (4-6 chiffres)
* **FR-USER-04**: Le Système authentifie par PIN (edge function)
* **FR-USER-05**: L'Admin peut gérer les permissions par rôle
* **FR-USER-06**: L'Admin peut accorder/révoquer des permissions individuelles
* **FR-USER-07**: Le Système vérifie les permissions avant chaque action sensible
* **FR-USER-08**: Le Système enregistre un audit log de toutes les actions

#### Sessions POS (FR-SHIFT)

* **FR-SHIFT-01**: Le Caissier peut ouvrir une session de caisse
* **FR-SHIFT-02**: Le Caissier doit saisir le fond de caisse à l'ouverture
* **FR-SHIFT-03**: Le Système génère un numéro de session unique
* **FR-SHIFT-04**: Le Caissier peut clôturer sa session
* **FR-SHIFT-05**: Le Caissier doit saisir les montants réels (espèces, carte, QRIS)
* **FR-SHIFT-06**: Le Système calcule automatiquement les écarts
* **FR-SHIFT-07**: Le Manager peut voir l'historique des sessions

#### Paramètres (FR-SETTINGS)

* **FR-SETTINGS-01**: L'Admin peut configurer les informations de l'établissement
* **FR-SETTINGS-02**: L'Admin peut configurer les taux de taxe
* **FR-SETTINGS-03**: L'Admin peut configurer les méthodes de paiement
* **FR-SETTINGS-04**: L'Admin peut configurer les horaires d'ouverture
* **FR-SETTINGS-05**: L'Admin peut configurer les imprimantes (tickets, cuisine)
* **FR-SETTINGS-06**: L'Admin peut configurer les templates de reçus
* **FR-SETTINGS-07**: L'Utilisateur peut changer sa langue (FR, EN, ID)
* **FR-SETTINGS-08**: Le Système enregistre l'historique des modifications

#### Mode Offline & Synchronisation - MVP (FR-OFFLINE)

* **FR-OFFLINE-01 (=FR1)**: Le Caissier peut continuer à prendre des commandes lorsque internet est coupé
* **FR-OFFLINE-02 (=FR2)**: Le Système peut stocker les transactions localement pendant une période offline
* **FR-OFFLINE-03 (=FR3)**: Le Système peut synchroniser automatiquement les transactions offline quand internet revient
* **FR-OFFLINE-04 (=FR4)**: Le Caissier peut voir un indicateur du statut de connexion (online/offline)
* **FR-OFFLINE-05 (=FR5)**: Le Manager peut voir le nombre de transactions en attente de synchronisation
* **FR-OFFLINE-06 (=FR6)**: Le Système peut maintenir l'intégrité des données lors de la synchronisation

#### Customer Display - MVP (FR-DISPLAY)

* **FR-DISPLAY-01 (=FR7)**: Le Client peut voir les articles ajoutés à sa commande en temps réel
* **FR-DISPLAY-02 (=FR8)**: Le Client peut voir le prix de chaque article ajouté
* **FR-DISPLAY-03 (=FR9)**: Le Client peut voir le total de sa commande mis à jour dynamiquement
* **FR-DISPLAY-04 (=FR10)**: Le Customer Display peut recevoir les mises à jour depuis le POS via le réseau local

#### Application Mobile Serveurs - MVP (FR-MOBILE)

* **FR-MOBILE-01 (=FR11)**: Le Serveur peut se connecter à l'application mobile avec ses identifiants
* **FR-MOBILE-02 (=FR12)**: Le Serveur peut parcourir le catalogue de produits sur l'application mobile
* **FR-MOBILE-03 (=FR13)**: Le Serveur peut sélectionner une table pour la commande
* **FR-MOBILE-04 (=FR14)**: Le Serveur peut ajouter des produits à une commande
* **FR-MOBILE-05 (=FR15)**: Le Serveur peut appliquer des modifiers aux produits
* **FR-MOBILE-06 (=FR16)**: Le Serveur peut envoyer la commande directement au KDS depuis l'application mobile
* **FR-MOBILE-07 (=FR17)**: Le Serveur peut voir le statut de ses commandes envoyées

#### Communication Réseau Local (LAN) - MVP (FR-LAN)

* **FR-LAN-01 (=FR18)**: Les appareils (POS, Mobile, KDS, Display) peuvent communiquer via le réseau local câblé
* **FR-LAN-02 (=FR19)**: Le Système peut fonctionner en mode LAN-only quand internet est coupé
* **FR-LAN-03 (=FR20)**: Les commandes peuvent être transmises entre appareils sans dépendre d'internet

#### KDS Améliorations - MVP (FR-KDS-MVP)

* **FR-KDS-MVP-01 (=FR21)**: Le Cuisinier peut recevoir des commandes provenant de l'application mobile serveurs
* **FR-KDS-MVP-02 (=FR22)**: Le Cuisinier peut voir la table d'origine pour chaque commande
* **FR-KDS-MVP-03 (=FR23)**: Le Cuisinier peut marquer une commande comme "Prête"
* **FR-KDS-MVP-04 (=FR24)**: Le Serveur peut être notifié quand sa commande est prête (via l'app mobile)

#### Supervision & Monitoring - MVP (FR-MONITOR)

* **FR-MONITOR-01 (=FR25)**: Le Manager peut voir le statut de synchronisation du système
* **FR-MONITOR-02 (=FR26)**: Le Manager peut recevoir des alertes lors de coupures internet
* **FR-MONITOR-03 (=FR27)**: Le Manager peut voir un rapport des transactions synchronisées après une période offline
* **FR-MONITOR-04 (=FR28)**: Le Manager peut voir l'historique des périodes offline

#### Reports & Analytics (FR-REPORTS)

* **FR-REPORTS-01 (=FR29)**: Le Système peut afficher un Date Range Picker permettant de sélectionner des périodes personnalisées
* **FR-REPORTS-02 (=FR30)**: Le Système peut appliquer des filtres avancés sur les rapports
* **FR-REPORTS-03 (=FR31)**: Le Système peut permettre le drill-down depuis une vue agrégée vers les détails
* **FR-REPORTS-04 (=FR32)**: Le Système peut exporter les rapports en format CSV
* **FR-REPORTS-05 (=FR33)**: Le Système peut exporter les rapports en format PDF
* **FR-REPORTS-06 (=FR34)**: Le Système peut restreindre l'accès aux rapports selon les permissions
* **FR-REPORTS-07 (=FR35)**: Le Manager peut voir un rapport Profit/Loss
* **FR-REPORTS-08 (=FR36)**: Le Manager peut voir un rapport Sales by Customer
* **FR-REPORTS-09 (=FR37)**: Le Manager peut voir un rapport Sales by Hour
* **FR-REPORTS-10 (=FR38)**: Le Manager peut voir un rapport Cancellations
* **FR-REPORTS-11 (=FR39)**: Le Manager peut comparer deux périodes sur les rapports
* **FR-REPORTS-12 (=FR40)**: Le Cuisinier peut voir un rapport Stock Balance
* **FR-REPORTS-13 (=FR41)**: Le Cuisinier peut voir un rapport Stock Warning
* **FR-REPORTS-14 (=FR42)**: Le Cuisinier peut voir un rapport Expired Stock
* **FR-REPORTS-15 (=FR43)**: Le Manager peut voir un rapport Unsold Products
* **FR-REPORTS-16 (=FR44)**: La Comptable peut voir un rapport Cash Balance
* **FR-REPORTS-17 (=FR45)**: La Comptable peut voir un rapport Receivables
* **FR-REPORTS-18 (=FR46)**: La Comptable peut voir un rapport Expenses
* **FR-REPORTS-19 (=FR47)**: La Comptable peut voir le détail des taxes collectées
* **FR-REPORTS-20 (=FR48)**: Le Manager peut voir un rapport Purchase Returns
* **FR-REPORTS-21 (=FR49)**: Le Manager peut voir un rapport Outstanding Payments
* **FR-REPORTS-22 (=FR50)**: Le Manager peut voir un rapport Price Changes
* **FR-REPORTS-23 (=FR51)**: Le Manager peut voir un rapport Deleted Products
* **FR-REPORTS-24 (=FR52)**: Le Système enregistre toutes les actions dans un audit trail
* **FR-REPORTS-25 (=FR53)**: Le Système génère des alertes automatiques pour les anomalies
* **FR-REPORTS-26 (=FR54)**: Le Manager peut configurer les seuils d'alerte
* **FR-REPORTS-27 (=FR55)**: Le Manager peut voir un tableau de bord des alertes
* **FR-REPORTS-28 (=FR56)**: Le Manager peut marquer une alerte comme résolue

***

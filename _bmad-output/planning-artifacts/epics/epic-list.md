# Epic List

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
**And** après 3 tentatives, un délai de 30 secondes (cooldown) est imposé
**And** un rate limit global de 3 tentatives par 15 minutes prévient les attaques brute-force

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
**Then** le compteur `retries` est incrémenté
**And** un backoff exponentiel est appliqué (5s → 10s → 30s → 60s → 300s)
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

#### Story 4.1: LAN Hub Lifecycle Management

**As a** Système,
**I want** que le POS serve de hub de communication sur le LAN,
**So that** les autres appareils peuvent communiquer sans internet.

**Note technique:** L'implémentation utilise BroadcastChannel (same-origin) + Supabase Realtime (cross-origin) car les navigateurs ne peuvent pas créer de serveurs WebSocket natifs.

**Acceptance Criteria:**

**Given** le POS démarre
**When** l'application s'initialise
**Then** le hub LAN est démarré automatiquement
**And** les connexions d'appareils sont acceptées via Supabase Realtime

**Given** un appareil se connecte (KDS, Mobile, Display)
**When** la connexion est établie
**Then** l'appareil est enregistré avec son type et son ID
**And** les events peuvent être échangés bidirectionnellement

#### Story 4.2: KDS LAN Client Connection

**As a** KDS,
**I want** me connecter au POS via le réseau local,
**So that** je reçois les commandes même sans internet.

**Note technique:** La connexion utilise Supabase Realtime comme canal de communication (pas de WebSocket direct).

**Acceptance Criteria:**

**Given** le KDS démarre
**When** il détecte le réseau local
**Then** il se connecte au canal Supabase Realtime 'lan-hub'
**And** l'IP du hub est configurée ou découverte via QR code (ADR-008)

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

**Given** la station est configurée comme "waiter"
**When** tous les items de la commande sont prêts
**Then** la commande NE disparaît PAS automatiquement
**And** le serveur doit la marquer manuellement comme "servie"

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

---

### Epic 9: Comptabilité & Fiscalité — Journal, Grand Livre, États Financiers, TVA

Les comptables et managers peuvent gérer la comptabilité de l'entreprise avec journal, grand livre, états financiers et déclarations TVA pour conformité fiscale Indonésie.

**FRs couverts:** FR-ACCT-01 à FR-ACCT-15

**Offline Integration:** Online-only (pas de sync offline - comptabilité requiert cohérence temps réel)

#### Story 9.1: Plan Comptable Configurable

**As a** Admin,
**I want** configurer le plan comptable,
**So that** les écritures utilisent les bons comptes.

**Acceptance Criteria:**

**Given** j'ouvre la configuration comptable
**When** je consulte le plan comptable
**Then** je vois les comptes par classe (1-Actif, 2-Passif, 3-Capitaux, 4-Tiers, 5-Financier, 6-Charges, 7-Produits)
**And** un plan comptable PME indonésien est pré-chargé par défaut

**Given** je souhaite ajouter un compte
**When** je crée un nouveau compte avec code et libellé
**Then** il est ajouté à la hiérarchie appropriée
**And** le type (actif/passif/charge/produit) est défini

#### Story 9.2: Journal des Ventes (Auto-génération)

**As a** Système,
**I want** générer automatiquement les écritures de vente,
**So that** chaque commande POS est comptabilisée.

**Acceptance Criteria:**

**Given** une commande est finalisée et payée
**When** le paiement est enregistré
**Then** une écriture est créée automatiquement:
  - Débit: 411 Clients (ou 512 Banque/531 Caisse si cash)
  - Crédit: 707 Ventes de marchandises (HT)
  - Crédit: 44571 TVA collectée (10% PPN)

**Given** une commande est annulée (void)
**When** l'annulation est confirmée
**Then** une écriture d'extourne est générée avec référence à l'écriture d'origine

#### Story 9.3: Journal des Achats (Auto-génération)

**As a** Système,
**I want** générer automatiquement les écritures d'achat,
**So that** chaque réception de commande fournisseur est comptabilisée.

**Acceptance Criteria:**

**Given** une réception de Purchase Order est enregistrée
**When** les quantités sont validées
**Then** une écriture est créée automatiquement:
  - Débit: 607 Achats de marchandises (HT)
  - Débit: 44566 TVA déductible (10% PPN)
  - Crédit: 401 Fournisseurs

**Given** le paiement fournisseur est enregistré
**When** le règlement est effectué
**Then** une écriture de règlement est créée:
  - Débit: 401 Fournisseurs
  - Crédit: 512 Banque

#### Story 9.4: Journal de Banque/Caisse

**As a** Comptable,
**I want** enregistrer les mouvements de trésorerie manuels,
**So that** la comptabilité reflète tous les flux financiers.

**Acceptance Criteria:**

**Given** je crée une écriture manuelle
**When** je saisis les comptes débit/crédit et montants
**Then** le système vérifie que total débit = total crédit
**And** l'écriture est enregistrée avec ma signature (user_id)

**Given** je consulte le journal de banque
**When** je sélectionne une période
**Then** je vois tous les mouvements avec solde progressif

#### Story 9.5: Grand Livre par Compte

**As a** Comptable,
**I want** consulter le grand livre d'un compte,
**So that** je vois tous les mouvements et le solde.

**Acceptance Criteria:**

**Given** je sélectionne un compte et une période
**When** le grand livre s'affiche
**Then** je vois toutes les écritures avec date, référence, libellé, débit, crédit
**And** le solde progressif est calculé ligne par ligne
**And** le solde final est affiché

**Given** je clique sur une écriture
**When** le détail s'ouvre
**Then** je vois l'écriture complète avec toutes ses lignes

#### Story 9.6: Balance des Comptes

**As a** Comptable,
**I want** générer la balance des comptes,
**So that** je vérifie l'équilibre comptable.

**Acceptance Criteria:**

**Given** je sélectionne une période
**When** la balance s'affiche
**Then** je vois pour chaque compte: solde début, mouvements débit, mouvements crédit, solde fin
**And** le total des débits = total des crédits (équilibre vérifié)

**Given** je filtre par classe de compte
**When** j'applique le filtre
**Then** seuls les comptes de cette classe sont affichés

#### Story 9.7: Bilan (État Financier)

**As a** Manager,
**I want** générer le bilan comptable,
**So that** je connais la situation patrimoniale de l'entreprise.

**Acceptance Criteria:**

**Given** je demande le bilan à une date
**When** le rapport s'affiche
**Then** je vois l'Actif:
  - Actif immobilisé (classe 2)
  - Actif circulant (stocks, créances, trésorerie)
**And** je vois le Passif:
  - Capitaux propres (classe 1)
  - Dettes (fournisseurs, fiscales, financières)
**And** Total Actif = Total Passif

**Given** je compare avec une période précédente
**When** j'active la comparaison
**Then** les variations sont affichées en valeur et %

#### Story 9.8: Compte de Résultat (État Financier)

**As a** Manager,
**I want** générer le compte de résultat,
**So that** je connais la performance financière de l'entreprise.

**Acceptance Criteria:**

**Given** je sélectionne une période
**When** le rapport s'affiche
**Then** je vois les Produits:
  - Ventes de marchandises (707)
  - Autres produits
**And** je vois les Charges:
  - Achats (607)
  - Services extérieurs
  - Charges de personnel
  - Amortissements
**And** le Résultat net = Total Produits - Total Charges

**Given** je compare avec la période précédente
**When** j'active la comparaison
**Then** les variations sont affichées avec tendance (hausse/baisse)

#### Story 9.9: Gestion TVA (Collectée/Déductible)

**As a** Comptable,
**I want** suivre la TVA collectée et déductible,
**So that** je prépare les déclarations fiscales.

**Acceptance Criteria:**

**Given** je consulte le module TVA
**When** je sélectionne une période mensuelle
**Then** je vois:
  - TVA collectée (compte 44571) = somme des ventes
  - TVA déductible (compte 44566) = somme des achats
  - TVA à payer = collectée - déductible

**Given** la TVA déductible > TVA collectée
**When** le calcul est effectué
**Then** le crédit de TVA est affiché (report possible)

#### Story 9.10: Déclaration TVA Mensuelle

**As a** Comptable,
**I want** générer et suivre les déclarations TVA,
**So that** je suis en conformité fiscale indonésienne.

**Acceptance Criteria:**

**Given** une période mensuelle est complète
**When** je génère la déclaration
**Then** un récapitulatif TVA est créé avec:
  - Montant TVA collectée
  - Montant TVA déductible
  - Montant TVA à payer (ou crédit)
**And** je peux exporter au format requis par le fisc

**Given** la déclaration est soumise
**When** je marque comme "déclarée"
**Then** la date et référence de soumission sont enregistrées
**And** la période est clôturée (écritures verrouillées)

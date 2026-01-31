# Functional Requirements

### Mode Offline & Synchronisation

- **FR1:** Le Caissier peut continuer à prendre des commandes lorsque internet est coupé
- **FR2:** Le Système peut stocker les transactions localement pendant une période offline
- **FR3:** Le Système peut synchroniser automatiquement les transactions offline quand internet revient
- **FR4:** Le Caissier peut voir un indicateur du statut de connexion (online/offline)
- **FR5:** Le Manager peut voir le nombre de transactions en attente de synchronisation
- **FR6:** Le Système peut maintenir l'intégrité des données lors de la synchronisation

### Customer Display

- **FR7:** Le Client peut voir les articles ajoutés à sa commande en temps réel
- **FR8:** Le Client peut voir le prix de chaque article ajouté
- **FR9:** Le Client peut voir le total de sa commande mis à jour dynamiquement
- **FR10:** Le Customer Display peut recevoir les mises à jour depuis le POS via le réseau local

### Application Mobile Serveurs

- **FR11:** Le Serveur peut se connecter à l'application mobile avec ses identifiants
- **FR12:** Le Serveur peut parcourir le catalogue de produits sur l'application mobile
- **FR13:** Le Serveur peut sélectionner une table pour la commande
- **FR14:** Le Serveur peut ajouter des produits à une commande
- **FR15:** Le Serveur peut appliquer des modifiers aux produits (options, personnalisations)
- **FR16:** Le Serveur peut envoyer la commande directement au KDS depuis l'application mobile
- **FR17:** Le Serveur peut voir le statut de ses commandes envoyées

### Communication Réseau Local (LAN)

- **FR18:** Les appareils (POS, Mobile, KDS, Display) peuvent communiquer via le réseau local câblé
- **FR19:** Le Système peut fonctionner en mode LAN-only quand internet est coupé
- **FR20:** Les commandes peuvent être transmises entre appareils sans dépendre d'internet

### Kitchen Display System (KDS) - Améliorations

- **FR21:** Le Cuisinier peut recevoir des commandes provenant de l'application mobile serveurs
- **FR22:** Le Cuisinier peut voir la table d'origine pour chaque commande
- **FR23:** Le Cuisinier peut marquer une commande comme "Prête"
- **FR24:** Le Serveur peut être notifié quand sa commande est prête (via l'app mobile)

### Supervision & Monitoring

- **FR25:** Le Manager peut voir le statut de synchronisation du système
- **FR26:** Le Manager peut recevoir des alertes lors de coupures internet
- **FR27:** Le Manager peut voir un rapport des transactions synchronisées après une période offline
- **FR28:** Le Manager peut voir l'historique des périodes offline

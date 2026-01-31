# User Journeys

### Parcours 1 : Marie, la Serveuse (App Mobile)

**Persona :** Marie, serveuse expérimentée, service du midi et soir

**Situation :** Marie travaille le service du midi. Actuellement, elle doit mémoriser les commandes ou les noter, puis retourner à la caisse pour les saisir.

**Scène d'ouverture :**
Il est 12h30, la salle est pleine. Marie accueille une table de 4 clients. Elle note mentalement : 2 croissants, 1 pain au chocolat, 3 cafés...

**Action montante :**
Avec sa tablette, Marie saisit directement la commande à table. Elle sélectionne la table 7, ajoute les articles, vérifie les modifiers (café avec lait d'amande).

**Climax :**
D'un tap, la commande part directement en cuisine (KDS) et au bar. Marie n'a pas quitté la table.

**Résolution :**
Les clients sont servis plus vite. Marie peut s'occuper de plus de tables. Moins de stress, moins d'erreurs.

**Fonctionnalités révélées :** App mobile, sélection table, catalogue produits, modifiers, envoi KDS temps réel

---

### Parcours 2 : Budi, le Caissier (Mode Offline)

**Persona :** Budi, caissier principal, poste fixe

**Situation :** Budi est à la caisse principale. À Lombok, les coupures internet arrivent parfois sans prévenir.

**Scène d'ouverture :**
14h15, service tranquille. Soudain, l'icône WiFi devient rouge. Internet est coupé. Avant, c'était la panique - impossible de finaliser les commandes.

**Action montante :**
Budi voit la notification "Mode Offline Activé" mais continue à travailler normalement. Le réseau local câblé maintient la communication avec le KDS et le Customer Display.

**Climax :**
Une cliente commande un assortiment complexe : croissants, boissons, modifiers spéciaux. Budi saisit tout, encaisse en espèces. La commande part en cuisine via le LAN.

**Résolution :**
45 minutes plus tard, internet revient. En quelques secondes, toutes les commandes se synchronisent avec le cloud. Aucune donnée perdue. Le manager voit l'historique complet.

**Fonctionnalités révélées :** Mode offline 2h, indicateur statut réseau, communication LAN, sync automatique, file d'attente offline

---

### Parcours 3 : Pak Wayan, le Client (Customer Display)

**Persona :** Pak Wayan, client régulier, achète pour le bureau

**Situation :** Pak Wayan vient acheter des viennoiseries pour le bureau. Il veut être sûr que sa commande est correcte.

**Scène d'ouverture :**
Pak Wayan arrive au comptoir avec une liste : 5 croissants, 3 pains au chocolat, 2 baguettes. Avant, il devait faire confiance et vérifier le ticket après.

**Action montante :**
Dès que Budi scanne le premier article, Pak Wayan voit sur l'écran face à lui chaque article s'ajouter en temps réel avec le prix.

**Climax :**
"Attendez, j'avais dit 5 croissants, pas 4 !" - Pak Wayan le voit immédiatement sur l'écran et corrige AVANT de payer.

**Résolution :**
Total affiché clairement : 185,000 IDR. Pak Wayan paie en confiance. Zéro surprise, zéro erreur. Il reviendra.

**Fonctionnalités révélées :** Customer Display temps réel, affichage articles progressif, total dynamique, interface lisible

---

### Parcours 4 : Ketut, le Cuisinier (KDS + Commandes Mobile)

**Persona :** Ketut, chef cuisine, gère le KDS

**Situation :** Ketut gère le KDS en cuisine. Avant, les commandes arrivaient uniquement de la caisse.

**Scène d'ouverture :**
Service du midi chargé. L'écran KDS affiche 3 commandes en attente.

**Action montante :**
Une nouvelle commande apparaît - envoyée par Marie depuis sa tablette en salle (Table 7). Ketut voit instantanément : 2 croissants à réchauffer, 1 sandwich.

**Climax :**
La commande est marquée avec la table d'origine. Ketut prépare et marque "Prêt". Marie reçoit la notification sur sa tablette.

**Résolution :**
Flux continu cuisine ↔ salle. Pas besoin de crier les numéros. Service fluide, cuisine organisée.

**Fonctionnalités révélées :** KDS multi-source (caisse + mobile), indication table origine, statut commande, notifications serveur

---

### Parcours 5 : Pak Made, le Manager (Supervision & Sync)

**Persona :** Pak Made, manager, supervise les opérations

**Situation :** Pak Made supervise les opérations. Il veut savoir ce qui se passe même pendant les coupures.

**Scène d'ouverture :**
Pak Made reçoit une alerte : "Connexion internet perdue à 14h15". Il consulte son tableau de bord.

**Action montante :**
Il voit le statut : "Mode Offline - 12 commandes en attente de sync". Le système fonctionne, les ventes continuent.

**Climax :**
Internet revient. En 20 secondes, tout se synchronise. Pak Made voit le rapport complet : aucune commande perdue, total des ventes intact.

**Résolution :**
Confiance totale dans le système. Pak Made peut partir en réunion sans craindre les coupures.

**Fonctionnalités révélées :** Dashboard statut sync, alertes réseau, compteur commandes offline, rapport post-sync

---

### Journey Requirements Summary

| Parcours | Utilisateur | Fonctionnalités Clés |
|----------|-------------|----------------------|
| **1. App Mobile** | Serveur | App iOS/Android, catalogue produits, modifiers, sélection table, envoi KDS |
| **2. Mode Offline** | Caissier | Offline 2h, indicateur réseau, communication LAN, sync auto |
| **3. Customer Display** | Client | Écran temps réel, articles progressifs, total dynamique |
| **4. KDS Multi-Source** | Cuisinier | Réception commandes mobile, origine table, notifications |
| **5. Supervision** | Manager | Dashboard sync, alertes, rapports |

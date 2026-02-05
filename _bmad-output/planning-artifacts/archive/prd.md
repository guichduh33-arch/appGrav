---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-reports-extension
status: 'ready-for-validation'
last_updated: '2026-02-05'
extensions:
  - reports-module (v1.1.0)
  - settings-print-server (v1.2.0)
inputDocuments:
  - CLAUDE.md
  - docs/architecture-main.md
  - docs/index.md
documentCounts:
  briefs: 0
  research: 0
  projectDocs: 20
workflowType: 'prd'
projectType: 'brownfield'
classification:
  projectType: 'web_app_mobile'
  domain: 'retail_pos_food_service'
  complexity: 'medium-high'
  projectContext: 'brownfield'
  scope:
    - module_improvements
    - inter_module_integration
    - database_optimization
    - design_enhancement
    - offline_cloud_sync
    - android_ios_integration
    - new_customer_display_module
    - reports_module_complete
---

# Product Requirements Document - AppGrav

**Version:** 1.0.0
**Author:** MamatCEO
**Date:** 2026-01-26
**Status:** Draft - Prêt pour Validation

---

## Résumé Exécutif

### Contexte
AppGrav est le système ERP/POS de The Breakery, une boulangerie artisanale française à Lombok, Indonésie. Le système gère ~200 transactions/jour et supporte trois langues (FR, EN, ID).

### Problèmes à Résoudre
1. **Coupures internet fréquentes** → Interruption des ventes
2. **Inefficacité des serveurs** → Allers-retours constants à la caisse
3. **Manque de transparence** → Clients ne voient pas leur commande

### Solution Proposée
| Module | Bénéfice |
|--------|----------|
| **Mode Offline** | 2h d'autonomie, sync automatique, zéro perte |
| **Customer Display** | Transparence temps réel pour le client |
| **App Mobile Serveurs** | Prise de commande directe en salle |
| **Communication LAN** | Continuité inter-appareils sans internet |

### Métriques de Succès
- **0 transaction perdue** lors de coupures internet
- **-50% allers-retours** des serveurs vers la caisse
- **< 500ms latence** pour le Customer Display
- **2h minimum** de fonctionnement offline

### Scope MVP
28 exigences fonctionnelles, 24 exigences non-fonctionnelles
Distribution interne (APK/IPA), Chrome uniquement, pas de stores.

---

## Table des Matières

1. [Résumé Exécutif](#résumé-exécutif)
2. [Success Criteria](#success-criteria)
3. [Product Scope](#product-scope)
4. [User Journeys](#user-journeys)
5. [Domain-Specific Requirements](#domain-specific-requirements)
6. [Web App + Mobile Specific Requirements](#web-app--mobile-specific-requirements)
7. [Project Scoping & Phased Development](#project-scoping--phased-development)
8. [Functional Requirements](#functional-requirements)
9. [Non-Functional Requirements](#non-functional-requirements)
10. [Annexes](#annexes)

---

## Success Criteria

### User Success

| Utilisateur | Critère de Succès | Mesure |
|-------------|-------------------|--------|
| **Caissier** | Continue à travailler même sans internet | 2h d'autonomie offline |
| **Serveur** | Prend les commandes en salle sans revenir à la caisse | Réduction significative des allers-retours |
| **Client** | Voit sa commande en temps réel sur l'écran | Transparence totale des articles et prix |
| **Manager** | Aucune commande perdue lors de coupures internet | Synchronisation automatique garantie |

### Business Success

| Métrique | Objectif |
|----------|----------|
| **Commandes perdues (offline)** | Zéro perte - continuité de service totale |
| **Efficacité serveurs** | -50% allers-retours vers la caisse |
| **Erreurs de commande** | Réduction grâce à la transparence client (Customer Display) |
| **Temps de service** | Amélioration par prise de commande mobile directe |

### Technical Success

| Critère | Spécification |
|---------|---------------|
| **Durée offline** | 2 heures minimum de fonctionnement autonome |
| **Synchronisation** | Automatique, < 30 secondes au retour de la connexion |
| **Réseau local** | Communication LAN câblé fonctionnelle même sans internet |
| **Customer Display** | Mise à jour temps réel (< 1 seconde de latence) |
| **App Mobile** | Synchronisation temps réel avec POS central et KDS cuisine |

### Measurable Outcomes

- **Offline**: 100% des commandes prises offline sont synchronisées sans perte
- **Transparence**: 100% des clients voient leur commande en temps réel
- **Mobilité**: Serveurs peuvent prendre commandes depuis n'importe où dans le restaurant
- **Résilience**: Zéro interruption de service lors de coupures internet < 2h

## Product Scope

### MVP - Minimum Viable Product

1. **Mode Offline POS**
   - Fonctionnement autonome 2h sans internet
   - Synchronisation automatique au retour online
   - Communication via réseau local câblé (LAN)

2. **Customer Display**
   - Affichage des articles au fur et à mesure
   - Affichage du total en temps réel
   - Interface claire et lisible

3. **App Mobile Serveurs**
   - Prise de commande en salle (Android/iOS)
   - Sélection de table
   - Envoi direct en cuisine (KDS)

4. **Infrastructure Réseau Local**
   - Communication inter-appareils sans dépendance internet
   - Synchronisation locale temps réel

### Growth Features (Post-MVP)

- Encaissement mobile en salle (paiement sur tablette serveur)
- Notifications push (commande prête pour service)
- Mode offline étendu (4h+)
- Support multi-tablettes serveurs simultanées
- Statistiques temps réel sur mobile manager

### Vision (Future)

- Commande client autonome via scan QR à table
- Analytics et reporting temps réel sur mobile
- Intégration paiement mobile (QRIS, GoPay, OVO)
- Mode kiosque self-service
- Intégration delivery platforms (GoFood, GrabFood)

## User Journeys

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

## Domain-Specific Requirements

### Compliance & Regulatory (Indonésie)

| Exigence | Description | Statut |
|----------|-------------|--------|
| **Taxe 10%** | Taxe incluse dans les prix (calcul: total × 10/110) | ✅ Implémenté |
| **Protection Données** | Données clients (fidélité, contacts) sécurisées | À renforcer |
| **Traçabilité** | Audit trail complet des transactions | Requis |

### Technical Constraints

| Contrainte | Spécification |
|------------|---------------|
| **Intégrité Offline** | Aucune perte de transaction, même en cas de coupure prolongée |
| **Horodatage** | Timestamps fiables pour la comptabilité (heure locale + UTC) |
| **Résolution Conflits** | Architecture 1 caisse = pas de conflit de numérotation |
| **Audit Trail** | Traçabilité complète incluant transactions offline avec marqueur |

### Data & Security Requirements

| Aspect | Exigence |
|--------|----------|
| **Authentification** | PIN par utilisateur avec permissions basées sur les rôles |
| **Données Client** | Stockage chiffré pour informations fidélité et contacts |
| **Transactions** | Non-répudiation, signature horodatée |
| **Backup** | Synchronisation cloud = backup automatique continu |
| **Offline Storage** | Stockage local sécurisé (IndexedDB/SQLite chiffré) |

### Integration Requirements

| Système | Type | Priorité |
|---------|------|----------|
| **Supabase Cloud** | Sync bidirectionnelle | MVP |
| **Réseau Local (LAN)** | Communication inter-appareils | MVP |
| **Imprimante Tickets** | ESC/POS via Print Server | Existant |
| **Paiements QRIS** | API paiement mobile | Post-MVP |

## Web App + Mobile Specific Requirements

### Project-Type Overview

| Aspect | Décision |
|--------|----------|
| **Type** | Web App (React SPA) + Mobile (Capacitor) |
| **Distribution Mobile** | Interne (APK/IPA direct, pas de stores) |
| **Navigateur Cible** | Chrome uniquement |
| **Notifications Push** | Non requises |
| **Fonctionnalités Natives** | Aucune (pas de caméra, bluetooth) |

### Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    APPAREILS                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ POS      │  │ Mobile   │  │ Customer │  │  KDS   │  │
│  │ (Chrome) │  │(Capacitor)│  │ Display  │  │(Chrome)│  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
└───────┼─────────────┼─────────────┼────────────┼───────┘
        │             │             │            │
        └─────────────┴──────┬──────┴────────────┘
                             │
┌────────────────────────────┴────────────────────────────┐
│                    RÉSEAU LOCAL (LAN)                    │
│            Communication temps réel même offline         │
└────────────────────────────┬────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │   SUPABASE      │
                    │   (Cloud)       │
                    │   Sync quand    │
                    │   internet OK   │
                    └─────────────────┘
```

### Technical Stack Decisions

| Domaine | Spécification |
|---------|---------------|
| **Frontend** | React 18 + TypeScript + Vite (existant) |
| **État Local** | Zustand + IndexedDB pour persistence offline |
| **Sync** | Supabase Realtime + file d'attente offline |
| **Mobile** | Capacitor (distribution APK/IPA interne) |
| **Réseau Local** | WebSocket ou HTTP local pour communication LAN |
| **Customer Display** | Route dédiée `/display` (même app, écran secondaire) |

### Implementation Simplifications

| Ce qu'on évite | Bénéfice |
|----------------|----------|
| Publication stores | Pas de review Apple/Google, déploiement rapide |
| Multi-navigateurs | Pas de tests Safari/Firefox, CSS simplifié |
| Push notifications | Pas de Firebase/APNs à configurer |
| Fonctionnalités natives | Pas de permissions complexes |

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP - Résout les 3 problèmes concrets identifiés

| Problème | Solution MVP |
|----------|--------------|
| Coupures internet fréquentes | Mode Offline 2h + Sync auto |
| Inefficacité serveurs (allers-retours) | App Mobile commandes |
| Erreurs commandes / manque transparence | Customer Display temps réel |

**Équipe Minimum:** 1-2 développeurs fullstack (React + Supabase)

### MVP Feature Set (Phase 1)

**Parcours Utilisateurs Supportés:**
- ✅ Marie (Serveur) - Prise commande mobile
- ✅ Budi (Caissier) - Continuité offline
- ✅ Pak Wayan (Client) - Transparence display
- ✅ Ketut (Cuisinier) - Réception commandes multi-source
- ✅ Pak Made (Manager) - Supervision sync

**Must-Have Capabilities:**

| Fonctionnalité | Criticité | Justification |
|----------------|-----------|---------------|
| Mode Offline 2h | CRITIQUE | Sans ça, échec à chaque coupure |
| Sync automatique | CRITIQUE | Sans ça, données perdues |
| Communication LAN | CRITIQUE | Permet offline inter-appareils |
| Customer Display | HAUTE | Valeur immédiate client |
| App Mobile commandes | HAUTE | Élimine allers-retours |
| Envoi KDS depuis mobile | HAUTE | Complète le flux serveur |

### Post-MVP Features

**Phase 2 (Growth) - Post-MVP:**

| Fonctionnalité | Raison d'attendre |
|----------------|-------------------|
| Encaissement mobile en salle | Sécurité paiement à renforcer |
| Notifications push (commande prête) | Amélioration, pas essentiel |
| Mode offline étendu (4h+) | 2h couvre 95% des cas |
| Multi-tablettes serveurs | 1 tablette suffit au départ |
| Stats temps réel mobile manager | Nice-to-have |

**Phase 3 (Expansion) - Vision Future:**

| Fonctionnalité | Raison d'attendre |
|----------------|-------------------|
| Commande client autonome (QR) | Changement comportement client |
| Intégration QRIS/GoPay/OVO | Intégration externe complexe |
| Mode kiosque self-service | Nouveau use case |
| Intégration GoFood/GrabFood | Nouveau marché |
| Analytics mobile avancés | Dépend de données accumulées |

### Risk Mitigation Strategy

**Risques Techniques:**

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Complexité sync offline | Moyenne | Haut | Architecture 1 caisse = pas de conflits |
| Communication LAN instable | Faible | Haut | Tests sur réseau réel The Breakery |
| Performance IndexedDB | Faible | Moyen | Limiter données locales à 2h |

**Risques Marché:**

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Résistance adoption mobile | Moyenne | Moyen | Formation + interface ultra-simple |
| Clients ignorent le display | Faible | Faible | Positionnement visible |

**Risques Ressources:**

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Délais développement | Moyenne | Moyen | MVP minimaliste, itérer après |
| Budget limité | Faible | Moyen | Pas de stores = économies |

## Functional Requirements

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

## Non-Functional Requirements

### Performance Requirements

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-P1** | Latence Customer Display | Temps entre action POS et affichage | < 500ms en LAN |
| **NFR-P2** | Temps de synchronisation | Durée sync après retour internet | < 30 secondes pour 50 transactions |
| **NFR-P3** | Temps de réponse app mobile | Temps entre tap et feedback | < 200ms |
| **NFR-P4** | Temps d'envoi commande au KDS | Depuis mobile ou POS | < 1 seconde |
| **NFR-P5** | Démarrage app mobile | Cold start | < 3 secondes |

### Reliability Requirements

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-R1** | Durée mode offline | Fonctionnement sans internet | 2 heures minimum |
| **NFR-R2** | Intégrité des données offline | Transactions perdues | 0 (zéro perte) |
| **NFR-R3** | Récupération après crash | Perte de données en cas de crash app | 0 transaction en cours perdue |
| **NFR-R4** | Capacité stockage offline | Transactions stockables localement | 500 transactions minimum |
| **NFR-R5** | Fiabilité sync | Taux de succès synchronisation | 99.9% |

### Availability Requirements

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-A1** | Disponibilité système POS | Uptime pendant heures d'ouverture | 99.5% (hors maintenance planifiée) |
| **NFR-A2** | Basculement offline | Temps transition online→offline | Transparent, < 2 secondes |
| **NFR-A3** | Communication LAN | Disponibilité réseau local | Indépendante d'internet |

### Security Requirements

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-S1** | Authentification | Type d'authentification | PIN 4-6 chiffres par utilisateur |
| **NFR-S2** | Expiration session | Timeout d'inactivité | 30 minutes (configurable) |
| **NFR-S3** | Stockage local sécurisé | Protection données offline | IndexedDB avec app encapsulée |
| **NFR-S4** | Transmission réseau local | Chiffrement LAN | HTTPS/WSS ou réseau isolé |
| **NFR-S5** | Audit trail | Traçabilité des actions | 100% des transactions loguées |

### Usability Requirements

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-U1** | Lisibilité Customer Display | Taille texte minimum | 24px pour prix, 18px pour articles |
| **NFR-U2** | Interface tactile | Taille zone cliquable | 44x44px minimum |
| **NFR-U3** | Feedback utilisateur | Indication visuelle action | < 100ms après interaction |
| **NFR-U4** | Indicateur statut réseau | Visibilité statut online/offline | Toujours visible, code couleur clair |

### Maintainability Requirements

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-M1** | Déploiement app mobile | Méthode distribution | APK/IPA direct (pas de store) |
| **NFR-M2** | Mise à jour | Processus update | Manuel via download APK/IPA |
| **NFR-M3** | Logs diagnostic | Niveau de détail | Erreurs + warnings + actions critiques |

### Compatibility Requirements

| NFR ID | Exigence | Spécification |
|--------|----------|---------------|
| **NFR-C1** | Navigateur POS/KDS/Display | Chrome 100+ uniquement |
| **NFR-C2** | App Mobile iOS | iOS 14+ via Capacitor |
| **NFR-C3** | App Mobile Android | Android 8+ (API 26+) via Capacitor |
| **NFR-C4** | Réseau local | Ethernet 100Mbps minimum |

### NFR Priority Matrix

| Priorité | NFR IDs | Justification |
|----------|---------|---------------|
| **P0 - Bloquant** | NFR-R1, NFR-R2, NFR-P1, NFR-A2 | Core MVP: offline fonctionne, aucune perte |
| **P1 - Critique** | NFR-P2, NFR-P4, NFR-S1, NFR-S5 | Expérience utilisateur essentielle |
| **P2 - Important** | NFR-P3, NFR-P5, NFR-U1-U4, NFR-A3 | Qualité de service |
| **P3 - Souhaité** | NFR-R4, NFR-M1-M3, NFR-C1-C4 | Opérations et maintenance |

---

## Annexes

### A. Glossaire

| Terme | Définition |
|-------|------------|
| **POS** | Point of Sale - Caisse enregistreuse |
| **KDS** | Kitchen Display System - Écran cuisine |
| **LAN** | Local Area Network - Réseau local câblé |
| **Offline Mode** | Fonctionnement sans connexion internet |
| **Customer Display** | Écran client face au comptoir |
| **Modifier** | Option/personnalisation sur un produit |
| **Capacitor** | Framework pour apps mobiles natives depuis React |
| **IndexedDB** | Base de données locale navigateur |
| **Supabase** | Backend-as-a-Service (base de données cloud) |
| **IDR** | Indonesian Rupiah - Devise indonésienne |

### B. Documents de Référence

| Document | Localisation |
|----------|--------------|
| Architecture Main App | `docs/architecture-main.md` |
| Guide Développement | `CLAUDE.md` |
| Documentation Index | `docs/index.md` |
| Module Combos | `docs/COMBOS_AND_PROMOTIONS.md` |
| Module Stock | `docs/STOCK_MOVEMENTS_MODULE.md` |
| Architecture Print Server | `docs/architecture-print-server.md` |
| Module Settings ERP | `docs/prompt-module-settings-erp.md` |

### C. Matrice de Traçabilité FR → NFR

| Fonctionnalité | FR | NFR Associés |
|----------------|-----|--------------|
| Mode Offline 2h | FR1-FR6 | NFR-R1, NFR-R2, NFR-R4, NFR-A2 |
| Customer Display | FR7-FR10 | NFR-P1, NFR-U1, NFR-U3 |
| App Mobile | FR11-FR17 | NFR-P3, NFR-P5, NFR-U2, NFR-C2, NFR-C3 |
| Communication LAN | FR18-FR20 | NFR-P1, NFR-A3, NFR-C4 |
| KDS Améliorations | FR21-FR24 | NFR-P4, NFR-S5 |
| Supervision | FR25-FR28 | NFR-P2, NFR-S5, NFR-U4 |

### D. Hypothèses et Dépendances

**Hypothèses:**
- Réseau local câblé (Ethernet) disponible et fonctionnel
- Une seule caisse POS (pas de conflits de numérotation)
- Utilisateurs formés sur l'interface existante AppGrav
- Tablette Android ou iPad disponible pour l'app serveurs

**Dépendances:**
- Supabase project actif et configuré
- Print-Server local opérationnel
- Infrastructure réseau The Breakery fonctionnelle

---

## Historique des Versions

| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 1.0.0 | 2026-01-26 | MamatCEO | Version initiale - PRD complet |

---

*Document généré avec le workflow BMAD PRD v1.0*

---

# Extension PRD - Module Reports & Analytics

**Version Extension:** 1.1.0
**Date:** 2026-01-28
**Auteur:** Guich

---

## Contexte Module Reports

### État Actuel
Le module Reports existe partiellement avec 11 composants sur 26 rapports définis dans la configuration.

| Catégorie | Implémenté | À implémenter |
|-----------|------------|---------------|
| **Overview** | Dashboard KPIs | - |
| **Sales** | Daily Sales, Product Performance, Sales by Category, Payment Methods | Sales by Customer, Sales by Hour, Profit/Loss, Cancellations |
| **Inventory** | Stock Movement, Inventory Valuation | Stock Balance, Stock Warning, Expired Stock |
| **Purchases** | Purchase Details, Purchase by Supplier | Purchase Returns, Outstanding Payments |
| **Finance** | - | Cash Balance, Receivables, Expenses |
| **Audit** | General Audit Log | Price Changes, Deleted Products |

### Infrastructure Existante
- **ReportingService** : 15+ méthodes de récupération de données
- **Système d'alertes** : Détection d'anomalies (voids, stock négatif, changements de prix)
- **Export CSV** : Sales, Inventory, Customers, Stock Movements, Purchase Orders
- **Vues SQL** : view_daily_kpis, view_payment_method_stats, view_inventory_valuation, view_stock_waste

### Objectifs
1. Compléter tous les rapports manquants (15+ rapports)
2. Ajouter Date Range Picker personnalisable
3. Implémenter filtres avancés (produit, catégorie, employé, méthode paiement)
4. Activer drill-down (catégorie → produits → transactions)
5. Ajouter export PDF professionnel
6. Configurer permissions par rôle

---

## User Journeys - Module Reports

### Parcours 6 : Pak Made, le Manager (Analytics & Décisions)

**Persona :** Pak Made, manager de The Breakery, supervise les opérations quotidiennes

**Situation :** Pak Made doit comprendre la performance du restaurant pour prendre des décisions stratégiques. Il a besoin de données claires, pas de chiffres bruts.

**Scène d'ouverture :**
C'est lundi matin, 8h. Pak Made arrive et veut comprendre comment s'est passée la semaine dernière. Il ouvre le module Reports sur son PC.

**Action montante :**
Il sélectionne une plage de dates personnalisée (semaine dernière) via le Date Range Picker. Le dashboard lui montre les KPIs : chiffre d'affaires +12%, panier moyen 85,000 IDR, 1,247 commandes.

**Climax :**
Il clique sur "Sales by Category" et voit que les viennoiseries représentent 45% du CA. Il drill-down sur cette catégorie et découvre que les croissants nature ont explosé (+35%) grâce à une promo qu'il avait oubliée. Il exporte le rapport en PDF pour la réunion d'équipe.

**Résolution :**
Pak Made a les insights pour reconduire la promo croissants. Il identifie aussi que les boissons chaudes sont en baisse (-8%) → action : former les serveurs à suggérer un café.

**Fonctionnalités révélées :** Date Range Picker, Dashboard KPIs, Sales by Category, Drill-down, Export PDF, Comparaison périodes

---

### Parcours 7 : Ibu Ayu, la Comptable (Finance & Réconciliation)

**Persona :** Ibu Ayu, comptable externe, vient 2x/mois pour les comptes

**Situation :** Ibu Ayu doit réconcilier les ventes avec les encaissements et préparer les déclarations fiscales.

**Scène d'ouverture :**
C'est le 15 du mois. Ibu Ayu a besoin des rapports financiers pour clôturer la période.

**Action montante :**
Elle accède au module Reports avec son compte "comptable". Elle génère le rapport "Profit/Loss" pour le mois écoulé : revenus bruts 45M IDR, coût des marchandises 18M IDR, marge brute 27M IDR.

**Climax :**
Elle consulte le rapport "Payment Methods" et voit une différence de 500,000 IDR entre les paiements carte enregistrés et le relevé bancaire. Elle drill-down sur les transactions carte, filtre par date suspecte, et identifie 3 transactions annulées non remboursées.

**Résolution :**
Elle exporte les rapports en PDF et CSV pour ses archives. Le rapport des taxes (10% incluses) lui donne directement le montant à déclarer : 4.09M IDR.

**Fonctionnalités révélées :** Rapport Profit/Loss, Payment Methods détaillé, Filtres avancés, Drill-down transactions, Export PDF/CSV, Calcul taxes automatique

---

### Parcours 8 : Marie, la Serveuse (Performance personnelle)

**Persona :** Marie, serveuse, veut suivre sa performance

**Situation :** Marie est payée avec un bonus basé sur ses ventes. Elle veut voir sa performance.

**Scène d'ouverture :**
Fin de journée. Marie veut savoir combien elle a vendu aujourd'hui.

**Action montante :**
Elle ouvre l'app mobile et accède à "Mes Rapports" (vue limitée à ses propres ventes). Elle voit : 42 commandes, 3.2M IDR de ventes, panier moyen 76,000 IDR.

**Climax :**
Elle compare avec la semaine dernière. Son panier moyen a augmenté de 12% depuis qu'elle suggère systématiquement des viennoiseries avec le café.

**Résolution :**
Marie est motivée. Elle sait que son bonus ce mois-ci sera bon. Elle partage ses "best practices" avec les autres serveurs.

**Fonctionnalités révélées :** Rapports filtrés par utilisateur, Vue mobile, Comparaisons, Permissions par rôle

---

### Parcours 9 : Budi, le Caissier (Clôture de session)

**Persona :** Budi, caissier, clôture sa session chaque soir

**Situation :** Budi doit réconcilier sa caisse avant de partir.

**Scène d'ouverture :**
21h, fin de service. Budi clôture sa session POS.

**Action montante :**
Il accède au rapport "Session Summary" qui lui montre : 89 transactions, 7.2M IDR encaissés, répartition espèces/carte/QRIS.

**Climax :**
Le rapport "Cash Balance" indique un écart de -15,000 IDR entre le théorique et le réel. Budi vérifie les annulations du jour : une erreur de rendu monnaie identifiée.

**Résolution :**
Budi note l'écart dans le système avec la raison. Le manager pourra voir cette information dans le rapport d'audit.

**Fonctionnalités révélées :** Session Summary, Cash Balance, Historique annulations, Notes d'écart, Audit trail

---

### Parcours 10 : Ketut, le Cuisinier (Gestion Stock & Alertes)

**Persona :** Ketut, chef cuisine, gère les stocks de production

**Situation :** Ketut doit anticiper les ruptures et gérer la production.

**Scène d'ouverture :**
6h du matin. Ketut prépare la production du jour.

**Action montante :**
Il consulte le rapport "Stock Warning" qui affiche les produits en alerte : farine en zone critique (< 5kg), beurre en warning (< 10kg), levure OK.

**Climax :**
Il vérifie le rapport "Stock Movement" pour comprendre la consommation récente. Il filtre sur "farine" et voit que la consommation a doublé cette semaine (nouvelle recette de brioche). Il consulte aussi "Expired Stock" : 2kg de crème fraîche expire demain.

**Résolution :**
Ketut passe commande d'urgence de farine et décide d'utiliser la crème fraîche aujourd'hui pour des quiches. Zéro gaspillage, zéro rupture.

**Fonctionnalités révélées :** Stock Warning avec seuils visuels, Stock Movement avec filtres produit, Expired Stock, Historique consommation

---

### Journey Requirements Summary - Module Reports

| Parcours | Utilisateur | Fonctionnalités Clés |
|----------|-------------|----------------------|
| **6. Analytics** | Manager | Date Range Picker, Dashboard KPIs, Drill-down, Export PDF, Comparaisons |
| **7. Finance** | Comptable | Profit/Loss, Payment Methods, Filtres avancés, Réconciliation, Export PDF/CSV |
| **8. Performance** | Serveur | Rapports personnels, Vue mobile, Comparaisons, Permissions rôle |
| **9. Clôture** | Caissier | Session Summary, Cash Balance, Annulations, Audit |
| **10. Stock** | Cuisinier | Stock Warning, Stock Movement, Expired Stock, Filtres produit |

---

## Functional Requirements - Module Reports

### Infrastructure Reports

- **FR29:** Le Système peut afficher un Date Range Picker permettant de sélectionner des périodes personnalisées (aujourd'hui, hier, cette semaine, ce mois, personnalisé)
- **FR30:** Le Système peut appliquer des filtres avancés sur les rapports (par produit, catégorie, employé, méthode de paiement)
- **FR31:** Le Système peut permettre le drill-down depuis une vue agrégée vers les détails (catégorie → produits → transactions)
- **FR32:** Le Système peut exporter les rapports en format CSV
- **FR33:** Le Système peut exporter les rapports en format PDF avec mise en page professionnelle
- **FR34:** Le Système peut restreindre l'accès aux rapports selon les permissions du rôle utilisateur

### Rapports de Ventes

- **FR35:** Le Manager peut voir un rapport Profit/Loss avec revenus bruts, coûts, marge brute et marge nette
- **FR36:** Le Manager peut voir un rapport Sales by Customer avec CA par client et fréquence d'achat
- **FR37:** Le Manager peut voir un rapport Sales by Hour montrant les pics d'activité par tranche horaire
- **FR38:** Le Manager peut voir un rapport Cancellations listant les commandes annulées avec raisons
- **FR39:** Le Manager peut comparer deux périodes sur n'importe quel rapport de ventes

### Rapports d'Inventaire

- **FR40:** Le Cuisinier peut voir un rapport Stock Balance avec quantités actuelles vs seuils d'alerte
- **FR41:** Le Cuisinier peut voir un rapport Stock Warning affichant uniquement les produits en alerte (< seuil)
- **FR42:** Le Cuisinier peut voir un rapport Expired Stock listant les produits proches de la date de péremption
- **FR43:** Le Manager peut voir un rapport Unsold Products identifiant les produits sans vente sur une période

### Rapports Finance & Paiements

- **FR44:** La Comptable peut voir un rapport Cash Balance avec réconciliation espèces théorique vs réel
- **FR45:** La Comptable peut voir un rapport Receivables listant les créances clients B2B en attente
- **FR46:** La Comptable peut voir un rapport Expenses avec les dépenses par catégorie (achats, pertes, ajustements)
- **FR47:** La Comptable peut voir le détail des taxes collectées (10% inclus) pour les déclarations

### Rapports Achats

- **FR48:** Le Manager peut voir un rapport Purchase Returns avec les retours fournisseurs et motifs
- **FR49:** Le Manager peut voir un rapport Outstanding Payments listant les factures fournisseurs impayées

### Rapports Audit & Logs

- **FR50:** Le Manager peut voir un rapport Price Changes traçant toutes les modifications de prix
- **FR51:** Le Manager peut voir un rapport Deleted Products avec historique des produits supprimés
- **FR52:** Le Système peut enregistrer toutes les actions utilisateur dans un audit trail consultable

### Alertes & Notifications

- **FR53:** Le Système peut générer des alertes automatiques pour les anomalies (taux d'annulation élevé, stock négatif, écart de caisse)
- **FR54:** Le Manager peut configurer les seuils d'alerte pour chaque type d'anomalie
- **FR55:** Le Manager peut voir un tableau de bord des alertes avec filtres (non lues, non résolues, par sévérité)
- **FR56:** Le Manager peut marquer une alerte comme résolue avec une note explicative

---

## Non-Functional Requirements - Module Reports

### Performance

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-RP1** | Temps de chargement rapport | Durée affichage initial | < 2 secondes pour 30 jours de données |
| **NFR-RP2** | Temps drill-down | Durée navigation détail | < 500ms |
| **NFR-RP3** | Génération export CSV | Durée téléchargement | < 5 secondes pour 10,000 lignes |
| **NFR-RP4** | Génération export PDF | Durée création document | < 10 secondes |
| **NFR-RP5** | Filtrage temps réel | Durée application filtres | < 300ms |

### Disponibilité

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-RA1** | Rapports en mode offline | Accès aux données locales | Données des 7 derniers jours disponibles offline |
| **NFR-RA2** | Cache des rapports | Durée validité cache | 5 minutes (configurable) |

### Sécurité

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-RS1** | Contrôle d'accès | Granularité permissions | Par catégorie de rapport |
| **NFR-RS2** | Audit des accès | Traçabilité consultation | 100% des accès rapports loggés |
| **NFR-RS3** | Protection exports | Filigrane PDF | Nom utilisateur + date sur exports |

### Utilisabilité

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-RU1** | Visualisations | Types graphiques | Bar, Line, Pie, Table minimum |
| **NFR-RU2** | Responsive | Affichage mobile | Rapports consultables sur tablette/mobile |
| **NFR-RU3** | Accessibilité couleurs | Contraste | Graphiques lisibles pour daltoniens |

---

## Matrice de Traçabilité - Module Reports

| Fonctionnalité | FR | NFR Associés |
|----------------|-----|--------------|
| Date Range Picker | FR29 | NFR-RU1 |
| Filtres avancés | FR30 | NFR-RP5 |
| Drill-down | FR31 | NFR-RP2 |
| Export CSV | FR32 | NFR-RP3 |
| Export PDF | FR33 | NFR-RP4, NFR-RS3 |
| Permissions | FR34 | NFR-RS1, NFR-RS2 |
| Rapports Sales | FR35-FR39 | NFR-RP1 |
| Rapports Inventory | FR40-FR43 | NFR-RP1, NFR-RA1 |
| Rapports Finance | FR44-FR47 | NFR-RP1, NFR-RS1 |
| Rapports Achats | FR48-FR49 | NFR-RP1 |
| Audit & Logs | FR50-FR52 | NFR-RS2 |
| Alertes | FR53-FR56 | NFR-RA2 |

---

## Permissions par Rôle - Module Reports

| Rapport/Fonctionnalité | Admin | Manager | Comptable | Caissier | Serveur | Cuisinier |
|------------------------|-------|---------|-----------|----------|---------|-----------|
| Dashboard Overview | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Sales Reports (tous) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Sales (ventes perso) | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Inventory Reports | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Finance Reports | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cash Balance | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Purchase Reports | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Alertes Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Export PDF/CSV | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## Codes de Permission - Module Reports

```
reports.view           - Accès de base au module reports
reports.sales          - Rapports de ventes complets
reports.sales.personal - Ventes personnelles uniquement
reports.inventory      - Rapports d'inventaire
reports.finance        - Rapports financiers
reports.purchases      - Rapports achats
reports.audit          - Logs d'audit
reports.alerts         - Dashboard d'alertes
reports.export         - Export PDF/CSV
reports.configure      - Configuration des seuils d'alerte
```

---

## Priorités d'Implémentation - Module Reports

### Phase 1 - Infrastructure (Critique)

| Priorité | Fonctionnalité | FR | Effort |
|----------|----------------|-----|--------|
| P0 | Date Range Picker | FR29 | Moyen |
| P0 | Permissions par rôle | FR34 | Moyen |
| P1 | Filtres avancés | FR30 | Moyen |
| P1 | Export CSV amélioré | FR32 | Faible |

### Phase 2 - Rapports Ventes (Haute)

| Priorité | Fonctionnalité | FR | Effort |
|----------|----------------|-----|--------|
| P1 | Profit/Loss | FR35 | Élevé |
| P1 | Sales by Customer | FR36 | Moyen |
| P2 | Sales by Hour | FR37 | Moyen |
| P2 | Cancellations | FR38 | Faible |

### Phase 3 - Rapports Inventaire (Haute)

| Priorité | Fonctionnalité | FR | Effort |
|----------|----------------|-----|--------|
| P1 | Stock Warning | FR41 | Moyen |
| P1 | Expired Stock | FR42 | Moyen |
| P2 | Stock Balance | FR40 | Faible |

### Phase 4 - Finance & Achats (Moyenne)

| Priorité | Fonctionnalité | FR | Effort |
|----------|----------------|-----|--------|
| P2 | Cash Balance | FR44 | Moyen |
| P2 | Receivables B2B | FR45 | Moyen |
| P3 | Expenses | FR46 | Moyen |
| P3 | Outstanding Payments | FR49 | Faible |

### Phase 5 - Avancé (Basse)

| Priorité | Fonctionnalité | FR | Effort |
|----------|----------------|-----|--------|
| P3 | Drill-down | FR31 | Élevé |
| P3 | Export PDF | FR33 | Élevé |
| P3 | Price Changes audit | FR50 | Moyen |
| P4 | Configuration alertes | FR54 | Moyen |

---

## Dépendances Techniques - Module Reports

### Nouvelles Vues SQL Requises

```sql
-- Vue Profit/Loss
CREATE VIEW view_profit_loss AS ...

-- Vue Sales by Customer
CREATE VIEW view_sales_by_customer AS ...

-- Vue Stock Warning
CREATE VIEW view_stock_warning AS ...

-- Vue Expired Stock
CREATE VIEW view_expired_stock AS ...

-- Vue Cash Balance par session
CREATE VIEW view_session_cash_balance AS ...
```

### Nouveaux Types TypeScript

```typescript
// src/types/reporting.ts - Extensions
interface ProfitLossReport { ... }
interface SalesByCustomerReport { ... }
interface StockWarningReport { ... }
interface ExpiredStockReport { ... }
```

### Composants UI Requis

- `DateRangePicker.tsx` - Sélecteur de période
- `ReportFilters.tsx` - Panneau de filtres avancés
- `DrilldownTable.tsx` - Table avec navigation drill-down
- `PdfExporter.tsx` - Générateur PDF (jspdf ou react-pdf)

---

*Extension PRD générée avec le workflow BMAD v1.0 - 2026-01-28*

---

# Extension PRD - Settings UI & Print Server

**Version Extension:** 1.2.0
**Date:** 2026-02-05
**Auteur:** MamatCEO

---

## Contexte

### État Actuel

Suite à l'analyse de la documentation existante (`docs/`), deux modules ont été identifiés comme documentés mais non couverts par les exigences fonctionnelles :

1. **Settings UI** - Pages de configuration complètes (entreprise, imprimantes, notifications, audit)
2. **Print Server** - Serveur d'impression thermique local (Node.js/Express)

### Infrastructure Existante

- **Table `settings`** : Configuration clé-valeur existante
- **Table `printer_configurations`** : Configuration imprimantes (à créer)
- **Table `audit_logs`** : Historique des actions système
- **Print Server** : Architecture documentée dans `docs/architecture-print-server.md`

---

## User Journeys - Settings & Printing

### Parcours 11 : Admin, Configuration Système

**Persona :** Admin système, configure l'application

**Situation :** L'admin doit configurer les informations de l'entreprise pour les tickets et rapports.

**Scène d'ouverture :**
Premier jour d'installation. L'admin ouvre `/settings/company`.

**Action montante :**
Il remplit les champs : nom entreprise "The Breakery", raison sociale, NPWP, adresse à Lombok, téléphone, email, et upload le logo.

**Climax :**
Il sauvegarde et vérifie un ticket de test. Le logo et les informations apparaissent correctement en en-tête.

**Résolution :**
Tous les tickets et rapports affichent désormais les informations officielles de l'entreprise.

**Fonctionnalités révélées :** Company Settings UI, Upload logo Supabase Storage, Preview ticket

---

### Parcours 12 : Admin, Configuration Imprimantes

**Persona :** Admin technique, configure le matériel

**Situation :** L'admin doit configurer les imprimantes thermiques pour caisse et cuisine.

**Scène d'ouverture :**
L'admin ouvre `/settings/printing` et voit une liste vide.

**Action montante :**
Il ajoute une première imprimante : nom "Caisse Principale", type "receipt", connexion "network", IP "192.168.1.100", port 9100.

**Climax :**
Il clique sur "Test d'impression". Un ticket de test sort de l'imprimante. Succès ! Il ajoute ensuite l'imprimante cuisine.

**Résolution :**
Les deux imprimantes sont configurées et testées. Le système est prêt pour la production.

**Fonctionnalités révélées :** Printer Configuration UI, CRUD imprimantes, Test d'impression, Types (receipt/kitchen/barista)

---

### Parcours 13 : Manager, Consultation Audit Logs

**Persona :** Pak Made, manager, vérifie les modifications

**Situation :** Pak Made suspecte une modification de prix non autorisée.

**Scène d'ouverture :**
Pak Made ouvre `/settings/audit` pour vérifier l'historique.

**Action montante :**
Il filtre par action "update", table "products", et date d'hier. Il voit 3 modifications.

**Climax :**
Une modification suspecte : le prix du croissant a été changé de 15,000 à 12,000 IDR par un utilisateur inattendu.

**Résolution :**
Pak Made exporte le log en CSV, corrige le prix, et discute avec l'utilisateur concerné.

**Fonctionnalités révélées :** Audit Log Viewer, Filtres avancés, Export CSV, Valeurs avant/après

---

## Functional Requirements - Settings UI

### Configuration Entreprise

- **FR57:** L'Admin peut configurer les informations de l'entreprise (nom, raison sociale, NPWP, adresse, téléphone, email)
- **FR58:** L'Admin peut uploader un logo d'entreprise vers Supabase Storage
- **FR59:** Le Système peut afficher les informations entreprise sur les tickets et rapports

### Configuration Imprimantes

- **FR60:** L'Admin peut voir la liste des imprimantes configurées avec leur statut
- **FR61:** L'Admin peut ajouter une nouvelle imprimante (nom, type receipt/kitchen/barista, connexion USB/network, IP/port)
- **FR62:** L'Admin peut modifier ou supprimer une imprimante existante
- **FR63:** L'Admin peut tester une imprimante configurée (impression ticket test)

### Configuration Notifications

- **FR64:** L'Admin peut configurer le serveur SMTP pour les notifications email
- **FR65:** L'Admin peut activer/désactiver les alertes automatiques (stock bas, rapport quotidien)
- **FR66:** L'Admin peut envoyer un email de test pour vérifier la configuration SMTP

### Consultation Audit Logs

- **FR67:** Le Manager peut consulter l'historique des actions système (timestamp, utilisateur, action, table, anciennes/nouvelles valeurs)
- **FR68:** Le Manager peut filtrer les logs par utilisateur, action, table ou période
- **FR69:** Le Manager peut exporter les logs filtrés en format CSV

---

## Functional Requirements - Print Server

### Déploiement & Infrastructure

- **FR70:** L'Admin peut déployer le print-server Node.js/Express sur le PC caisse
- **FR71:** Le Système peut écouter sur le port 3001 (localhost + LAN accessible)
- **FR72:** Le Système peut exposer un endpoint `/health` pour vérifier le statut du serveur
- **FR73:** Le Système peut enregistrer les logs avec rotation quotidienne

### Impression Tickets

- **FR74:** Le Caissier peut imprimer automatiquement un ticket de caisse après paiement (si activé)
- **FR75:** Le Système peut formater les tickets en ESC/POS (logo, items, TVA, total, 80mm)
- **FR76:** Le Cuisinier peut recevoir un ticket papier pour chaque commande envoyée en cuisine
- **FR77:** Le Barista peut recevoir ses tickets boissons sur une imprimante séparée (optionnel)

### Tiroir-Caisse

- **FR78:** Le Caissier peut ouvrir le tiroir-caisse automatiquement après paiement cash
- **FR79:** Le Système peut logger chaque ouverture du tiroir-caisse (user_id, timestamp, reason)

---

## Non-Functional Requirements - Settings & Print Server

### Performance

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-SET1** | Temps chargement settings | Page settings | < 1 seconde |
| **NFR-SET2** | Upload logo | Temps upload | < 5 secondes pour 1MB |
| **NFR-PRT1** | Latence impression | Temps entre paiement et ticket | < 2 secondes |
| **NFR-PRT2** | Disponibilité print server | Uptime | 99% pendant heures d'ouverture |

### Sécurité

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-SET3** | Accès settings | Permission requise | `settings.update` |
| **NFR-SET4** | Audit access | Permission requise | `reports.audit` |
| **NFR-PRT3** | Print server isolé | Réseau | LAN uniquement, pas internet |

### Fiabilité

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-PRT4** | Graceful degradation | Sans print server | Système fonctionne, impression désactivée |
| **NFR-PRT5** | Retry impression | Échecs réseau | 3 tentatives avec backoff |

---

## Matrice de Traçabilité - Settings & Print Server

| Fonctionnalité | FR | NFR Associés | Story |
|----------------|-----|--------------|-------|
| Company Settings UI | FR57-FR59 | NFR-SET1, NFR-SET2, NFR-SET3 | 1.6 |
| Printer Configuration UI | FR60-FR63 | NFR-SET1, NFR-SET3 | 1.7 |
| Notification Settings UI | FR64-FR66 | NFR-SET1, NFR-SET3 | 1.8 |
| Audit Log Viewer | FR67-FR69 | NFR-SET1, NFR-SET4 | 1.9 |
| Print Server Deployment | FR70-FR73 | NFR-PRT2, NFR-PRT3, NFR-PRT4 | 7.11 |
| Receipt Printing | FR74-FR75 | NFR-PRT1, NFR-PRT5 | 7.12 |
| Kitchen Ticket Printing | FR76 | NFR-PRT1, NFR-PRT5 | 7.13 |
| Cash Drawer Control | FR78-FR79 | NFR-PRT1 | 7.14 |
| Barista Ticket Printing | FR77 | NFR-PRT1 | 7.15 |

---

## Dépendances Techniques

### Tables SQL Requises

```sql
-- Table printer_configurations (nouvelle)
CREATE TABLE printer_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('receipt', 'kitchen', 'barista')),
  connection_type VARCHAR(20) NOT NULL CHECK (connection_type IN ('usb', 'network')),
  ip_address VARCHAR(45),
  port INTEGER DEFAULT 9100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Endpoints Print Server

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/health` | GET | Statut serveur |
| `/print/receipt` | POST | Impression ticket caisse |
| `/print/kitchen` | POST | Impression ticket cuisine |
| `/print/barista` | POST | Impression ticket barista |
| `/drawer/open` | POST | Ouverture tiroir-caisse |

### Permissions Requises

```
settings.view          - Consultation settings
settings.update        - Modification settings
settings.printing      - Configuration imprimantes
settings.notifications - Configuration SMTP/alertes
reports.audit          - Consultation audit logs
```

---

## Historique des Versions

| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 1.0.0 | 2026-01-26 | MamatCEO | Version initiale - PRD complet |
| 1.1.0 | 2026-01-28 | Guich | Extension Module Reports |
| 1.2.0 | 2026-02-05 | MamatCEO | Extension Settings UI & Print Server (FR57-FR79) |

---

*Extension PRD générée avec le workflow BMAD v1.0 - 2026-02-05*


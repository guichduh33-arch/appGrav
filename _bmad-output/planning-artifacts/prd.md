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
status: 'ready-for-validation'
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


# Story 7.10: Offline Period Logging

Status: ready-for-dev

## Story

As a **Manager**,
I want **voir l'historique des périodes offline**,
So that **je peux analyser la fiabilité de notre fournisseur internet et notre productivité hors-ligne**.

## Acceptance Criteria

### AC1: Détection et Enregistrement Automatique
**Given** une coupure de la connexion Supabase/Internet
**When** l'app passe en mode hors-ligne
**Then** elle enregistre localement le timestamp de début
**And** dès le retour d'internet, elle clôture la période et l'envoie au serveur

### AC2: Statistiques par Période
**Given** le journal des coupures
**When** je le consulte
**Then** je vois pour chaque incident: Heure de début, Heure de fin, Durée totale, et le nombre de transactions effectuées durant cette période

### AC3: Rapport de Disponibilité Mensuel
**Given** les données de monitoring
**When** je génère le rapport
**Then** le système calcule le pourcentage de "Uptime" internet pour le mois en cours

## Tasks

- [ ] **Task 1: Service de Logging Offline**
  - [ ] 1.1: Créer `src/services/lan/networkAuditService.ts`
  - [ ] 1.2: S'abonner aux changements de `networkStore`

- [ ] **Task 2: Stockage et Sync**
  - [ ] 2.1: Créer la table `network_incidents` dans Supabase
  - [ ] 2.2: Implémenter la sync des logs d'incidents

- [ ] **Task 3: Rapport UI**
  - [ ] 3.1: Créer une vue graphique simple (Timeline) des coupures dans les rapports admin

## Dev Notes

### Accuracy
- Ignorer les micro-coupures < 10 secondes pour éviter le bruit dans les logs.
- Très important pour la maintenance préventive du hardware réseau.

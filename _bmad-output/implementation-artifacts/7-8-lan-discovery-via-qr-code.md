# Story 7.8: LAN Discovery via QR Code

Status: ready-for-dev

## Story

As a **Appareil (Mobile/Display/KDS)**,
I want **découvrir le POS via QR code**,
So that **je n'ai pas à saisir d'adresse IP manuellement lors de la configuration**.

## Acceptance Criteria

### AC1: Génération du QR Code Configuration
**Given** le POS principal (Hub) est opérationnel
**When** j'ouvre `Settings > LAN Hub`
**Then** un QR code s'affiche contenant l'URL de connexion (ex: `ws://192.168.1.50:3001?key=secret`)

### AC2: Scan et Connexion Mobile
**Given** une tablette non configurée
**When** je clique sur "Scan Hub"
**Then** l'appareil ouvre la caméra, scanne le QR code
**And** extrait l'IP et se connecte instantanément au Hub

### AC3: Persistance de l'IP du Hub
**Given** un scan réussi
**When** l'app redémarre le lendemain
**Then** elle tente de se reconnecter à la même IP sans redemander le scan, sauf si l'IP a changé (timeout)

## Tasks

- [ ] **Task 1: Backend Hub Discovery**
  - [ ] 1.1: Implémenter le service de détection d'IP locale au démarrage du POS
  - [ ] 1.2: Générer le QR code avec `qrcode.react`

- [ ] **Task 2: Client Scanner**
  - [ ] 2.1: Intégrer `@capacitor-community/barcode-scanner` dans l'app mobile

- [ ] **Task 3: UX de Setup**
  - [ ] 3.1: Créer un flux "Join Hub" simple pour les nouveaux appareils

## Dev Notes

### Security
- Le QR code doit inclure une clé d'authentification éphémère pour empêcher des appareils tiers de rejoindre le LAN Hub sans autorisation.

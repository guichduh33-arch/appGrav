# Story 7.11: Print Server Deployment

Status: ready-for-dev

## Story

As a **Admin**,
I want **déployer le serveur d'impression local (Print-Server)**,
So that **tous les appareils de la boulangerie peuvent imprimer des tickets sans dépendre du cloud**.

## Acceptance Criteria

### AC1: Exécution du Serveur Node.js
**Given** un PC (ou Raspberry Pi) sur le réseau local
**When** je lance l'exécutable `print-server.exe`
**Then** une fenêtre console confirme l'écoute sur le port 3001
**And** l'endpoint `http://localhost:3001/health` répond "OK"

### AC2: Configuration du Hub
**Given** le Print-Server lancé
**When** je renseigne son IP dans le POS principal
**Then** le bouton "Test Connection" devient vert
**And** une page de test s'imprime sur l'imprimante par défaut par USB/Réseau

### AC3: Sécurité LAN
**Given** des requêtes d'impression
**When** elles proviennent d'IP inconnues
**Then** le serveur les rejette si une liste blanche (whitelist) est configurée

## Tasks

- [ ] **Task 1: Développement du Mini-Serveur**
  - [ ] 1.1: Créer un projet Node/Express minimaliste indépendant
  - [ ] 1.2: Intégrer la librairie `node-escpos` ou `printer`

- [ ] **Task 2: Endpoints d'Impression**
  - [ ] 2.1: Implémenter `POST /print/raw` pour recevoir des buffers ESC/POS
  - [ ] 2.2: Gérer la file d'attente (queue) locale pour éviter les collisions si plusieurs commandes arrivent en même temps

- [ ] **Task 3: Documentation de Setup**
  - [ ] 3.1: Écrire le guide d'installation pour le personnel technique

## Dev Notes

### Port Stability
- Assurer que le port 3001 n'est pas utilisé par un autre service.
- Le serveur doit pouvoir redémarrer automatiquement avec Windows/OS.

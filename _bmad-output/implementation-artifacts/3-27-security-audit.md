# Story 3.27: Security Audit

Status: backlog

## Story

As a **Security Auditor**,
I want **vérifier l'intégrité des opérations critiques**,
so that **le système est protégé contre les fraudes et les manipulations**.

## Acceptance Criteria

### AC1: Protection Brute Force PIN
**Given** tentative de PIN erronée
**When** 3 échecs consécutifs
**Then** le système applique un verrouillage temporaire (ex: 30s)
**And** l'échec est loggué

### AC2: Absence de Fuite de Données Sensibles
**Given** monitoring des logs (audit trail et console)
**When** des opérations critiques sont effectuées
**Then** aucune valeur de PIN en clair ne doit apparaître dans les logs

### AC3: Intégrité hors-ligne
**Given** modification manuelle des données IndexedDB (tentative de fraude)
**When** la sync s'exécute
**Then** le système de validation serveur rejette les données altérées

## Tasks / Subtasks

- [ ] **Task 1: Audit de la protection PIN**
  - [ ] 1.1: Vérifier l'implémentation de la limite de tentatives
- [ ] **Task 2: Audit des Logs**
  - [ ] 2.1: Scanner le code pour s'assurer que les PINs ne sont jamais loggués
- [ ] **Task 3: Test de sabotage offline**
  - [ ] 3.1: Simuler une modification de montant en DB locale et vérifier le rejet serveur

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F2.11: Security Audit`

# Story 3.22: Void Service Offline Sync

Status: backlog

## Story

As a **Developer**,
I want **implémenter la synchronisation et la résolution de conflits pour les annulations (void)**,
so that **les annulations faites offline sont correctement répercutées sur le serveur**.

## Acceptance Criteria

### AC1: Mise en File d'Attente Offline
**Given** application en mode offline
**When** un `voidOrder` est exécuté
**Then** l'opération est ajoutée à la `offline_sync_queue` avec les métadonnées de conflit

### AC2: Règle de Résolution : Rejet si Serveur plus récent
**Given** opération de void stockée offline
**When** la sync s'exécute et que `order.updated_at` sur le serveur est postérieur à la création du void
**Then** l'opération de sync est rejetée
**And** l'utilisateur est notifié du conflit

### AC3: Audit Trail Persistant
**Given** une tentative de void (synced ou failed)
**When** l'état change
**Then** le log d'audit est mis à jour avec le résultat final de l'opération sur le serveur

## Tasks / Subtasks

- [ ] **Task 1: Logique de queue dans voidService**
  - [ ] 1.1: Modifier `voidOrder` pour détecter l'état `isOffline`
  - [ ] 1.2: Appeler `addToSyncQueue` avec le payload et la règle de conflit
- [ ] **Task 2: Implémenter le processeur de sync pour 'void_operation'**
  - [ ] 2.1: Créer le handler de sync dans `syncEngine`
  - [ ] 2.2: Implémenter la vérification de `updated_at` avant application

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F2.6: Void Service + Offline Sync`

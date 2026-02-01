# Key User Flows

### Flow 1 : Prise de Commande POS

```
[Démarrage]
     │
     ▼
┌─────────────┐
│ Tap produit │ ──► Produit ajouté au panier (toast discret)
└─────────────┘
     │
     ▼ (si variantes)
┌─────────────┐
│ Modal       │ ──► Sélection variante ──► Fermeture auto
│ Variantes   │     (taille, options)
└─────────────┘
     │
     ▼
┌─────────────┐
│ Continuer   │ ──► Répéter pour autres produits
│ ou Payer    │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Tap         │
│ ENCAISSER   │
└─────────────┘
     │
     ▼
┌─────────────┐     ┌─────────────┐
│ Espèces     │ ou  │ Carte/QRIS  │
└─────────────┘     └─────────────┘
     │                    │
     ▼                    ▼
┌─────────────┐     ┌─────────────┐
│ Rendu       │     │ Attente     │
│ monnaie     │     │ paiement    │
└─────────────┘     └─────────────┘
     │                    │
     └────────┬───────────┘
              ▼
       ┌─────────────┐
       │ Toast:      │
       │ "Commande   │
       │ validée ✓"  │
       └─────────────┘
              │
              ▼
       [Panier vidé, prêt pour suivant]
```

### Flow 2 : Mode Offline

```
[Internet OK]  ──────►  [Coupure détectée]
     │                        │
     │                        ▼
     │                 ┌─────────────┐
     │                 │ Icône wifi  │
     │                 │ grise       │  ← Pas de popup !
     │                 │ (header)    │
     │                 └─────────────┘
     │                        │
     │                        ▼
     │                 [Fonctionnement normal]
     │                 - Commandes OK
     │                 - Paiements OK
     │                 - KDS via LAN
     │                        │
     │                        ▼
     │                 [Stockage local]
     │                 - IndexedDB
     │                 - File d'attente sync
     │                        │
     └────────────────────────┤
                              ▼
                       [Internet revient]
                              │
                              ▼
                       ┌─────────────┐
                       │ Sync auto   │
                       │ (silencieux)│
                       └─────────────┘
                              │
                              ▼
                       ┌─────────────┐
                       │ ✓✓ affiché  │
                       │ (double     │
                       │  check)     │
                       └─────────────┘
```

### Flow 3 : Checkpoint Qualité (À Implémenter)

```
[Production termine un produit]
              │
              ▼
       ┌─────────────┐
       │ Marquer     │
       │ "Terminé"   │
       └─────────────┘
              │
              ▼
       ┌─────────────┐
       │ Photo +     │  ← Optionnel mais encouragé
       │ Note qualité│
       └─────────────┘
              │
              ▼
[Produit visible sur écran Café]
              │
              ▼
       ┌─────────────┐
       │ Café        │
       │ vérifie     │
       └─────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
   [OK ✓]        [Refus]
       │             │
       ▼             ▼
  [Service]    ┌─────────────┐
               │ Raison +    │
               │ Retour prod │
               └─────────────┘
```

---

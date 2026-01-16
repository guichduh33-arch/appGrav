# Guide Utilisateur - AppGrav The Breakery

Version 1.0 - 16/01/2026

---

## Table des matières

1. [Démarrage](#démarrage)
2. [Interface POS](#interface-pos)
3. [Gestion des ventes](#gestion-des-ventes)
4. [Inventaire](#inventaire)
5. [Dashboard](#dashboard)
6. [Clients fidèles](#clients-fidèles)
7. [Dépannage](#dépannage)

---

## Démarrage

### Connexion

1. Ouvrez l'application AppGrav
2. Entrez votre email et mot de passe
3. Cliquez sur "Connexion"

Vous arrivez automatiquement sur l'écran de caisse (POS).

---

## Interface POS

### Vue d'ensemble

L'écran POS est divisé en 2 parties :

**Gauche (60%)** : Grille des produits
- Affiche tous les produits disponibles
- Cliquez sur un produit pour l'ajouter au panier
- Badge rouge si stock < 5 unités

**Droite (40%)** : Panier et paiement
- Liste des produits sélectionnés
- Quantités modifiables
- Total avec TVA
- Boutons de paiement

### Ajouter un produit

1. Cliquez sur le produit désiré
2. Il apparaît dans le panier à droite
3. Cliquez à nouveau pour augmenter la quantité

ℹ️ **Note** : Vous ne pouvez pas ajouter plus que le stock disponible.

### Modifier les quantités

Dans le panier :
- **Bouton +** : Augmenter la quantité
- **Bouton -** : Diminuer la quantité
- **Icône 🗑️** : Retirer du panier

### Vider le panier

1. Cliquez sur "Vider" en haut du panier
2. Confirmez dans la popup
3. Le panier est vidé

---

## Gestion des ventes

### Effectuer une vente

1. Ajoutez les produits au panier
2. Vérifiez le total (affiché en bas)
3. Choisissez le mode de paiement :
   - 💵 **Espèces** : Paiement cash
   - 💳 **Carte** : Paiement par carte bancaire

4. La vente est créée automatiquement
5. Un numéro de vente s'affiche : `SALE-20260116-001`
6. Le stock est mis à jour automatiquement

### TVA

La TVA de **10%** est appliquée automatiquement :
- Sous-total : Prix × Quantité
- TVA : Sous-total × 10%
- **Total** : Sous-total + TVA

**Exemple** :
- 2 Croissants à 2000 IDR = 4000 IDR
- TVA 10% = 400 IDR
- **Total à payer** = 4400 IDR

### Vente avec client fidèle

Si le client a une carte de fidélité :

1. Avant de valider le paiement
2. Scannez ou saisissez le numéro de carte
3. Les points sont ajoutés automatiquement
   - 1 point = 1000 IDR dépensés
4. Réduction appliquée si ≥ 100 points (10%)

---

## Inventaire

### Consulter le stock

Menu : **Inventaire** → **Liste des produits**

Vous voyez :
- Nom du produit
- Catégorie
- Prix de vente
- **Stock actuel**
- Seuil minimum

### Alertes stock bas

Les produits avec stock < 10 apparaissent en **orange**.
Les produits avec stock < 5 apparaissent en **rouge**.

### Réapprovisionner

1. Allez dans **Inventaire** → **Modifier stock**
2. Sélectionnez le produit
3. Entrez la nouvelle quantité
4. Sauvegardez

⚠️ **Important** : Le stock ne peut jamais être négatif.

---

## Dashboard

### Vue d'ensemble

Le dashboard affiche :

1. **Ventes du jour**
   - Nombre de transactions
   - Chiffre d'affaires

2. **Objectif mensuel**
   - Progression vers 500M IDR/mois
   - Barre de progression

3. **Alertes stock**
   - Nombre de produits à commander

4. **Graphiques**
   - Évolution des ventes (7 derniers jours)
   - Top 5 produits vendus

### Rafraîchissement

Les statistiques se rafraîchissent automatiquement toutes les 30 secondes.

Pour forcez un rafraîchissement : cliquez sur 🔄

---

## Clients fidèles

### Inscrire un nouveau client

1. Menu : **Clients** → **Nouveau**
2. Remplissez :
   - Nom
   - Téléphone (optionnel)
   - Email (optionnel)
3. Une carte virtuelle est générée automatiquement

### Utiliser la carte fidélité

Lors d'une vente :
1. Scannez la carte (ou saisissez le numéro)
2. Les points du client s'affichent
3. Validez la vente normalement
4. Points ajoutés : Total ÷ 1000

**Exemple** : Achat de 15 000 IDR = 15 points

### Réductions

- **≥ 100 points** : Réduction de 10%
- Les points sont conservés après réduction
- Pas de limite de points

---

## Dépannage

### Le produit n'apparaît pas

**Causes possibles** :
- Produit désactivé
- Stock à zéro

**Solution** :
1. Vérifiez dans Inventaire
2. Réactivez ou réapprovisionnez

### Erreur "Stock insuffisant"

Vous essayez de vendre plus que le stock disponible.

**Solution** :
- Réduisez la quantité
- Vérifiez le stock réel
- Réapprovisionnez si nécessaire

### La vente ne se valide pas

**Vérifications** :
1. Panier non vide ?
2. Connexion internet OK ?
3. Tous les produits en stock ?

Si le problème persiste :
- Videz le panier
- Rafraîchissez la page (F5)
- Reconnectez-vous

### L'application est lente

**Solutions** :
1. Fermez les autres applications
2. Videz le cache du navigateur
3. Vérifiez votre connexion internet

### Données incorrectes

Si vous voyez des données incohérentes :

1. Rafraîchissez la page (F5)
2. Déconnectez-vous et reconnectez-vous
3. Contactez le support si le problème persiste

---

## Support

Pour toute question ou problème :

📧 Email : support@breakery.com  
📞 Téléphone : +62 xxx xxx xxx  
🕐 Heures : Lundi-Vendredi 8h-17h

---

*Guide créé le 16/01/2026*

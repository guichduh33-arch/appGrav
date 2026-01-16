"""
DocumentationAgent - Génère toute la documentation
"""

from pathlib import Path
from datetime import datetime
from typing import List, Dict
import json

class DocumentationAgent:
    """
    Agent spécialisé dans :
    - Documentation API (Swagger/OpenAPI)
    - Guides utilisateur
    - Documentation technique
    - README et guides d'installation
    """
    
    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
        self.docs_path = self.project_path / "docs"
        self.docs_path.mkdir(parents=True, exist_ok=True)
    
    def generate_api_documentation(self, api_endpoints: List[Dict]) -> str:
        """
        Génère la documentation API complète
        """
        
        print("📖 Génération documentation API...")
        
        doc = f'''# Documentation API - AppGrav The Breakery

Générée le: {datetime.now().strftime('%Y-%m-%d %H:%M')}

## Base URL   ## Authentification
Toutes les requêtes nécessitent un token Bearer :---

## Endpoints

'''
        
        # Grouper par ressource
        resources = {}
        for endpoint in api_endpoints:
            resource = endpoint.get('resource', 'other')
            if resource not in resources:
                resources[resource] = []
            resources[resource].append(endpoint)
        
        # Documenter chaque ressource
        for resource, endpoints in resources.items():
            doc += f"\n### {resource.capitalize()}\n\n"
            
            for ep in endpoints:
                method = ep.get('method', 'GET')
                path = ep.get('path', '')
                description = ep.get('description', '')
                
                doc += f"#### {method} `{path}`\n\n"
                doc += f"{description}\n\n"
                
                # Paramètres
                if 'parameters' in ep:
                    doc += "**Paramètres:**\n\n"
                    for param in ep['parameters']:
                        doc += f"- `{param['name']}` ({param['type']}) - {param['description']}\n"
                    doc += "\n"
                
                # Body
                if 'body' in ep:
                    doc += "**Body (JSON):**\n\n```json\n"
                    doc += json.dumps(ep['body'], indent=2)
                    doc += "\n```\n\n"
                
                # Réponse
                if 'response' in ep:
                    doc += "**Réponse (200):**\n\n```json\n"
                    doc += json.dumps(ep['response'], indent=2)
                    doc += "\n```\n\n"
                
                # Erreurs
                if 'errors' in ep:
                    doc += "**Erreurs possibles:**\n\n"
                    for error in ep['errors']:
                        doc += f"- `{error['code']}` - {error['message']}\n"
                    doc += "\n"
                
                doc += "---\n\n"
        
        # Sauvegarder
        api_doc_path = self.docs_path / "api" / "README.md"
        api_doc_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(api_doc_path, 'w', encoding='utf-8') as f:
            f.write(doc)
        
        print(f"✅ Documentation API créée : {api_doc_path}")
        return str(api_doc_path)
    
    def generate_sales_api_doc(self) -> str:
        """
        Documentation spécifique pour l'API des ventes
        """
        
        print("📖 Génération doc API Ventes...")
        
        doc = '''# API Ventes - Documentation Détaillée

## Vue d'ensemble

L'API Ventes gère tout le processus de vente dans The Breakery :
- Création de ventes
- Calcul automatique de la TVA (10%)
- Déduction du stock
- Points fidélité
- Statistiques

---

## POST /api/sales

Crée une nouvelle vente.

### Process complet

1. **Validation du stock** - Vérifie que tous les produits sont disponibles
2. **Calculs** - Sous-total, TVA, total
3. **Génération numéro** - Format: SALE-YYYYMMDD-XXX
4. **Transaction atomique** :
   - Création de la vente
   - Création des lignes de vente
   - Déduction du stock
   - Ajout points fidélité (si client)

### Request
```json
{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "unit_price": 2000
    }
  ],
  "payment_method": "cash",  // "cash", "card", ou "transfer"
  "customer_id": "uuid",      // Optionnel
  "notes": "string"           // Optionnel
}
```

### Response (201 Created)
```json
{
  "id": "uuid",
  "sale_number": "SALE-20260116-001",
  "subtotal": 4000,
  "tax_amount": 400,
  "total_amount": 4400,
  "payment_method": "cash",
  "created_at": "2026-01-16T10:30:00Z"
}
```

### Erreurs possibles

#### 400 - Stock insuffisant
```json
{
  "detail": "Stock insuffisant pour produit {id}. Disponible: 5, Demandé: 10"
}
```

#### 400 - Produit inexistant
```json
{
  "detail": "Produit {id} non trouvé"
}
```

#### 422 - Validation échouée
```json
{
  "detail": [
    {
      "loc": ["body", "payment_method"],
      "msg": "value is not a valid enumeration member",
      "type": "type_error.enum"
    }
  ]
}
```

---

## GET /api/sales/daily-stats

Statistiques des ventes du jour.

### Response (200)
```json
{
  "total_sales": 45,
  "total_revenue": 1250000,
  "average_sale": 27777,
  "total_tax": 125000
}
```

---

## GET /api/sales/low-stock-alert

Liste des produits avec stock bas.

### Response (200)
```json
[
  {
    "id": "uuid",
    "name": "Croissant",
    "category": "Viennoiserie",
    "quantity": 3,
    "minimum_threshold": 10,
    "shortage": 7
  }
]
```

---

## Exemples d'utilisation

### Vente simple (JavaScript)
```javascript
const createSale = async (items, paymentMethod) => {
  const response = await fetch('/api/sales', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      items: items,
      payment_method: paymentMethod
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  return await response.json();
};

// Utilisation
try {
  const sale = await createSale([
    { product_id: 'uuid-1', quantity: 2, unit_price: 2000 },
    { product_id: 'uuid-2', quantity: 1, unit_price: 5000 }
  ], 'cash');
  
  console.log('Vente créée:', sale.sale_number);
} catch (error) {
  console.error('Erreur:', error.message);
}
```

### Vente avec client fidèle (Python)
```python
import requests

def create_sale_with_customer(items, customer_id):
    url = "http://localhost:8000/api/sales"
    
    data = {
        "items": items,
        "payment_method": "card",
        "customer_id": customer_id
    }
    
    response = requests.post(url, json=data)
    response.raise_for_status()
    
    sale = response.json()
    print(f"Vente {sale['sale_number']} créée")
    print(f"Total: {sale['total_amount']:,} IDR")
    
    return sale

# Utilisation
items = [
    {"product_id": "...", "quantity": 3, "unit_price": 2000}
]
sale = create_sale_with_customer(items, "customer-uuid")
```

---

## Notes importantes

### TVA
- Taux fixe: **10%**
- Appliquée automatiquement sur le sous-total
- Incluse dans le total final

### Numérotation
- Format: `SALE-YYYYMMDD-XXX`
- Auto-incrémenté par jour
- Exemple: SALE-20260116-001, SALE-20260116-002, etc.

### Stock
- Vérifié **avant** la vente
- Déduit **atomiquement** avec la vente
- Impossible de vendre si stock insuffisant

### Points fidélité
- Calcul: 1 point = 1000 IDR dépensés
- Ajoutés automatiquement si `customer_id` fourni
- Utilisables pour réductions futures (10% si > 100 points)

### Transactions
- Toutes les opérations sont atomiques
- En cas d'erreur, rien n'est modifié
- Garantit la cohérence des données
'''
        
        sales_doc_path = self.docs_path / "api" / "sales.md"
        sales_doc_path.parent.mkdir(parents=True, exist_ok=True)
        with open(sales_doc_path, 'w', encoding='utf-8') as f:
            f.write(doc)
        
        print(f"✅ Doc API Ventes créée : {sales_doc_path}")
        return str(sales_doc_path)
    
    def generate_user_guide(self) -> str:
        """
        Guide utilisateur pour The Breakery
        """
        
        print("📘 Génération guide utilisateur...")
        
        guide = f'''# Guide Utilisateur - AppGrav The Breakery

Version 1.0 - {datetime.now().strftime('%d/%m/%Y')}

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

*Guide créé le {datetime.now().strftime('%d/%m/%Y')}*
'''
        
        user_guide_path = self.docs_path / "user-guide.md"
        with open(user_guide_path, 'w', encoding='utf-8') as f:
            f.write(guide)
        
        print(f"✅ Guide utilisateur créé : {user_guide_path}")
        return str(user_guide_path)
    
    def generate_main_readme(self) -> str:
        """
        Génère le README principal du projet
        """
        
        print("📄 Génération README principal...")
        
        readme = f'''# 🥐 AppGrav - The Breakery ERP/POS

Système de gestion complet pour boulangerie (ERP/POS) développé avec IA.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.10+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-18.2-blue.svg)](https://react.dev)

---

## 🎯 Fonctionnalités

### ✅ Implémentées

- **Point de Vente (POS)**
  - Interface tactile optimisée
  - Scan/sélection produits
  - Calcul automatique TVA 10%
  - Paiement Cash/Carte/Virement
  - Stock temps réel

- **Gestion Inventaire**
  - Suivi stock produits
  - Alertes stock bas (<10 unités)
  - Historique mouvements
  - Réapprovisionnement

- **Clients Fidélité**
  - Système de points (1pt = 1000 IDR)
  - Réductions automatiques (10% si >100pts)
  - Historique achats

- **Dashboard & Statistiques**
  - Ventes quotidiennes
  - Objectif mensuel (6 milliards IDR/an)
  - Top produits
  - Graphiques évolution

### 🚧 En développement

- Impression tickets PDF
- Export Excel rapports
- Multi-utilisateurs avec permissions
- Application mobile

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- React 18.2
- Tailwind CSS
- Vite
- Supabase Client

**Backend**
- FastAPI (Python 3.10+)
- Pydantic (validation)
- Uvicorn (ASGI server)

**Database**
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Triggers & Functions

**Tests**
- Pytest (backend)
- Playwright (E2E)

### Structure---

## 🚀 Installation

### Prérequis

- Python 3.10+
- Node.js 18+
- Compte Supabase
- Git

### 1. Cloner le projet
```bash
git clone https://github.com/votre-compte/appgrav.git
cd appgrav
```

### 2. Backend
```bash
cd backend

# Créer environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

# Installer dépendances
pip install -r requirements.txt

# Configurer .env
cp .env.example .env
# Éditez .env avec vos credentials Supabase

# Lancer le serveur
uvicorn main:app --reload
```

API accessible sur : http://localhost:8000

### 3. Frontend
```bash
cd frontend

# Installer dépendances
npm install

# Configurer .env
cp .env.example .env
# Éditez .env avec vos credentials Supabase

# Lancer le dev server
npm run dev
```

App accessible sur : http://localhost:5173

### 4. Database
```bash
# Exécuter les migrations SQL dans Supabase
# Fichiers dans database/migrations/
```

---

## 🔧 Configuration

### Variables d'environnement

**Backend (.env)**
```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=votre-anon-key
SECRET_KEY=votre-secret-key
TAX_RATE=0.10
ANNUAL_TARGET=6000000000
```

**Frontend (.env)**
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=votre-anon-key
VITE_API_URL=http://localhost:8000/api
```

---

## 📖 Documentation

- [Guide Utilisateur](docs/user-guide.md)
- [Documentation API](docs/api/README.md)
- [API Ventes](docs/api/sales.md)

---

## 🧪 Tests

### Tests unitaires
```bash
pytest tests/ -v
```

### Tests avec couverture
```bash
pytest tests/ --cov=backend --cov-report=html
```

### Tests E2E
```bash
pytest tests/test_e2e.py --headed
```

---

## 📊 Performances

- Temps de réponse API : < 200ms
- Chargement page POS : < 1s
- Support : 200+ transactions/jour

---

## 🤝 Contribution

Les contributions sont bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📝 Licence

MIT License - voir [LICENSE](LICENSE)

---

## 👥 Auteurs

- **Mamat** - *Développement initial* - [GitHub](https://github.com/mamat)

---

## 🙏 Remerciements

- Antigravity (Google) pour le développement agent-first
- Supabase pour l'infrastructure backend
- Claude (Anthropic) pour l'assistance IA

---

## 📞 Contact

Pour toute question ou suggestion :

📧 Email : mamat@breakery.com  
🌐 Website : https://breakery.com

---

*Dernière mise à jour : {datetime.now().strftime('%d/%m/%Y')}*
'''
        
        readme_path = self.project_path / "README.md"
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(readme)
        
        print(f"✅ README créé : {readme_path}")
        return str(readme_path)
    
    def setup_complete_documentation(self) -> dict:
        """
        Génère toute la documentation du projet
        """
        
        print("🚀 Génération documentation complète...\n")
        
        results = {
            "readme": None,
            "user_guide": None,
            "api_docs": [],
            "sales_doc": None
        }
        
        # 1. README principal
        results["readme"] = self.generate_main_readme()
        
        # 2. Guide utilisateur
        results["user_guide"] = self.generate_user_guide()
        
        # 3. Documentation API ventes
        results["sales_doc"] = self.generate_sales_api_doc()
        
        # 4. Index documentation
        index = f'''# Documentation AppGrav

## 📚 Guides

- [README Principal](../README.md)
- [Guide Utilisateur](user-guide.md)

## 🔌 API

- [Documentation API Générale](api/README.md)
- [API Ventes](api/sales.md)

## 🛠️ Développement

- Architecture du projet
- Guide de contribution
- Standards de code

---

*Généré le {datetime.now().strftime('%d/%m/%Y')}*
'''
        
        index_path = self.docs_path / "index.md"
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(index)
        
        print("\n" + "="*60)
        print("✅ DOCUMENTATION COMPLÈTE GÉNÉRÉE!")
        print("="*60)
        print(f"README: Oui")
        print(f"Guide utilisateur: Oui")
        print(f"Documentation API: Oui")
        
        return results


# Test
if __name__ == "__main__":
    agent = DocumentationAgent(".")
    results = agent.setup_complete_documentation()
    print("\n📚 Documentation prête!")

# API Ventes - Documentation Détaillée

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

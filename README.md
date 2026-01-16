# 🥐 AppGrav - The Breakery ERP/POS

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
source venv/bin/activate  # Windows: venv\Scripts\activate

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

*Dernière mise à jour : 16/01/2026*

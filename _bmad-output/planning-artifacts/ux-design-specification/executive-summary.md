# Executive Summary

### Project Vision

AppGrav est un système ERP/POS éducatif conçu pour The Breakery, une boulangerie artisanale française à Lombok, Indonésie. La philosophie centrale : **éduquer en protégeant** — permettre aux employés peu qualifiés de prendre des décisions simples sans risque de catastrophe, tout en automatisant les contrôles pour libérer le manager unique.

**Principes UX Fondamentaux :**
- Décisions à faible enjeu avec erreurs réversibles
- Feedback discret mais encourageant (toasts légers)
- Interface lisible : Icône + Texte, tailles généreuses
- Filet de sécurité manager pour décisions sensibles
- Résilience offline transparente

### Target Users

| Persona | Contexte | Besoin UX Principal |
|---------|----------|---------------------|
| **Manager (MamatCEO)** | Entrepreneur seul, 30 employés à gérer | Dashboard consolidé, visibilité 30 secondes, alertes proactives |
| **Équipe Production** | 20-25 ans, peur de mal faire | Protocoles visuels, checkpoints qualité, zéro décision critique |
| **Équipe Café/Service** | Contrôle qualité avant service | Interface ultra-fluide, checkpoints obligatoires |
| **Caissier (Budi)** | Face aux coupures internet quotidiennes | Mode offline transparent, indicateurs non anxiogènes |
| **Serveur (Marie)** | Allers-retours constants vers la caisse | App mobile, envoi direct KDS, autonomie en salle |
| **Client (Pak Wayan)** | Veut sa commande en temps réel | Customer Display transparent, confiance renforcée |

### Key Design Challenges

1. **Résilience Offline**
   - Transition online↔offline imperceptible (< 2 secondes)
   - Toutes les fonctionnalités disponibles en mode dégradé
   - Indicateur de statut visible mais non stressant

2. **Checkpoints Qualité (À concevoir)**
   - Flux Production → Café → Client à designer
   - Validation obligatoire avant passage à l'étape suivante
   - Traçabilité des refus et corrections

3. **Multi-Device Synchronisation**
   - POS (Chrome), Mobile (Capacitor), KDS, Customer Display
   - Communication LAN temps réel sans dépendance internet
   - État cohérent entre tous les appareils

4. **Interface pour Utilisateurs Non-Techniques**
   - Zones tactiles généreuses (44x44px minimum)
   - Texte lisible (18px minimum, 24px pour prix)
   - Feedback discret : toasts encourageants, jamais accusateurs

### Design Opportunities

1. **Customer Display comme Outil de Confiance**
   - Transparence totale : articles, prix, total en temps réel
   - Différenciateur client : "Ici, vous voyez tout"

2. **App Mobile Serveur comme Libérateur**
   - Fin des allers-retours caisse
   - Serveurs plus disponibles pour les clients
   - Envoi direct en cuisine = service plus rapide

3. **Feedback Émotionnel Discret**
   - Toasts positifs ("Commande envoyée") renforçant la confiance
   - Messages d'erreur reformulés en opportunités ("Vérifions ensemble")
   - Tonalité professionnelle et bienveillante

4. **Mode Offline comme Avantage Compétitif**
   - 2h d'autonomie = continuité de service garantie
   - Synchronisation automatique = zéro perte de données
   - Expérience utilisateur identique online/offline

---

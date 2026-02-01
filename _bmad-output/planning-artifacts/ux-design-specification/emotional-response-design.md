# Emotional Response Design

### Desired User Feelings

**Tonalité Générale : Professionnelle et Rassurante**

AppGrav ne cherche pas à impressionner mais à **rassurer**. L'émotion cible n'est pas l'excitation mais la **confiance tranquille**.

| Contexte | Émotion Visée | Anti-Pattern à Éviter |
|----------|---------------|----------------------|
| **Action réussie** | Satisfaction discrète | Célébration excessive |
| **Erreur utilisateur** | Sérénité ("on corrige") | Culpabilisation |
| **Coupure internet** | Indifférence | Alarme / Panique |
| **Fin de journée** | Fierté calme | Épuisement |

### Feedback Intensity Scale

**Niveau choisi : Très Discret**

| Type de Feedback | Implémentation |
|------------------|----------------|
| **Succès** | Toast léger (2-3 sec), coin inférieur, icône ✓ verte |
| **Information** | Toast neutre, icône ℹ️ bleue |
| **Attention** | Toast orange, persiste 4 sec, icône ⚠️ |
| **Erreur** | Toast rouge, action requise, message reformulé positivement |

### Emotional Micro-Copy Guidelines

**Principes de rédaction :**

1. **Jamais accusateur**
   - ❌ "Erreur : Stock insuffisant"
   - ✅ "Ce produit n'est plus en stock — voulez-vous une alternative ?"

2. **Toujours une solution**
   - ❌ "Impossible de synchroniser"
   - ✅ "Mode hors ligne actif — vos données sont en sécurité"

3. **Court et actionnable**
   - ❌ "La commande a été envoyée avec succès au système de cuisine"
   - ✅ "Envoyé en cuisine ✓"

4. **Personnalisé quand pertinent**
   - "Commande Table 7 prête" plutôt que "Commande #1234 prête"

### Stress-Free States

**États potentiellement stressants → Réponse UX :**

| État | Réponse UX |
|------|------------|
| **Offline** | Icône wifi barrée (grise, pas rouge), pas de message intrusif |
| **Stock bas** | Badge orange discret sur le produit, info au tap |
| **Erreur de saisie** | Champ surligné + suggestion, pas de popup |
| **Attente sync** | Indicateur rotatif subtil, pas de "chargement..." |

---

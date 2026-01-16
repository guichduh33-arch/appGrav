# Accès à Distance et Configuration du Développement

Ce guide explique comment accéder à l'application depuis n'importe où (réseau local ou internet) et comment configurer l'environnement pour développer sur plusieurs machines.

---

## 1. Accès Local (Même Wi-Fi)

Si vous êtes sur le même réseau (maison, bureau) :

**Lien d'accès :**
> **http://192.168.0.66:3000**

---

## 2. Accès Internet (4G, autre lieu)

Si vous êtes complètement ailleurs (ex: en déplacement), vous avez deux options simples :

### Option A : Visualiser seulement (Ngrok)
Idéal pour montrer l'app à quelqu'un ou tester sur mobile via 4G.

1. Téléchargez [Ngrok](https://ngrok.com/download) sur le PC principal.
2. Ouvrez un terminal et lancez une des commandes suivantes :
   ```bash
   # Si ngrok est installé :
   ngrok http 3000
   
   # Alternativement avec npm :
   npx ngrok http 3000
   ```
3. Copiez le lien en `https://....ngrok-free.app` qui s'affiche.
   > Ce lien est accessible depuis n'importe où dans le monde.

### Option B : Développer à distance (VS Code Tunnels)
Si vous voulez **coder** sur votre PC principal depuis un autre ordinateur (ou iPad) sans rien installer.

1. Sur le PC principal, dans VS Code, cliquez sur l'icône "Compte" (en bas à gauche).
2. Choisissez **"Turn on Remote Tunnel Access..."**.
3. Connectez-vous avec votre compte GitHub/Microsoft.
4. Allez sur [vscode.dev](https://vscode.dev) depuis n'importe quel autre ordinateur.
5. Connectez vous et vous aurez accès à vos fichiers et au terminal comme si vous y étiez.

---

## 3. Travailler sur le Code (Méthode Classique)

Pour travailler sérieusement sur un autre poste, la méthode recommandée reste Git.

### Étape A : Initialiser Git sur le poste principal
Dans `c:\disk\AppGrav` :
```bash
git init
git add .
git commit -m "Initial commit"
```

### Étape B : Synchroniser avec GitHub
1. Créez un dépôt sur [GitHub](https://github.com/new).
2. Liez-le :
   ```bash
   git remote add origin https://github.com/VOTRE_USER/AppGrav.git
   git branch -M main
   git push -u origin main
   ```

### Étape C : Récupérer sur le second poste
```bash
git clone https://github.com/VOTRE_USER/AppGrav.git
cd AppGrav
npm install
npm run dev
```

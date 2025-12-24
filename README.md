# Template AuditCom

Ce projet est un template pour afficher une liste de rapports PDF et permettre leur téléchargement via un formulaire.

## 📁 Structure du projet

```
auditcom-template/
├── index.html              # Page principale (MODIFIABLE)
├── css/
│   ├── reset.css          # Reset CSS (ne pas modifier)
│   └── style.css          # Styles personnalisés (MODIFIABLE)
├── src/
│   ├── main.js            # Logique principale (ne pas modifier)
│   ├── templating.js      # Système de templating (ne pas modifier)
│   └── loadTemplate.js    # Chargement des templates (ne pas modifier)
└── templates/
    └── teamItem.html      # Template pour chaque élément (MODIFIABLE)
```

## 🎯 Utilisation

### Fichiers modifiables

Vous pouvez modifier **uniquement** les fichiers suivants :
- ✅ `index.html` - Structure de la page principale
- ✅ `css/style.css` - Styles personnalisés
- ✅ `templates/teamItem.html` - Template pour chaque élément de la liste

### Fichiers à ne pas modifier

- ❌ `src/main.js` - Contient la logique de l'application
- ❌ `src/templating.js` - Système de templating
- ❌ `src/loadTemplate.js` - Chargement des templates
- ❌ `css/reset.css` - Reset CSS de base

## 🔧 Règles importantes pour `index.html`

### IDs obligatoires

Ces IDs **doivent absolument être présents** et **ne doivent pas être modifiés** :

```html
<!-- Conteneur pour la liste des éléments -->
<section id="teamList">
</section>

<!-- Formulaire de téléchargement -->
<form id="downloadForm">
</form>
```

### Attributs `data-bind-global`

Utilisez `data-bind-global` pour afficher des métadonnées globales :

```html
<!-- Affiche le nombre total de rapports -->
<h1 data-bind-global="count"></h1>
```

**Données disponibles :**
- `count` - Nombre total de rapports

## 🎨 Personnalisation du template (`templates/teamItem.html`)

Le template `teamItem.html` définit la structure de chaque élément de la liste. Vous pouvez modifier le HTML et ajouter des classes CSS, mais **vous devez conserver les attributs `data-bind`**.

### Attributs `data-bind` disponibles

```html
<template>
  <article>
    <!-- Nom de l'équipe -->
    <h2 data-bind="teamName"></h2>
    
    <!-- Titre du document PDF -->
    <p data-bind="title"></p>
    
    <!-- Date de téléversement formatée -->
    <p data-bind="uploadedAt"></p>
  </article>
</template>
```

**Données disponibles pour chaque élément :**
- `teamName` - Nom de l'équipe
- `title` - Titre du document PDF
- `uploadedAt` - Date de téléversement (formatée automatiquement)

## 📝 Formulaire de téléchargement

Le formulaire avec l'ID `downloadForm` est automatiquement connecté à l'API. Vous pouvez ajouter n'importe quels champs de formulaire :

```html
<form id="downloadForm">
    <input type="text" name="lastName" placeholder="Nom">
    <input type="text" name="firstName" placeholder="Prénom">
    <input type="email" name="email" placeholder="Email">
    <input type="checkbox" name="newsletterAgreement" id="consent">
    <label for="consent">J'accepte de recevoir la newsletter</label>
    <button type="submit">Télécharger</button>
</form>
```

**Important :** 
- Les données du formulaire sont automatiquement envoyées à l'API lors de la soumission
- Le serveur retourne un PDF qui sera téléchargé automatiquement
- Le champ `newsletterAgreement` est automatiquement converti en "true" ou "false"

## 🚀 Démarrage

### ⚠️ Important : Extension Live Server requise

**Le Live Preview intégré de VS Code/Cursor ne fonctionne pas avec les modules JavaScript ES6.** Vous devez installer l'extension **Live Server** pour prévisualiser le projet.

**Installation de Live Server :**
1. Ouvrez VS Code/Cursor
2. Allez dans l'onglet Extensions (ou appuyez sur `Cmd+Shift+X` sur Mac / `Ctrl+Shift+X` sur Windows/Linux)
3. Recherchez "Live Server" par Ritwick Dey
4. Cliquez sur "Installer"

### Servir les fichiers avec un serveur HTTP local

Une fois Live Server installé, vous avez plusieurs options :

**Option 1 : Live Server (recommandé pour VS Code)**
- Clic droit sur `index.html` dans l'explorateur de fichiers
- Sélectionnez **"Open with Live Server"**
- La page s'ouvrira automatiquement dans votre navigateur

**Option 2 : Python**
```bash
python3 -m http.server 8000
```
Puis ouvrez `http://localhost:8000` dans votre navigateur

**Option 3 : Node.js (npx)**
```bash
npx serve -p 8000
```
Puis ouvrez `http://localhost:8000` dans votre navigateur

### Ouvrir dans le navigateur

- Accédez à `http://localhost:8000` (ou le port configuré)
- La page chargera automatiquement les données depuis l'API

## 🔌 API

Le projet se connecte automatiquement à l'API suivante :

- **Base URL :** `https://auditcom.onrender.com/api`
- **Endpoints :**
  - `GET /pdfs` - Récupère la liste des PDFs
  - `POST /submit` - Soumet le formulaire et retourne un PDF


## ⚠️ Points d'attention

1. **Ne modifiez pas les IDs** `teamList` et `downloadForm` dans `index.html`
2. **Conservez les attributs `data-bind`** dans le template avec les noms exacts (`teamName`, `title`, `uploadedAt`)
3. **Utilisez un serveur HTTP** - Ne pas ouvrir directement `index.html` avec `file://` car les modules ES6 nécessitent un serveur
4. **Le template doit contenir une balise `<template>`** à la racine dans `templates/teamItem.html`

## 📚 Système de templating

Le système de templating fonctionne automatiquement :

1. **Chargement** : Le template `teamItem.html` est chargé au démarrage
2. **Remplissage global** : `fillGlobals()` remplit les éléments avec `data-bind-global`
3. **Remplissage des items** : `fillTemplate()` remplit chaque élément de la liste avec les données de l'API
4. **Insertion** : Les éléments remplis sont ajoutés dans `#teamList`

Vous n'avez pas besoin de modifier le JavaScript - tout est automatique !


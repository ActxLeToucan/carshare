# Front-end
## Développement
### Prérequis
Vous devez avoir les outils suivants installés sur votre machine :
* [Node.js](https://nodejs.org/fr/)
* [npm](https://www.npmjs.com/get-npm)

### Installation
1. Cloner le dépôt et se placer dans le dossier [frontend](.)
2. Installer les dépendances
```bash
npm i
```
3. Indiquer l'URL de l'API dans le fichier `src/config.js`,
en copiant le fichier `src/config.example.js` vers `src/config.js` et en changeant la valeur de `url` par l'URL de l'API.

Par exemple :
```bash
api: {
    url: 'http://localhost:3000'
}
```

### Développement
Lorsque vous développez, lancez le serveur avec la commande suivante :
```bash
npm run dev
```

## Production
### Prérequis
Vous devez avoir les outils suivants installés sur votre machine :
* [npm](https://www.npmjs.com/get-npm)
* [http-server](https://www.npmjs.com/package/http-server)

### Installation
1. Cloner le dépôt et se placer dans le dossier [frontend](.)
2. Installer le paquet ***http-server*** sur votre machine
```bash
npm i -g http-server
```
3. Installer les dépendances
```bash
npm i
```
4. Compiler le projet
```bash
npm run build
```
4. Lancer le serveur sur le dossier `/dist` et sur le port 8080
```bash
http-server ./dist -p 8080
```

## Informations
Le site contient dans ses métadonnées (balise `<head>` du fichier `index.html`) l'URL du site web sur lequel il est hébergé. Veuillez à modifier cet URL pour qu'elle corresponde à l'URL de votre site.
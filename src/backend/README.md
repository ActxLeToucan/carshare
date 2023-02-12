# Back-end
## Développement
### Prérequis
Vous devez avoir les outils suivants installés sur votre machine :
* [Node.js](https://nodejs.org/fr/)
* [npm](https://www.npmjs.com/get-npm)
* une base de données MariaDB (vous pouvez utiliser [XAMPP](https://www.apachefriends.org/fr/index.html) pour l'installer sur votre machine)

### Installation
1. Cloner le dépôt et se placer dans le dossier [backend](.)
2. Installer les dépendances
```bash
npm i
```
3. Installer le paquet ***nodemon*** sur votre machine
```bash
npm i -g nodemon
```
3. Copier le fichier [`.env.example`](.env.example) et le renommer en `.env`
4. Modifier les variables d'environnement du fichier `.env` pour qu'elles correspondent à votre configuration
5. Initialiser la base de données
```bash
npx prisma migrate dev
```
6. Lancer le serveur
```bash
npm run dev
```

### Développement
Lorsque vous développez, lancez le serveur avec la commande suivante :
```bash
npm run dev
```
Le serveur sera lancé en mode développement et sera redémarré automatiquement à chaque modification des fichiers.


## Production
### Prérequis
Vous devez avoir les outils suivants installés sur votre machine :
* [Node.js](https://nodejs.org/fr/)
* une base de données MariaDB
* un serveur web (Apache, Nginx, etc.)

### Installation
1. Cloner le dépôt et se placer dans le dossier [backend](.)
2. Installer les dépendances
```bash
npm i
```
3. Installer le paquet ***pm2*** sur votre machine
```bash
npm i -g pm2
```
3. Copier le fichier [`.env.example`](.env.example) et le renommer en `.env`
4. Modifier les variables d'environnement du fichier `.env` pour qu'elles correspondent à votre configuration
5. Initialiser la base de données
```bash
npx prisma migrate dev
```
6. Générer les fichiers pour le mode production
```bash
npm run build
```
7. Lancer le serveur
```bash
pm2 start dist/index.js --name "backend"
```
8. Configurer le serveur web pour qu'il redirige les requêtes vers le serveur Node.js (reverse proxy)

### Quelques commandes utiles
Pour lancer le serveur en mode production sans pm2, exécuter la commande suivante :
```bash
npm run start
```

---

Pour nettoyer les fichiers générés pour le mode production, exécuter la commande suivante :
```bash
npm run clean
```

---

Pour accéder à la console de pm2, exécuter la commande suivante :
```bash
pm2 monit
```
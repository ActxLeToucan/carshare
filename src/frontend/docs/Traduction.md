# Système de traductions du site web [`Car Share`]

## Ajout de langues
De nouvelles langues peuvent être facilement ajoutés au site web, en suivant les étapes suivantes:
- Créer un nouveau fichier de traduction dans le dossier `src/langs` avec le nom de la langue (ex: `fr.js` pour le français)
- Ajouter les traductions dans ce fichier, en respectant la syntaxe suivante:
```js
export default {
    MOT_CLE: "Traduction",
};
```
- Ajouter le nom de la langue dans la classe `Langs` du fichier `src/langs/langs.js` en respectant la syntaxe suivante:
```js
import [nouvelleLangue] from "../langs/[nouvelleLangue].js";

class Langs {
    static langs = [
        {label: "English", value: "en", data: en},
        {label: "Français", value: "fr", data: fr},
        {label: "[LabelLangue]", value: "[CodeLangue]", data: [nouvelleLangue]},
    ];
}
```
Le reste du site web s'adaptera automatiquement à la nouvelle langue si elle est sélectionnée.

## Traduction des pages
Les pages du site web sont traduites en fonction de la langue sélectionnée. Pour ajouter une traduction à une page, il suffit de suivre les étapes suivantes:
- Importer le ssytème de traduction dans le fichier de la page:
```js
import Lang from "[chemin]/scripts/Langs.js";
```
- Ajouter la langue courante dans les informations de la page:
```js
data() {
    return { lang: Lang.CurrentLang };
},
```
- Assigner la traduction du fichier à l'élément de la page voulu:
```html
<p> {{ lang.MOT_CLE }} </p>
```
- Pour profiter d'une mise à jour automatique de la page en cas de changement de langue, écouter les changements de langue et mettre à jour la page en conséquence:
```js
mounted() {
    Lang.AddCallback(lang => this.lang = lang);
}
```
- Enfin, rechercher le mot clé correspondant à la traduction du texte voulu dans le fichier `src/langs/fr.js` (fichier contenant toutes les traductions du site web, par defaut en Français). Si la traduction n'existe pas, il faut la créer.

## Gestion des langues
Le système de traduction permet à n'importe quel script de modifier la langue courante, ainsi que récupérer les langues disponibles et la langue courante.
- Pour récupérer les données de traduction la langue courante, il suffit d'utiliser la variable `Lang.CurrentLang`:
```js
const traductions = Lang.CurrentLang;
const trad = traductions.MOT_CLE;
/*
[traductions] est maintenant un objet contenant toutes les traductions de la langue courante sous le format: MOT_CLE: "Traduction".
[trad] est maintenant la chaine de caractères correspondant à la traduction du mot clé "MOT_CLE" dans la langue courante.
*/
```
- Pour récupérer la liste des langues disponibles, il suffit d'utiliser la variable `Lang.Langs`:
```js
const langues = Lang.Langs;
/*
[langues] est maintenant une liste d'objets contenant les informations de chaque langue disponible sous le format:
    {label: "[NomDeLaLangue]", value: "[CodeDeLaLangue]", data: [DonneesDeTraduction]},.
*/
```
- Pour modifier la langue courante, il suffit d'utiliser la fonction `Lang.loadLang(code)`:
```js
button.addEventListener("click", () => {
    const success = Lang.LoadLang("fr");
});
/*
Au clic du bouton, la langue courante sera changée pour le français et toutes les traductions des pages écoutant les évenements de la classe Lang seront mises à jour.
[success] est maintenant un booléen avec la valeur true si le changement de langue a réussi, false sinon.
*/
```
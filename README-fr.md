# **uml2langium**

## Description du projet


L’objectif principal de ce projet est de faciliter la génération automatique du model sémantique Langium (syntaxe abstraite) à partir de modèles UML, simplifiant ainsi la création de DSL basés sur des diagrammes UML existants.
Langium est un framework pour la création de langages spécifiques au domaine (DSL), incluant la gestion automatique de la syntaxe abstraite et concrète.

## Fonctionnement

- Le projet prend en entrée un fichier UML exporté au format XMI.
- Il analyse et convertit les éléments UML (interfaces, classes, attributs, associations, etc.) en une représentation Langium de la syntaxe abstraite.
- La sortie est un fichier Langium décrivant la syntaxe abstraite, prêt à être enrichi avec la syntaxe concrète par la suite.

## Fonctionnalités

- Analyse et parsing du modèle UML  
- Conversion des classes et interfaces UML en interfaces Langium  
- Gestion des types primitifs UML avec mapping vers Langium  
- Prise en charge des associations UML comme attributs dans Langium  
- Support des énumérations UML converties en types Langium
- Support de l'héritage (Généalisations en UMl)
- Génération automatique du fichier de grammaire Langium  
- Interface en ligne de commande (CLI) simple avec options d’entrée et sortie  
- Gestion des erreurs liées aux fichiers et arguments

## Installation

Créez un fichier `.npmrc` dans votre répertoire personnel :

`~/nano .npmrc` (dans votre terminal)

Dans ce fichier, ajoutez le contenu suivant :

<pre>
@nathanleguillou:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken="mettez votre TOKEN ici"
</pre>
Puis écrivez:

`npm install -g @nathanleguillou/uml2langium`

---

## **Utilisation / Exemples**

 
`uml2langium generate --input "cheminVersLeFichierUml/fileName.uml" --output "cheminVersLEndroitOuSeraStoquéLeFichierLangium/fileName.langium"`

ou bien

`uml2langium generate -i "cheminVersLeFichierUml/fileName.uml" -o "cheminVersLEndroitOuSeraStoquéLeFichierLangium/fileName.langium"`
  
 
## **Technologies utilisées**
Liste des langages, frameworks ou bibliothèques principales:

- TypeScript — langage principal pour écrire le code

- Node.js — environnement d’exécution JavaScript côté serveur

- Langium — framework pour définir des langages et générer des grammaires (UML vers Langium)

- Nunjucks — moteur de templates pour générer le code Langium à partir des modèles

- Minimist — gestionnaire simple des arguments en ligne de commande (CLI)

- Vitest — framework de tests unitaires

- Chalk — coloration des messages en console (pour les logs CLI)

- fs (File System) — module natif Node.js pour manipuler fichiers

- XMI / UML — format d’entrée (XMI), modèle UML pour la transformation 
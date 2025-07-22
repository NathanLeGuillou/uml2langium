/// <reference types="node" resolution-mode="require"/>
import fs from "fs";
import { Class, VisibilityKind, DataType, NamedElement, Property, Association, Type } from './umlMetamodel.js';
import { Struct } from './xmiMetamodel.types.js';
/**
 * Transforme un fichier XML UML (généralement au format XMI) en un objet JavaScript.
 *
 * - Si `fullJObj` est `true`, la fonction renvoie l’objet JSON complet résultant du parsing XML.
 * - Sinon, elle retourne uniquement le tableau des éléments contenus dans `uml:Model.packagedElement`,
 *   ce qui est utile pour accéder directement aux classes, associations, etc.
 *
 * @param path - Chemin vers le fichier XML à parser (peut être un string ou un descripteur de fichier).
 * @param fullJObj - Si `true`, retourne l'objet JSON complet. Sinon, retourne `uml:Model.packagedElement` (par défaut `false`).
 * @returns L'objet JSON complet ou juste les éléments UML contenus dans `packagedElement`.
 *
 * @throws {Error} En cas d’échec de lecture du fichier ou d’erreur de parsing XML.
 */
export declare function transformXmlIntoJObj(path: fs.PathOrFileDescriptor, fullJObj?: boolean): Struct[];
type IdMap = Map<string, Struct>;
/**
 * Construit une `IdMap` à partir d'une liste d'objets `Struct`, représentant l'arbre syntaxique
 * d’un modèle UML.
 *
 * Cette map associe chaque identifiant (`@_xmi:id`) à l’objet `Struct` correspondant.
 *
 * @param ast - Tableau d’objets `Struct`, représentant le modèle UML brut.
 * @returns Une `Map` dont chaque clé est un identifiant d'objet, et la valeur un `Struct` représentant cet objet UML.
 */
export declare function createIdMap(ast: Struct[]): IdMap;
/**
 * Convertit une chaîne de caractères représentant une visibilité UML en une valeur du type `VisibilityKind`.
 *
 * Si la chaîne n’est pas reconnue parmi les valeurs valides (`'package'`, `'private'`, `'protected'`),
 * la fonction retourne `VisibilityKind.public` par défaut.
 *
 * @param visib - La chaîne représentant la visibilité (par exemple : `"private"`, `"protected"`...).
 * @returns La valeur correspondante du type `VisibilityKind`.
 */
export declare function visibility(visib: string | undefined): VisibilityKind;
/**
 * Convertit un objet JSON (issu du parsing XMI) représentant un DataType UML
 * en une instance du type `DataType` du méta-modèle.
 *
 * Ce convertisseur extrait les attributs essentiels du `Struct` JSON, comme le nom
 * et la visibilité, et initialise les propriétés UML non encore renseignées
 * (héritage, membres, attributs...) avec des valeurs par défaut (null ou tableaux vides).
 *
 * @param dataTypeAst
 * @returns
 */
export declare function dataTypeConverter(dataTypeAst: Struct): DataType;
/**
 * Convertit un nœud JSON représentant un type UML en une instance de `Type` du métamodèle interne.
 *
 * La fonction détecte le type UML via `@_xmi:type` :
 * - `"uml:Class"` → via `classConverter`
 * - `"uml:Association"` → via `associationConverter`
 * - `"uml:DataType"` → via `dataTypeConverter`
 *
 * @param typeAst - Objet `Struct` représentant un type UML.
 * @param IDs - Map d'identifiants (`IdMap`) pour résoudre les références.
 * @returns Une instance concrète de `Type` (`Class`, `Association`, `DataType`, etc.).
 *
 * @throws Une erreur si le type UML n’est pas reconnu.
 */
export declare function typeConverter(typeAst: Struct, IDs: IdMap): Type;
/**
 * Convertit un objet JSON représentant une propriété UML en une instance de `Property`.
 *
 * Résout le type de la propriété via `typeConverter`, et prend en compte les cardinalités
 * (`lowerValue`, `upperValue`) et la visibilité.
 *
 * @param propretyAst - Objet JSON de type `Struct`, représentant une propriété UML.
 * @param IDs - Map des éléments (`IdMap`) pour résoudre les types référencés.
 * @param association - (Optionnel) Objet `Association` auquel rattacher cette propriété.
 * @returns Une instance typée `Property`.
 */
export declare function propretyConverter(propretyAst: Struct, IDs: IdMap, association?: Association): Property;
/**
 * Convertit une instance de classe UML issue d’un AST JSON (souvent extrait d’un modèle XMI)
 * en un objet `Class` conforme au métamodèle UML.
 *
 * Cette fonction récupère le nom, la visibilité, les attributs et autres propriétés UML
 * de la classe, et les structure dans un objet `Class`. Elle prend également en compte
 * les attributs internes via la clé `ownedAttribute` du JSON.
 *
 * @param classAst - L'objet JSON représentant une classe UML.
 * @param IDs - La map d'identifiants (`IdMap`) associant chaque ID à ses métadonnées utiles.
 *
 * @returns Une instance de `Class` correctement construite.
 */
export declare function classConverter(classAst: Struct, IDs: IdMap): Class;
/**
 * Convertit une liste d'éléments UML représentés en JSON (typiquement extraits d’un fichier XMI)
 * en une liste d’objets `Element` correspondant au métamodèle interne.
 *
 * Cette fonction identifie dynamiquement le type UML (`uml:Class`, `uml:DataType`, `uml:Association`)
 * et applique le convertisseur spécifique à chacun. Elle utilise également un `IdMap` pour centraliser
 * les métadonnées nécessaires aux conversions.
 *
 * @param ast - Un tableau de structures JSON représentant des éléments UML à convertir.
 * @returns Un tableau d'objets `Element` conformes au métamodèle interne.
 *
 * @throws Une erreur si un type UML n’est pas reconnu ou non pris en charge.
 */
export declare function xmi2Umlconverter(ast: Struct[]): NamedElement[];
export {};

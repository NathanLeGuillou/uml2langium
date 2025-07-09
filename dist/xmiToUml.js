import fs from "fs";
import { VisibilityKind, AggregationKind } from './umlMetamodel.js';
import { XMLParser } from "fast-xml-parser";
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
export function transformXmlIntoJObj(path, fullJObj = false) {
    const xmlFile = fs.readFileSync(path, 'utf-8');
    const options = {
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    };
    const parser = new XMLParser(options);
    return fullJObj ? parser.parse(xmlFile) : parser.parse(xmlFile)['uml:Model']['packagedElement'];
}
export let jObjTest = transformXmlIntoJObj('./src/fsmModel.uml');
//! ENLEVER EXPORT UNE FOIS QUE LES TESTS SONT TERMINES
//! ENLEVER EXPORT UNE FOIS QUE LES TESTS SONT TERMINES
//! ENLEVER EXPORT UNE FOIS QUE LES TESTS SONT TERMINES
//! ENLEVER EXPORT UNE FOIS QUE LES TESTS SONT TERMINES
//! ENLEVER EXPORT UNE FOIS QUE LES TESTS SONT TERMINES
//! ENLEVER EXPORT UNE FOIS QUE LES TESTS SONT TERMINES
//! ENLEVER EXPORT UNE FOIS QUE LES TESTS SONT TERMINES
//! ENLEVER EXPORT UNE FOIS QUE LES TESTS SONT TERMINES
//! ENLEVER EXPORT UNE FOIS QUE LES TESTS SONT TERMINES
//! ENLEVER EXPORT UNE FOIS QUE LES TESTS SONT TERMINES
//! ENLEVER EXPORT UNE FOIS QUE LES TESTS SONT TERMINES
//! ENLEVER EXPORT UNE FOIS QUE LES TESTS SONT TERMINES
/**
 * Construit une `IdMap` à partir d'une liste d'objets `Struct`, représentant l'arbre syntaxique
 * d’un modèle UML.
 *
 * Cette map associe chaque identifiant (`@_xmi:id`) à l’objet `Struct` correspondant.
 *
 * @param ast - Tableau d’objets `Struct`, représentant le modèle UML brut.
 * @returns Une `Map` dont chaque clé est un identifiant d'objet, et la valeur un `Struct` représentant cet objet UML.
 */
export function createIdMap(ast) {
    let idMap = new Map();
    fillIdMap(ast, idMap);
    return idMap;
}
/**
 * Remplit récursivement une `IdMap` à partir d’une structure JSON (issue d’un parsing XMI).
 *
 * Cette fonction explore tous les nœuds (y compris imbriqués) à la recherche d’un champ `@_xmi:id`
 * et les associe à leur `Struct` dans la map.
 *
 * @param struct - Objet ou tableau JSON à parcourir.
 * @param idMap - Map dans laquelle seront ajoutés les éléments identifiés.
 */
function fillIdMap(struct, idMap) {
    if (struct === null || typeof struct !== "object") {
        return;
    }
    if (Array.isArray(struct)) {
        for (const elem of struct) {
            fillIdMap(elem, idMap);
        }
        return;
    }
    const id = struct['@_xmi:id'];
    if (id) {
        idMap.set(id, struct);
        for (const key in struct) {
            if (Array.isArray(struct[key])) {
                fillIdMap(struct[key], idMap);
            }
        }
    }
}
/**
 * Convertit une chaîne de caractères représentant une visibilité UML en une valeur du type `VisibilityKind`.
 *
 * Si la chaîne n’est pas reconnue parmi les valeurs valides (`'package'`, `'private'`, `'protected'`),
 * la fonction retourne `VisibilityKind.public` par défaut.
 *
 * @param visib - La chaîne représentant la visibilité (par exemple : `"private"`, `"protected"`...).
 * @returns La valeur correspondante du type `VisibilityKind`.
 */
export function visibility(visib) {
    if (visib === 'package') {
        return VisibilityKind.package;
    }
    if (visib === 'private') {
        return VisibilityKind.private;
    }
    if (visib === 'protected') {
        return VisibilityKind.protected;
    }
    else {
        return VisibilityKind.public;
    }
}
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
export function dataTypeConverter(dataTypeAst) {
    const dType = {
        $type: "DataType",
        owner: null,
        ownedElement: [],
        name: dataTypeAst['@_name'],
        visibility: visibility(dataTypeAst['@_visibility']),
        member: null,
        isAbstract: false,
        inheritedMember: null,
        feature: [],
        generalisations: [],
        general: null,
        attributes: null,
    };
    return dType;
}
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
export function typeConverter(typeAst, IDs) {
    if (typeAst['@_xmi:type'] == 'uml:Association') {
        return associationConverter(typeAst, IDs);
    }
    else if (typeAst['@_xmi:type'] == 'uml:Class') {
        return classConverter(typeAst, IDs);
    }
    else if (typeAst['@_xmi:type'] == 'uml:DataType') {
        return dataTypeConverter(typeAst);
    }
    else {
        throw new Error(`type ${typeAst['@_xmi:type']} is not recognised.`);
    }
}
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
export function propretyConverter(propretyAst, IDs, association = {}) {
    const convertedProperty = {
        owner: {},
        ownedElement: [],
        name: propretyAst['@_name'],
        visibility: visibility(propretyAst['@_visibility']),
        isOrdered: false,
        isUnique: false,
        lower: propretyAst['lowerValue'] ? propretyAst['lowerValue']['@_value'] : 1,
        // pour upper, si il n'y a pas de limite le max es 2 car dans tous les cas on ne differencie pas les cardinalitées multiples entre elles
        upper: propretyAst['upperValue'] ? propretyAst['upperValue']['@_value'] == "*" ? 2 : propretyAst['upperValue']['@_value'] : 1,
        $type: "Property",
        agggregation: AggregationKind.none,
        isDerived: false,
        initialValue: {},
        association: association,
        type: typeConverter(IDs.get(propretyAst["@_type"]), IDs)
    };
    return convertedProperty;
}
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
export function classConverter(classAst, IDs) {
    const convertedClass = {
        owner: {},
        ownedElement: [],
        name: classAst['@_name'],
        visibility: visibility(classAst['@_visibility']),
        member: {},
        isAbstract: false,
        inheritedMember: [],
        feature: [],
        generalisations: [],
        general: {},
        attributes: [],
        $type: "Class",
        ownedAttribute: []
    };
    if ('ownedAttribute' in classAst) {
        const ownedAttr = Array.isArray(classAst.ownedAttribute) ? classAst.ownedAttribute : [classAst.ownedAttribute];
        for (let subMap of ownedAttr) {
            convertedClass.attributes.push(propretyConverter(subMap, IDs));
        }
    }
    return convertedClass;
}
/**
 * Convertit un objet JSON (`Struct`) représentant une association UML en une instance `Association`.
 *
 * La fonction extrait les extrémités (`ownedEnd`) et les convertit en propriétés UML.
 * Elle traite également les extrémités navigables (`@_navigableOwnedEnd`) sous forme de string.
 *
 * @param associationAst - L'objet JSON décrivant l’association.
 * @param IDs - La map `IdMap` des objets UML, utilisée pour la résolution des types.
 * @returns Une instance `Association`.
 */
function associationConverter(associationAst, IDs) {
    const convertedAssociation = {
        $type: "Association",
        owner: null,
        ownedElement: [],
        name: associationAst['@_name'],
        visibility: VisibilityKind.public,
        member: null,
        isAbstract: false,
        inheritedMember: [],
        feature: [],
        generalisations: [],
        general: null,
        attributes: [],
        isDerived: false,
        addOnly: false,
        ownedEnd: [undefined, undefined],
        navigableOwnedEnd: []
    };
    if ('ownedEnd' in associationAst) {
        associationAst.ownedEnd.forEach((element, i) => {
            const elem = propretyConverter(element, IDs, convertedAssociation);
            convertedAssociation.ownedEnd[i] = elem;
        });
    }
    if ('@_navigableOwnedEnd' in associationAst) {
        let mot = "";
        for (const char of associationAst['@_navigableOwnedEnd']) {
            if (char != ' ') {
                mot += char;
            }
            else {
                convertedAssociation.navigableOwnedEnd.push(mot);
                mot = "";
            }
        }
        convertedAssociation.navigableOwnedEnd.push(mot);
    }
    return convertedAssociation;
}
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
export function xmi2Umlconverter(ast) {
    let model = [];
    const IDs = createIdMap(ast);
    for (let key in ast) {
        const elem = ast[key];
        if (elem['@_xmi:type'] === 'uml:Class') {
            model.push(classConverter(elem, IDs));
        }
        else if (elem['@_xmi:type'] === 'uml:DataType') {
            model.push(dataTypeConverter(elem));
        }
        else if (elem['@_xmi:type'] === 'uml:Association') {
            model.push(associationConverter(elem, IDs));
        }
        else {
            throw new Error(`type ${elem['@_xmi:type']} is not recognised`);
        }
    }
    return model;
}
//# sourceMappingURL=xmiToUml.js.map
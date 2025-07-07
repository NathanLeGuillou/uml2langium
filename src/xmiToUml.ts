import fs from "fs";
import { Class, VisibilityKind, DataType, Generalization, Element, NamedElement, Property, Expression, Association, Classifier, AggregationKind, Type} from './umlMetamodel.js'
import {Struct} from './xmiMetamodel.types.js'
import { XMLParser} from "fast-xml-parser";


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
export function transformXmlIntoJObj(path: fs.PathOrFileDescriptor, fullJObj: boolean = false): Struct[]{
    const xmlFile = fs.readFileSync(path, 'utf-8');
    const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
    }
    const parser = new XMLParser(options);
    return fullJObj ? parser.parse(xmlFile) : parser.parse(xmlFile)['uml:Model']['packagedElement'];
}

type IdMap = Map<string, Struct>


export let jObjTest = transformXmlIntoJObj('./src/fsmModel.uml')
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
 * Cette map associe chaque identifiant (`@_xmi:id`) à une `Map<string, string>` contenant
 * des informations sur l'objet UML correspondant : son type, son nom et sa visibilité.
 * 
 * Cette fonction utilise `fillIdMap` pour effectuer un parcours récursif sur tous les objets.
 * 
 * @param ast - Un tableau d’objets `Struct`, représentant le modèle UML brut.
 * @returns Une `Map` dont chaque clé est un identifiant d'objet, et la valeur une `Map`
 *          contenant les métadonnées suivantes :
 *          - `type` : le type UML de l'objet (ex. : `"uml:Class"`)
 *          - `name` : le nom de l'élément UML
 *          - `visibility` : sa visibilité (ex. : `"public"`, `"private"`)

 */
export function createIdMap(ast: Struct[]): IdMap{
    let idMap = new Map<string, Struct>();
    fillIdMap(ast, idMap);
    return idMap;
}

/**
 * Remplit une `IdMap` à partir d'une structure JSON (souvent issue d'un parsing XMI),
 * en associant à chaque identifiant d'élément UML (`@_xmi:id`) une map contenant : son
 *  type, son nom et sa visibilité.
 * 
 * Cette fonction est récursive : elle parcourt l'arbre JSON en profondeur pour s'assurer
 * qu'aucun identifiant ne soit ignoré, quelle que soit la structure imbriquée.
 *
 * @param struct - L'objet JSON à parcourir. Il peut contenir des clés telles que `@_xmi:id`,
 *              `@_xmi:type`, `@_name`, `@_visibility`, ou encore des objets et tableaux enfants.
 * @param idMap - La map (`IdMap`) que l'on souhaite remplir. Pour chaque `@_xmi:id` trouvé,
 *                 une `Map<string, string>` contenant les métadonnées sera ajoutée.
 *
 * @returns Rien (`void`) — la fonction modifie `idDict` en place.
 */
function fillIdMap(struct:Struct | Struct[], idMap:IdMap): void{
    if (struct === null || typeof struct !== "object") {
        return;
    }
    if(Array.isArray(struct)){
        for(const elem of struct){
            fillIdMap(elem, idMap)
        }
        return
    }
    const id = struct['@_xmi:id']

    if(id){
        idMap.set(id as string, struct)
        for(const key in struct){

            if(Array.isArray(struct[key])){
                fillIdMap(struct[key] as Struct[], idMap)
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
export function visibility(visib: string | undefined): VisibilityKind{
    if(visib === 'package'){
        return VisibilityKind.package
    }
    if(visib === 'private'){
        return VisibilityKind.private
    }
    if(visib ==='protected'){
        return VisibilityKind.protected
    }
    else{
        return VisibilityKind.public
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
export function dataTypeConverter(dataTypeAst: Struct): DataType{
    const dType: DataType = {
        $type: "DataType",

        owner: null as Element,
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
    return dType
}

/**
 * Convertit un objet `Struct` représentant un type UML en une instance partielle de `Type`.
 *
 * En fonction du champ `@_type`, la fonction lit les informations associées dans la map `IDs`
 * pour déterminer le type UML (ex: Class, Association, DataType...).
 * 
 * Si le type est reconnu comme `uml:DataType`, la fonction délègue la conversion à `dataTypeConverter`.
 * Dans les autres cas, elle retourne un objet `Type` partiel avec les champs minimaux remplis.
 *
 * @param typeAst - L'objet `Struct` représentant un type UML (avec un champ `@_type`).
 * @param IDs - Une map associant des IDs UML à leurs métadonnées (`type`, `name`, etc.).
 * @returns Une instance de `Type` ou `DataType`, selon le type UML rencontré.
 *
 * @throws Une erreur si le type UML n’est pas reconnu.
 */
export function typeConverter(typeAst: Struct, IDs: IdMap): Type{
    if(typeAst['@_xmi:type'] == 'uml:Association'){
        return associationConverter(typeAst, IDs)
    }
    else if(typeAst['@_xmi:type'] == 'uml:Class'){
        return classConverter(typeAst, IDs)
    }
    else if (typeAst['@_xmi:type'] == 'uml:DataType'){
        return dataTypeConverter(typeAst)
    }
    else{
        throw new Error(`type ${typeAst['@_xmi:type']} is not recognised.`)
    }
}

/**
 * Convertit un objet JSON représentant une propriété UML en une instance de `Property`.
 * 
 * Cette fonction extrait les informations pertinentes d’un nœud JSON  et les transforme
 * en un objet `Property` typé, avec les champs standards comme `name`, `visibility`, 
 * `lower`, `upper`, etc. Elle prend aussi en charge l'association si elle est spécifiée.
 * 
 * Le type de la propriété est résolu à l'aide de la fonction `typeConverter`.
 * 
 * @param propretyAst - L’objet JSON source représentant une propriété UML (avec des champs comme `@_name`, `@_visibility`, etc.).
 * @param IDs - La map d'identifiants (`IdMap`) associant chaque ID XMI à ses métadonnées utiles (type, nom, visibilité…).
 * @param association - (Optionnel) L’association UML à laquelle appartient la propriété, par défaut un objet vide casté.
 * 
 * @returns Une instance complète de `Property`, conforme au métamodèle UML défini dans `umlMetamodel.ts`.
 */
export function propretyConverter(propretyAst: Struct, IDs: IdMap, association: Association = {} as Association): Property {
    const convertedProperty: Property = {
        owner: {} as Element,
        ownedElement: [],
        
        name: propretyAst['@_name'], //TODO sett name
        visibility: visibility(propretyAst['@_visibility']),
        
        isOrdered: false,
        isUnique: false,
        lower: propretyAst['lowerValue'] ? propretyAst['lowerValue']['@_value'] : 1 ,
        // pour upper, si il n'y a pas de limite le max es 2 car dans tous les cas on ne differencie pas les cardinalitées multiples entre elles
        upper: propretyAst['upperValue'] ? propretyAst['lowerValue']['@_value'] == "*" ? 2 : propretyAst['lowerValue']['@_value'] : 1 ,
        
        $type: "Property",
        agggregation: AggregationKind.none,
        isDerived: false,
        initialValue: {} as Expression,
        association: association,
        type: typeConverter(IDs.get(propretyAst["@_type"]), IDs)
    };
    const tempTest1 = propretyAst['upperValue'] ? propretyAst['lowerValue']['@_value'] : undefined
    const tempTest2 = propretyAst['upperValue']
    return convertedProperty
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
export function classConverter(classAst: Struct, IDs: IdMap):Class{
    const convertedClass: Class = {
        owner: {} as Element,
        ownedElement: [],

        name: classAst['@_name'],
        visibility: visibility(classAst['@_visibility']),

        member: {} as NamedElement,

        isAbstract: false,
        inheritedMember: [],
        feature: [],
        generalisations: [],
        general: {} as Generalization,
        attributes: [],

        $type: "Class",
        ownedAttribute: []
    };
    if ('ownedAttribute' in classAst) {
        const ownedAttr = Array.isArray(classAst.ownedAttribute) ? classAst.ownedAttribute : [classAst.ownedAttribute]  
        for (let subMap of ownedAttr as Struct[]){
            convertedClass.attributes.push(propretyConverter(subMap, IDs))
        }
    }
    return convertedClass
}

/**
 * convertit une instance de type Association de jsonObj en un objet Association
 * @param associationAst 
 * @param IDs 
 * @returns 
 */
function associationConverter(associationAst: Struct, IDs: IdMap): Association{
    const convertedAssociation: Association = {
        $type: "Association",
        owner: null as unknown as Element,
        ownedElement: [], // est rempli par la boucle en dessous
        name: associationAst['@_name'],
        visibility: VisibilityKind.public,
        member: null as unknown as NamedElement,
        isAbstract: false,
        inheritedMember: [],
        feature: [],
        generalisations: [],
        general: null as unknown as Generalization,  
        attributes: [],
        isDerived: false,
        addOnly: false,
        ownedEnd: [undefined, undefined],
        navigableOwnedEnd: []
    };
    if ('ownedEnd' in associationAst) {
        (associationAst.ownedEnd as Struct[]).forEach((element,i) => {
            const elem = propretyConverter(element, IDs, convertedAssociation)
            convertedAssociation.ownedEnd[i] = elem
        });
    }
    if('@_navigableOwnedEnd' in associationAst) {
        let mot = ""
        for (const char of associationAst['@_navigableOwnedEnd'] as string){
            if(char != ' '){
                mot += char
            }
            else{
                convertedAssociation.navigableOwnedEnd.push(mot)
                mot = ""
            }
        }
        convertedAssociation.navigableOwnedEnd.push(mot)
    }

    return convertedAssociation
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
export function xmi2Umlconverter(ast: Struct[]):NamedElement[]{
    let model: NamedElement[] = []
    const IDs = createIdMap(ast)
    for( let key in ast){
        const elem = ast[key]
        if(elem['@_xmi:type'] === 'uml:Class'){
            model.push(classConverter(elem, IDs))
        }
        else if(elem['@_xmi:type'] === 'uml:DataType'){
            model.push(dataTypeConverter(elem))
        }
        else if(elem['@_xmi:type'] === 'uml:Association'){
            model.push(associationConverter(elem, IDs))
        }
        else {
            throw new Error(`type ${elem['@_xmi:type']} is not recognised`)
        }
    }

    return model
}

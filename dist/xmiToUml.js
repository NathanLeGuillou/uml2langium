import fs from "fs";
import { VisibilityKind, AggregationKind } from './umlMetamodel.js';
import { XMLParser } from "fast-xml-parser";
/**
 * Transforms a UML XML file (usually in XMI format) into a JavaScript object.
 *
 * - If `fullJObj` is `true`, the function returns the full parsed XML JSON object.
 * - Otherwise, it returns only the array of elements under `uml:Model.packagedElement`,
 *   which is useful to directly access classes, associations, etc.
 *
 * @param path - Path to the XML file to parse (can be a string or file descriptor).
 * @param fullJObj - If `true`, returns the full JSON object. Otherwise, returns `uml:Model.packagedElement` (default is `false`).
 * @returns The full JSON object or just the UML elements in `packagedElement`.
 *
 * @throws {Error} If the file reading or XML parsing fails.
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
/**
 * Builds an `IdMap` from a list of `Struct` objects, representing the abstract syntax tree
 * of a UML model.
 *
 * This map links each identifier (`@_xmi:id`) to its corresponding `Struct` object.
 *
 * @param ast - Array of `Struct` objects representing the raw UML model.
 * @returns A `Map` where each key is an object ID and the value is its corresponding UML `Struct`.
 */
export function createIdMap(ast) {
    let idMap = new Map();
    fillIdMap(ast, idMap);
    return idMap;
}
/**
 * Recursively fills an `IdMap` from a JSON structure (parsed from XMI).
 *
 * This function explores all nodes (including nested ones) looking for a `@_xmi:id` field,
 * and maps them to their corresponding `Struct` in the map.
 *
 * @param struct - JSON object or array to traverse.
 * @param idMap - Map where identified elements will be added.
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
 * Converts a JSON object representing a UML primitive type into a `PrimitiveType` instance.
 *
 * Initializes fields not specified in the original JSON with default values
 * (`undefined`, empty arrays...).
 *
 * @param primitiveTypeAst - JSON `Struct` describing the UML primitive type.
 * @returns A `PrimitiveType` instance conforming to the metamodel.
 */
function primitiveTypeConverter(primitiveTypeAst) {
    return {
        $type: "PrimitiveType",
        name: primitiveTypeAst['@_name'],
        visibility: visibility(primitiveTypeAst['@_visibility']),
        owner: undefined,
        ownedElement: [],
        member: undefined,
        isAbstract: false,
        inheritedMember: [],
        feature: [],
        generalisations: [],
        general: undefined,
        attributes: [],
    };
}
/**
 * Converts a string representing UML visibility into a `VisibilityKind` value.
 *
 * If the string is not recognized (`'package'`, `'private'`, `'protected'`),
 * the function defaults to `VisibilityKind.public`.
 *
 * @param visib - The visibility string (e.g., "private", "protected"...).
 * @returns The corresponding `VisibilityKind` value.
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
 * Converts a JSON object representing a UML `DataType` into a `DataType` instance.
 *
 * This converter extracts key attributes such as name and visibility, and initializes
 * UML properties not set in the JSON with default values (null or empty arrays).
 *
 * @param dataTypeAst - The JSON object representing a UML `DataType`.
 * @returns A `DataType` instance conforming to the metamodel.
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
 * Converts a JSON node representing a UML type into a `Type` instance from the internal metamodel.
 *
 * The function detects the UML type using `@_xmi:type`:
 * - "uml:Class" → via `classConverter`
 * - "uml:Association" → via `associationConverter`
 * - "uml:DataType" → via `dataTypeConverter`
 * - "uml:PrimitiveType" → via `primitiveTypeConverter`
 *
 * @param typeAst - `Struct` object representing a UML type.
 * @param IDs - Identifier map (`IdMap`) to resolve references.
 * @returns A concrete `Type` instance (`Class`, `Association`, `DataType`, etc.).
 *
 * @throws An error if the UML type is not recognized.
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
    else if (typeAst['@_xmi:type'] == 'uml:PrimitiveType') {
        return primitiveTypeConverter(typeAst);
    }
    else {
        const a = 1;
        throw new Error(`type ${typeAst['@_xmi:type']} is not recognised.`);
    }
}
/**
 * Converts a JSON object representing a UML property into a `Property` instance.
 *
 * Resolves the property's type via `typeConverter`, and handles cardinalities
 * (`lowerValue`, `upperValue`) and visibility.
 * If the upper bound is `"*"`, it is represented by the value 2 to indicate multiplicity.
 *
 * @param propretyAst - JSON `Struct` object representing a UML property.
 * @param IDs - Map of elements (`IdMap`) for resolving referenced types.
 * @param association - (Optional) `Association` object to link this property to.
 * @returns A typed `Property` instance.
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
        agggregation: propretyAst["@_aggregation"] == 'composite' ? AggregationKind.composite : AggregationKind.none,
        isDerived: false,
        initialValue: {},
        association: association,
        type: typeConverter(IDs.get(propretyAst["@_type"]), IDs)
    };
    return convertedProperty;
}
/**
 * Converts a UML class instance from a JSON AST (often extracted from an XMI model)
 * into a `Class` object conforming to the UML metamodel.
 *
 * This function retrieves the class name, visibility, attributes, and other UML properties,
 * and structures them into a `Class` object. It also processes internal attributes via `ownedAttribute`,
 * and manages inheritance via `generalization`.
 *
 * @param classAst - The JSON object representing a UML class.
 * @param IDs - The `IdMap` linking each ID to its metadata.
 *
 * @returns A properly constructed `Class` instance.
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
        for (const subMap of ownedAttr) {
            convertedClass.attributes.push(propretyConverter(subMap, IDs));
        }
    }
    if ("generalization" in classAst) {
        if (Array.isArray(classAst["generalization"])) {
            for (const gen of classAst["generalization"]) {
                convertedClass.generalisations.push(generalisationConverter(IDs.get(gen["@_general"]), IDs));
            }
        }
        else {
            convertedClass.generalisations.push(generalisationConverter(IDs.get(classAst["generalization"]["@_general"]), IDs));
        }
    }
    return convertedClass;
}
/**
 * Converts a JSON object representing a UML enumeration into an `Enumeration` instance.
 *
 * This function creates an `Enumeration` object by extracting its literals via `ownedLiteral`,
 * and converting them into `EnumerationLitteral` objects.
 *
 * @param enumAst - UML JSON object with enumeration info.
 * @returns The instantiated `Enumeration` object.
 */
function enumConverter(enumAst) {
    const enumeration = {
        $type: "Enumeration",
        name: enumAst["@_name"],
        visibility: visibility(enumAst['@_visibility']),
        ownedElement: [],
        owner: undefined,
        isAbstract: false,
        inheritedMember: [],
        feature: [],
        generalisations: [],
        general: undefined,
        attributes: [],
        member: undefined,
        ownedLiteral: []
    };
    for (const elem of enumAst["ownedLiteral"]) {
        const enumLitteral = {
            $type: "EnumerationLitteral",
            name: elem["@_name"],
            visibility: visibility(elem['@_visibility']),
            ownedElement: [],
            owner: enumeration
        };
        enumeration.ownedLiteral.push(enumLitteral);
    }
    return enumeration;
}
/**
 * Converts a UML generalization relationship JSON object into a typed `Generalization` instance.
 *
 * The generalization target (`@_general`) is resolved and converted into a UML class.
 *
 * @param genAst - JSON object representing the generalization.
 * @param Ids - Map for resolving the `@_general` identifier.
 * @returns The corresponding `Generalization` object.
 */
function generalisationConverter(genAst, Ids) {
    const result = {
        $type: "Generalization",
        isSubstituable: false,
        ownedElement: [],
        owner: undefined,
        source: [],
        specialization: undefined,
        specific: undefined,
        target: []
    };
    if (genAst["@_xmi:type"] == "uml:Class") {
        result.target.push(classConverter(genAst, Ids));
    }
    else {
        throw new Error(`Type ${genAst["@_xmi:type"]} is not recognised.`);
    }
    return result;
}
/**
 * Converts a JSON `Struct` object representing a UML association into an `Association` instance.
 *
 * The function extracts the association ends (`ownedEnd`) and converts them into UML properties.
 * It also handles navigable ends (`@_navigableOwnedEnd`) as a space-separated string.
 *
 * @param associationAst - JSON object describing the association.
 * @param IDs - The `IdMap` of UML objects, used to resolve types.
 * @returns An `Association` instance.
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
 * Converts a list of UML elements represented as JSON (typically extracted from an XMI file)
 * into a list of `Element` objects corresponding to the internal metamodel.
 *
 * This function dynamically identifies the UML type (`uml:Class`, `uml:DataType`, `uml:Association`, etc.)
 * and applies the appropriate converter for each. It also uses an `IdMap` to centralize
 * the metadata needed for conversions.
 *
 * @param ast - Array of JSON structures representing UML elements to convert.
 * @returns An array of `Element` objects conforming to the internal metamodel.
 *
 * @throws An error if a UML type is unrecognized or unsupported.
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
        else if (elem['@_xmi:type'] === 'uml:PrimitiveType') {
            model.push(primitiveTypeConverter(elem));
        }
        else if (elem['@_xmi:type'] === 'uml:Enumeration') {
            model.push(enumConverter(elem));
        }
        else {
            throw new Error(`type ${elem['@_xmi:type']} is not recognised (function xmi2Umlconverter)`);
        }
    }
    return model;
}
//# sourceMappingURL=xmiToUml.js.map
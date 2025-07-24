/// <reference types="node" resolution-mode="require"/>
import fs from "fs";
import { Class, VisibilityKind, DataType, NamedElement, Property, Association, Type } from './umlMetamodel.js';
import { Struct } from './xmiMetamodel.types.js';
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
export declare function transformXmlIntoJObj(path: fs.PathOrFileDescriptor, fullJObj?: boolean): Struct[];
type IdMap = Map<string, Struct>;
/**
 * Builds an `IdMap` from a list of `Struct` objects, representing the abstract syntax tree
 * of a UML model.
 *
 * This map links each identifier (`@_xmi:id`) to its corresponding `Struct` object.
 *
 * @param ast - Array of `Struct` objects representing the raw UML model.
 * @returns A `Map` where each key is an object ID and the value is its corresponding UML `Struct`.
 */
export declare function createIdMap(ast: Struct[]): IdMap;
/**
 * Converts a string representing UML visibility into a `VisibilityKind` value.
 *
 * If the string is not recognized (`'package'`, `'private'`, `'protected'`),
 * the function defaults to `VisibilityKind.public`.
 *
 * @param visib - The visibility string (e.g., "private", "protected"...).
 * @returns The corresponding `VisibilityKind` value.
 */
export declare function visibility(visib: string | undefined): VisibilityKind;
/**
 * Converts a JSON object representing a UML `DataType` into a `DataType` instance.
 *
 * This converter extracts key attributes such as name and visibility, and initializes
 * UML properties not set in the JSON with default values (null or empty arrays).
 *
 * @param dataTypeAst - The JSON object representing a UML `DataType`.
 * @returns A `DataType` instance conforming to the metamodel.
 */
export declare function dataTypeConverter(dataTypeAst: Struct): DataType;
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
export declare function typeConverter(typeAst: Struct, IDs: IdMap): Type;
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
export declare function propretyConverter(propretyAst: Struct, IDs: IdMap, association?: Association): Property;
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
export declare function classConverter(classAst: Struct, IDs: IdMap): Class;
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
export declare function xmi2Umlconverter(ast: Struct[]): NamedElement[];
export {};

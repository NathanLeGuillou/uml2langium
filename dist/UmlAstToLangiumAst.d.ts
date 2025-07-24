import { Interface, Class, NamedElement, Property, AggregationKind, Type, PrimitiveType, Enumeration } from './umlMetamodel.js';
import { GrammarAST } from 'langium';
export declare class U2LConverter {
    private interfMap;
    private propretiesArray;
    private refArraySimpleType;
    private generalisationMap;
    interfArray: GrammarAST.Interface[];
    primitiveTypeArray: GrammarAST.PrimitiveType[];
    enumArray: GrammarAST.UnionType[];
    private terminalMap;
    /**
     * @method getTerminal
     * Returns the Langium terminal declaration for a given primitive type.
     * The declaration is stored in `terminalMap`.
     *
     * @param primitiveType - Langium primitive type.
     * @returns A string representing the corresponding terminal declaration.
     */
    getTerminal(primitiveType: GrammarAST.PrimitiveType): string;
    /**
     * @method removeDuplicates
     * Recursively removes duplicates from an array in-place.
     * Checks each element and removes it if already seen.
     *
     * @param arr - Array containing the elements.
     * @param seen - Set of already encountered elements (defaults to empty).
     * @param index - Current index (defaults to 0).
     */
    removeDuplicates<T>(arr: T[], seen?: Set<T>, index?: number): void;
    /**
     * @method getTypeString
     * Reconstructs a textual representation of a Langium type.
     * Uses recursion to handle nested types like Array or Reference.
     *
     * @param type - Langium type definition.
     * @returns A string representation of the type.
     */
    getTypeString(type: GrammarAST.TypeDefinition): string;
    /**
     * @method convertPrimitiveTypes
     * Maps UML primitive type names to Langium primitive types.
     * Recognized types are added to `primitiveTypeArray` for later use.
     *
     * @param primitiveType - UML primitive type.
     * @returns The corresponding Langium type, or `undefined` if unrecognized.
     */
    convertPrimitiveTypes(primitiveType: PrimitiveType): GrammarAST.PrimitiveType | undefined;
    /**
     * @method convertClass
     * Transforms a UML class or interface into a Langium Interface.
     * Assigns UML attributes and recursively handles generalizations.
     *
     * @param interfaceOrClass - UML element (Class or Interface).
     * @param container - Langium grammar container.
     * @param containerIndex - Index of the element within `Grammar.interfaces`.
     * @returns A Langium Interface object.
     */
    convertClass(interfaceOrClass: Interface | Class, container: GrammarAST.Grammar, containerIndex: number): GrammarAST.Interface;
    /**
     * @method convertProperty
     * Converts a UML property into a typed Langium attribute (`TypeAttribute`).
     * Uses `convertType` to determine the type and builds the attribute object.
     *
     * @param property - UML source property.
     * @param container - Target Langium Interface.
     * @param index - Position within the container.
     * @returns The generated Langium TypeAttribute.
     */
    convertProperty(property: Property, container: GrammarAST.Interface, index: number): GrammarAST.TypeAttribute;
    /**
     * @method convertPropretyToRef
     * Produces a Langium attribute whose type is a reference (`ReferenceType`).
     * Used for navigable UML properties.
     *
     * @param property - UML property.
     * @param container - Langium Interface.
     * @param index - Index of the property.
     * @returns A TypeAttribute with a ReferenceType.
     */
    convertPropretyToRef(property: Property, container: GrammarAST.Interface, index: number): GrammarAST.TypeAttribute;
    /**
     * @method convertType
     * Dynamically determines the Langium type to generate based on UML properties.
     * Redirects to `convert2ArrayType`, `convert2ReferenceType`, or `convert2SimpleType`.
     *
     * @param type - UML type.
     * @param container - Parent Langium element.
     * @param isArray - Whether the type should be an array.
     * @param isOptional - Whether the type is optional.
     * @param aggregationKind - UML aggregation kind.
     * @param index - Optional container index.
     * @returns A Langium TypeDefinition.
     */
    convertType(type: Type, container: GrammarAST.ArrayType | GrammarAST.ReferenceType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType, isArray: boolean, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.TypeDefinition;
    /**
     * @method convert2AbstractType
     * Transforms a UML type into an abstract Langium type (Interface or Type).
     * Does not include attributes; used in Langium actions.
     *
     * @param type - UML type.
     * @param container - Langium Action.
     * @param isArray - Not used.
     * @param isOptional - Not used.
     * @param aggregationKind - Not used.
     * @param index - Position in the container.
     * @returns A Langium AbstractType.
     */
    convert2AbstractType(type: Type, container: GrammarAST.Action, isArray: boolean, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.AbstractType;
    /**
     * @method convertEnum
     * Builds a Langium `UnionType` from a UML enumeration.
     * The first type is the enumeration name, followed by its literals.
     *
     * @param enumeration - UML Enum.
     * @param container - Langium container.
     * @returns A Langium UnionType.
     */
    convertEnum(enumeration: Enumeration, container?: GrammarAST.TypeAttribute | GrammarAST.ArrayType | GrammarAST.ReferenceType | GrammarAST.UnionType | GrammarAST.Type): GrammarAST.UnionType;
    /**
     * @method convert2SimpleType
     * Converts a UML Type to a Langium SimpleType.
     * If it's a `PrimitiveType`, sets `primitiveType`; otherwise, sets `typeRef`.
     * The generated SimpleType is added to `refArray`.
     *
     * @param type - UML type.
     * @param container - Langium container.
     * @param isOptional - Not used here.
     * @param index - Optional position.
     * @param ref - Optional external reference.
     * @returns A Langium SimpleType.
     */
    convert2SimpleType(type: Type, container: GrammarAST.ReferenceType | GrammarAST.ArrayType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType, isOptional: boolean, index?: number, ref?: string): GrammarAST.SimpleType;
    /**
     * @method convert2ReferenceType
     * Returns a Langium `ReferenceType` pointing to a SimpleType.
     * Used for associations or referenced types.
     *
     * @param type - UML type.
     * @param container - Langium container.
     * @param isOptional - Whether the type is optional.
     * @param aggregationKind - UML aggregation kind.
     * @param index - Optional position.
     * @returns A Langium ReferenceType.
     */
    convert2ReferenceType(type: Type, container: GrammarAST.ReferenceType | GrammarAST.ArrayType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.ReferenceType;
    /**
     * @method convert2ArrayType
     * Creates a Langium `ArrayType` wrapping the inner type.
     * Recursively uses `convertType` to process inner types.
     *
     * @param type - UML type.
     * @param container - Langium container.
     * @param isOptional - Whether elements can be absent.
     * @param aggregationKind - UML aggregation kind.
     * @param index - Optional position.
     * @returns A Langium ArrayType.
     */
    convert2ArrayType(type: Type, container: GrammarAST.ArrayType | GrammarAST.ReferenceType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.ArrayType;
    /**
     * @method isReference
     * Checks whether the UML type is a reference to a class, interface, or enum.
     *
     * @param type - UML type.
     * @returns `true` if it's a reference, otherwise `false`.
     */
    isReference(type: Type): boolean;
    /**
     * @method property2Attribute
     * Converts and adds a UML property as an attribute to a Langium Interface.
     *
     * @param prop - UML property.
     * @param parent - Target Langium Interface.
     */
    property2Attribute(prop: Property, parent: GrammarAST.Interface): void;
    /**
     * @method convertModel
     * Transforms a list of UML elements (`NamedElement[]`) into a Langium grammar.
     * Handles:
     * - Classes/interfaces via `convertClass`
     * - Bidirectional and unidirectional associations
     * - Enumerations via `convertEnum`
     * Also reconstructs references and removes duplicates.
     *
     * @param elems - UML elements to convert.
     * @returns The resulting Langium Grammar object.
     */
    convertModel(elems: NamedElement[]): GrammarAST.Grammar;
}

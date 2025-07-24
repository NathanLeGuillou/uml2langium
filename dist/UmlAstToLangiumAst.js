import { AggregationKind, isClass, isDataType, isInterface, isEnumeration, isAssociation } from './umlMetamodel.js';
export class U2LConverter {
    interfMap = new Map;
    propretiesArray = new Array;
    refArraySimpleType = new Array;
    generalisationMap = new Map;
    interfArray = new Array;
    primitiveTypeArray = new Array;
    enumArray = new Array;
    terminalMap = {
        "string": `terminal STRING: /"(\\\\.|[^"\\\\])*"|'(\\\\.|[^'\\\\])*'/;`,
        "boolean": 'terminal BOOLEAN: /\\b(?:true|false)\\b/;',
        "Date": 'terminal DATE: /^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/(\\d{4}|\\d{2})$;',
        "bigint": 'terminal INT: ^\\d+$;',
        "number": 'terminal FLOAT: [-+]?[0-9]*\\.?[0-9]+;',
    };
    /**
     * @method getTerminal
     * Returns the Langium terminal declaration for a given primitive type.
     * The declaration is stored in `terminalMap`.
     *
     * @param primitiveType - Langium primitive type.
     * @returns A string representing the corresponding terminal declaration.
     */
    getTerminal(primitiveType) {
        return this.terminalMap[primitiveType];
    }
    /**
     * @method removeDuplicates
     * Recursively removes duplicates from an array in-place.
     * Checks each element and removes it if already seen.
     *
     * @param arr - Array containing the elements.
     * @param seen - Set of already encountered elements (defaults to empty).
     * @param index - Current index (defaults to 0).
     */
    removeDuplicates(arr, seen = new Set(), index = 0) {
        if (index >= arr.length)
            return;
        const value = arr[index];
        if (seen.has(value)) {
            arr.splice(index, 1);
            this.removeDuplicates(arr, seen, index);
        }
        else {
            seen.add(value);
            this.removeDuplicates(arr, seen, index + 1);
        }
    }
    /**
     * @method getTypeString
     * Reconstructs a textual representation of a Langium type.
     * Uses recursion to handle nested types like Array or Reference.
     *
     * @param type - Langium type definition.
     * @returns A string representation of the type.
     */
    getTypeString(type) {
        if (type.$type === 'ReferenceType') {
            return this.getTypeString(type.referenceType);
        }
        if (type.$type === 'ArrayType') {
            return `${this.getTypeString(type.elementType)}[]`;
        }
        if (type.$type === 'SimpleType') {
            return type.primitiveType ? type.primitiveType : type.typeRef.$refText;
        }
        return 'unknown';
    }
    /**
     * @method convertPrimitiveTypes
     * Maps UML primitive type names to Langium primitive types.
     * Recognized types are added to `primitiveTypeArray` for later use.
     *
     * @param primitiveType - UML primitive type.
     * @returns The corresponding Langium type, or `undefined` if unrecognized.
     */
    convertPrimitiveTypes(primitiveType) {
        let result;
        const typeName = primitiveType.name.toLowerCase();
        if (typeName == "string" || typeName == "str") {
            result = 'string';
        }
        else if (typeName == "boolean" || typeName == "bool") {
            result = 'boolean';
        }
        else if (typeName == "float" || typeName == "double") {
            result = 'number';
        }
        else if (typeName == "integer" || typeName == "int") {
            result = 'bigint';
        }
        else if (primitiveType.name == "date") {
            result = 'Date';
        }
        else {
            result = undefined;
        }
        this.primitiveTypeArray.push(result);
        return result;
    }
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
    convertClass(interfaceOrClass, container, containerIndex) {
        const attributes = [];
        const result = {
            $type: 'Interface',
            name: interfaceOrClass.name,
            attributes: attributes,
            $container: container,
            $containerIndex: containerIndex,
            superTypes: []
        };
        attributes.push(...interfaceOrClass.attributes
            .map((prop, index) => this.convertProperty(prop, result, index)));
        if (interfaceOrClass.generalisations.length > 0) {
            for (const gen of interfaceOrClass.generalisations) {
                for (const targ of gen.target) {
                    //! const convertedClass = this.convertClass(targ, container, result.attributes.length)
                    result.superTypes.push({
                        //! ref: convertedClass,
                        $refText: targ.name
                    });
                    this.generalisationMap.set(result.name, targ.name);
                }
            }
        }
        this.interfMap.set(result.name, result);
        return result;
    }
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
    convertProperty(property, container, index) {
        const result = {
            $type: 'TypeAttribute',
            $container: container,
            $containerIndex: index,
            isOptional: property.lower == 0,
            name: property.name,
        };
        result.type = this.convertType(property.type, result, property.upper > 1, property.lower == 0, property.agggregation);
        return result;
    }
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
    convertPropretyToRef(property, container, index) {
        const result = {
            $type: 'TypeAttribute',
            $container: container,
            $containerIndex: index,
            isOptional: property.lower == 0,
            name: property.name,
        };
        result.type = {
            $container: result,
            $type: 'ReferenceType',
            referenceType: this.convertType(property.type, result, property.upper > 1, property.lower == 0, property.agggregation)
        };
        return result;
    }
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
    convertType(type, container, isArray, isOptional, aggregationKind, index) {
        if (isArray) {
            return this.convert2ArrayType(type, container, isOptional, index, aggregationKind);
        }
        else if (aggregationKind == AggregationKind.none && !isDataType(type)) {
            return this.convert2ReferenceType(type, container, isOptional, aggregationKind);
        }
        else {
            return this.convert2SimpleType(type, container, false);
        }
    }
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
    convert2AbstractType(type, container, isArray, isOptional, aggregationKind, index) {
        let temptype = '';
        if (type.$type == 'Class' || type.$type == 'Interface') {
            temptype = 'Interface';
        }
        else {
            temptype = 'Type';
        }
        return {
            $type: temptype,
            name: type.name,
            attributes: [],
            $container: container,
            $containerIndex: index,
            superTypes: []
        };
    }
    /**
     * @method convertEnum
     * Builds a Langium `UnionType` from a UML enumeration.
     * The first type is the enumeration name, followed by its literals.
     *
     * @param enumeration - UML Enum.
     * @param container - Langium container.
     * @returns A Langium UnionType.
     */
    convertEnum(enumeration, container) {
        const unionType = {
            $type: 'UnionType',
            types: [],
            $container: container,
            $containerIndex: undefined
        };
        unionType.types.push({
            $type: 'SimpleType',
            $container: unionType,
            $containerIndex: 0,
            stringType: enumeration.name
        });
        for (const elem of enumeration.ownedLiteral) {
            const enumElem = {
                $type: 'SimpleType',
                $container: unionType,
                $containerIndex: unionType.types.length,
                stringType: `'${elem.name}'`
            };
            unionType.types.push(enumElem);
        }
        return unionType;
    }
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
    convert2SimpleType(type, container, isOptional, index, ref) {
        const result = {
            $type: 'SimpleType',
            $container: container,
            $containerIndex: index,
            primitiveType: type.$type == "PrimitiveType" ? this.convertPrimitiveTypes(type) : undefined,
            typeRef: type.$type == "PrimitiveType" ? undefined : {
                $refText: type.name
            }
        };
        this.refArraySimpleType.push(result);
        return result;
    }
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
    convert2ReferenceType(type, container, isOptional, aggregationKind, index) {
        return {
            $container: container,
            $type: 'ReferenceType',
            referenceType: this.convert2SimpleType(type, container, false),
        };
    }
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
    convert2ArrayType(type, container, isOptional, aggregationKind, index) {
        return {
            $container: container,
            $containerIndex: index,
            $type: 'ArrayType',
            elementType: this.convertType(type, container, undefined, isOptional, aggregationKind),
        };
    }
    /**
     * @method isReference
     * Checks whether the UML type is a reference to a class, interface, or enum.
     *
     * @param type - UML type.
     * @returns `true` if it's a reference, otherwise `false`.
     */
    isReference(type) {
        return isEnumeration(type) || isClass(type) || isInterface(type);
    }
    /**
     * @method property2Attribute
     * Converts and adds a UML property as an attribute to a Langium Interface.
     *
     * @param prop - UML property.
     * @param parent - Target Langium Interface.
     */
    property2Attribute(prop, parent) {
        const langProp = this.convertProperty(prop, parent, parent.attributes.length);
        parent.attributes.push(langProp);
    }
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
    convertModel(elems) {
        const result = [];
        const grammar = {
            $type: 'Grammar',
            imports: [],
            definesHiddenTokens: false,
            hiddenTokens: [],
            rules: [],
            usedGrammars: [],
            isDeclared: true,
            interfaces: result,
            types: []
        };
        elems.forEach((value, index) => {
            if (isClass(value) || isInterface(value)) {
                const convertedValue = this.convertClass(value, grammar, index);
                this.interfArray.push(convertedValue);
                result.push(convertedValue);
            }
            else if (isAssociation(value)) {
                if (value.navigableOwnedEnd.length == 2) {
                    this.propretiesArray.push([value.ownedEnd[0], value.ownedEnd[1]]);
                    this.propretiesArray.push([value.ownedEnd[1], value.ownedEnd[0]]);
                }
                else if (value.navigableOwnedEnd.length == 1) {
                    this.propretiesArray.push([value.ownedEnd[0], value.ownedEnd[1]]);
                }
                else {
                    throw new Error(`there can't be ${value.navigableOwnedEnd.length} navigableOwnedEnd on an association.`);
                }
            }
            else if (isEnumeration(value)) {
                const convertedValue = this.convertEnum(value);
                this.enumArray.push(convertedValue);
            }
        });
        for (const [prop1, prop2] of this.propretiesArray) {
            const interfName = prop1.type.name;
            this.interfMap.get(interfName).attributes.push(prop2.agggregation == AggregationKind.composite ?
                this.convertProperty(prop2, this.interfMap.get(interfName), this.interfMap.get(interfName).attributes.length) :
                this.convertPropretyToRef(prop2, this.interfMap.get(interfName), this.interfMap.get(interfName).attributes.length)); // push the property converted in langium objet 
        }
        for (const [key, value] of this.generalisationMap) {
            const ifaceSuperTypes = this.interfMap.get(key).superTypes;
            for (let type of ifaceSuperTypes) {
                type = {
                    ref: this.interfMap.get(type.$refText),
                    $refText: type.$refText
                };
            }
        }
        this.refArraySimpleType.forEach(simpleType => {
            if (simpleType.typeRef) {
                simpleType.typeRef.ref = this.interfMap.get(simpleType.typeRef.$refText);
            }
        });
        this.removeDuplicates(this.primitiveTypeArray);
        return grammar;
    }
}
//# sourceMappingURL=UmlAstToLangiumAst.js.map
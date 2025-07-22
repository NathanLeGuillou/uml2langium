import { AggregationKind, isClass, isDataType, isInterface, isEnumeration, isAssociation } from './umlMetamodel.js';
export class U2LConverter {
    interfMap = new Map;
    propretiesArray = new Array;
    refArray = new Array;
    interfArray = new Array;
    primitiveTypeArray = new Array;
    terminalMap = {
        "string": `terminal STRING: /"(\\\\.|[^"\\\\])*"|'(\\\\.|[^'\\\\])*'/;`,
        "boolean": 'terminal BOOLEAN: /\\b(?:true|false)\\b/;',
        "Date": 'terminal DATE: /^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/(\\d{4}|\\d{2})$;',
        "bigint": 'terminal INT: ^\\d+$;',
        "number": 'terminal FLOAT: [-+]?[0-9]*\\.?[0-9]+;',
    };
    getTerminal(primitiveType) {
        return this.terminalMap[primitiveType];
    }
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
     * Convertit un type primitif UML (PrimitiveType) en un type primitif Langium.
     *
     * @param primitiveType - Le type primitif UML à convertir.
     * @returns Le type primitif Langium correspondant, ou `undefined` si non reconnu.
     */
    convertPrimitiveTypes(primitiveType) {
        let result;
        if (primitiveType.name == "string") {
            result = 'string';
        }
        else if (primitiveType.name == "boolean") {
            result = 'boolean';
        }
        else if (primitiveType.name == "float") {
            result = 'number';
        }
        else if (primitiveType.name == "integer") {
            result = 'bigint';
        }
        else if (primitiveType.name == "date") {
            result = 'Date';
        }
        else {
            return undefined;
        }
        this.primitiveTypeArray.push(result);
        return result;
    }
    /**
     * Convertit une classe ou une interface UML en une interface Langium.
     *
     * @param interfaceOrClass - L’élément UML de type Interface ou Class à convertir.
     * @param container - Le conteneur Grammar AST.
     * @param containerIndex - L'index de l'élément dans le conteneur.
     * @returns L’interface Langium générée.
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
                    const convertedClass = this.convertClass(targ, container, result.attributes.length);
                    result.superTypes.push({
                        ref: convertedClass,
                        $refText: convertedClass.name
                    });
                    // for( const attr of convertedClass.attributes){
                    //     attributes.push(attr)
                    // }
                }
            }
        }
        this.interfMap.set(result.name, result);
        this.interfArray.push(result);
        return result;
    }
    /**
     * Convertit une propriété UML en attribut Langium.
     *
     * @param property - L'objet UML Property à convertir.
     * @param container - Le conteneur Langium (Interface).
     * @param index - L'index de la propriété dans la liste.
     * @returns L’attribut Langium correspondant.
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
     * Convertit un type UML en une définition de type Langium.
     *
     * @param type - Le type UML à convertir.
     * @param container - Le conteneur Langium dans lequel le type sera inséré.
     * @param isArray - Indique si le type est un tableau.
     * @param isOptional - Indique si le type est optionnel.
     * @param aggregationKind - Le type d’agrégation UML.
     * @param index - L'index optionnel du type dans son conteneur.
     * @returns Un objet TypeDefinition Langium.
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
    * Convertit un type UML en `AbstractType` Langium (`Interface` ou `Type`) vide.
    *
    * Ce type abstrait est utilisé pour représenter un type cible dans une action.
    * Il est simplifié (sans attributs ni superTypes) et déduit dynamiquement.
    *
    * @param type - Le type UML à convertir.
    * @param container - L’élément Langium parent (`Action`).
    * @param isArray - Non utilisé ici.
    * @param isOptional - Non utilisé ici.
    * @param aggregationKind - Non utilisé ici.
    * @param index - Position dans le conteneur.
    * @returns Un objet `AbstractType` Langium (`Interface` ou `Type`).
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
    * Convertit un type UML en `SimpleType` Langium, principalement utilisé pour les types primitifs.
    *
    * Si le type est un `PrimitiveType`, il est converti en type primitif Langium.
    * Sinon, le champ `primitiveType` sera `undefined`.
    *
    * @param type - Le type UML à convertir.
    * @param container - L’élément Langium parent.
    * @param isOptional - Indique si le type est optionnel (non utilisé actuellement).
    * @param index - Position dans le conteneur.
    * @returns Un objet `SimpleType` Langium.
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
        this.refArray.push(result);
        return result;
    }
    /**
     * Convertit un type UML en ReferenceType Langium (référence à un autre type).
     *
     * @param type - Le type UML.
     * @param container - Le conteneur Langium.
     * @param isOptional - Si la référence est optionnelle.
     * @param aggregationKind - Le type d’agrégation.
     * @param index - Index dans le conteneur.
     * @returns Un objet ReferenceType Langium.
     */
    convert2ReferenceType(type, container, isOptional, aggregationKind, index) {
        return {
            $container: container,
            $type: 'ReferenceType',
            referenceType: this.convert2SimpleType(type, container, false),
        };
    }
    /**
     * Convertit un type UML en ArrayType Langium.
     *
     * @param type - Le type UML.
     * @param container - Le conteneur Langium.
     * @param isOptional - Si les éléments sont optionnels.
     * @param aggregationKind - Type d’agrégation UML.
     * @param index - Index dans le conteneur.
     * @returns Un objet ArrayType Langium.
     */
    convert2ArrayType(type, container, isOptional, aggregationKind, index) {
        return {
            $container: container,
            $containerIndex: index,
            $type: 'ArrayType',
            elementType: this.convertType(type, container, undefined, isOptional, aggregationKind),
        };
    }
    isReference(type) {
        return isEnumeration(type) || isClass(type) || isInterface(type);
    }
    property2Attribute(prop, parent) {
        const langProp = this.convertProperty(prop, parent, parent.attributes.length);
        parent.attributes.push(langProp);
    }
    /**
    * Convertit un ensemble d’éléments UML (`NamedElement[]`) en un objet `Grammar` Langium.
    *
    * Les `Class` et `Interface` UML sont converties en interfaces Langium.
    * Les `Association` UML sont analysées pour générer des propriétés navigables entre types.
    *
    * @param elems - Liste des éléments UML (classes, interfaces, associations).
    * @returns Un objet `Grammar` contenant les interfaces Langium correspondantes.
    * @throws Erreur si une association UML possède un nombre de `navigableOwnedEnd` non supporté.
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
        });
        for (const [prop1, prop2] of this.propretiesArray) {
            const interfName = prop1.type.name;
            this.interfMap.get(interfName).attributes.push(prop2.agggregation == AggregationKind.composite ?
                this.convertProperty(prop2, this.interfMap.get(interfName), this.interfMap.get(interfName).attributes.length) :
                this.convertPropretyToRef(prop2, this.interfMap.get(interfName), this.interfMap.get(interfName).attributes.length)); // push la property convertie en objet langium
        }
        this.refArray.forEach(simpleType => {
            if (simpleType.typeRef) {
                simpleType.typeRef.ref = this.interfMap.get(simpleType.typeRef.$refText);
            }
        });
        this.removeDuplicates(this.primitiveTypeArray);
        return grammar;
    }
}
//# sourceMappingURL=UmlAstToLangiumAst.js.map
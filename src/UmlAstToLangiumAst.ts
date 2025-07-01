import { Interface, Class, VisibilityKind, DataType, Generalization, Element, NamedElement, Property, Expression, Association, Classifier, AggregationKind, Type, PrimitiveType, isClass, isDataType, isPrimitiveType, isInterface, isEnumeration, isAssociation } from './umlMetamodel.js'
import {GrammarAST} from 'langium'


export class U2LConverter{
    private simpleTypeMap = new Map<string, GrammarAST.SimpleType>; 
    private refMapLink = new Map<string, string>;

    /**
     * Convertit un type primitif UML (PrimitiveType) en un type primitif Langium.
     * 
     * @param primitiveType - Le type primitif UML à convertir.
     * @returns Le type primitif Langium correspondant, ou `undefined` si non reconnu.
     */
    convertPrimitiveTypes(primitiveType: PrimitiveType): GrammarAST.PrimitiveType | undefined {
        if (primitiveType.name == "string") {
            return 'string'
        }
        else if (primitiveType.name == "boolean") {
            return 'boolean'
        }
        else if (primitiveType.name == "float") {
            return 'number'
        }
        else if (primitiveType.name == "integer") {
            return 'bigint'
        }
        else if (primitiveType.name == "date") {
            return 'Date'
        }
        return undefined
    }

    /**
     * Convertit une classe ou une interface UML en une interface Langium.
     * 
     * @param interfaceOrClass - L’élément UML de type Interface ou Class à convertir.
     * @param container - Le conteneur Grammar AST.
     * @param containerIndex - L'index de l'élément dans le conteneur.
     * @returns L’interface Langium générée.
     */
    convertClass(interfaceOrClass: Interface | Class, container: GrammarAST.Grammar, containerIndex: number): GrammarAST.Interface {
        const attributes: GrammarAST.TypeAttribute[] = []

        const result: GrammarAST.Interface = {
            $type: 'Interface',
            name: interfaceOrClass.name,
            attributes: attributes,
            $container: container,
            $containerIndex: containerIndex,
            superTypes: []
        }
        attributes.push(...interfaceOrClass.attributes
            .map((prop, index) => this.convertProperty(prop, result, index))
        )
        return result
    }

    /**
     * Convertit une propriété UML en attribut Langium.
     * 
     * @param property - L'objet UML Property à convertir.
     * @param container - Le conteneur Langium (Interface).
     * @param index - L'index de la propriété dans la liste.
     * @returns L’attribut Langium correspondant.
     */
    convertProperty(property: Property, container: GrammarAST.Interface, index: number): GrammarAST.TypeAttribute {
        const result: Omit<GrammarAST.TypeAttribute, 'type'> & Partial<Pick<GrammarAST.TypeAttribute, 'type'>> = {
            $type: 'TypeAttribute',
            $container: container,
            $containerIndex: index,
            isOptional: property.lower == 0,
            name: property.name,
        }
        result.type = this.convertType(property.type, result as GrammarAST.TypeAttribute, property.upper > 1, property.lower == 0, property.agggregation)
        return result as GrammarAST.TypeAttribute
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
    convertType(type: Type, container: GrammarAST.ArrayType | GrammarAST.ReferenceType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType,
        isArray: boolean, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.TypeDefinition {
        if (isArray) {
            return this.convert2ArrayType(type, container, isOptional, index, aggregationKind)
        }
        else if (aggregationKind == AggregationKind.none && !isDataType(type)) {
            return this.convert2ReferenceType(type, container, isOptional, aggregationKind)
        }
        else {
            return this.convert2SimpleType(type, container, false)
        }
    }

    /**
     * Convertit un type UML en AbstractType Langium (Interface ou Type).
     * 
     * @param type - Le type UML.
     * @param container - Le conteneur Langium Action.
     * @param isArray - Si le type est un tableau.
     * @param isOptional - Si le type est optionnel.
     * @param aggregationKind - Le type d’agrégation.
     * @param index - Index dans le conteneur.
     * @returns Un objet AbstractType Langium.
     */
    convert2AbstractType(type: Type, container: GrammarAST.Action,isArray: boolean, isOptional: boolean, aggregationKind: AggregationKind,
         index?: number): GrammarAST.AbstractType{
        let temptype: any = ''
        if (type.$type == 'Class' || type.$type == 'Interface'){
            temptype = 'Interface'
        }
        else{
            temptype = 'Type'
        }
        return {
            $type:  temptype,
            name: type.name,
            attributes: [],
            $container: container,
            $containerIndex: index,
            superTypes: []

        }
    }

    /**
     * Convertit un type UML en SimpleType Langium.
     * 
     * @param type - Le type UML.
     * @param container - Le conteneur Langium.
     * @param isOptional - Si le type est optionnel.
     * @param index - Index dans le conteneur.
     * @returns Un objet SimpleType Langium.
     */
    convert2SimpleType(type: Type, container: GrammarAST.ReferenceType | GrammarAST.ArrayType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType, isOptional: boolean, index?: number, ref?: string): GrammarAST.SimpleType { //TODO mettre a jour la doc
        const result: GrammarAST.SimpleType = {
            $type: 'SimpleType',
            $container: container,
            $containerIndex: index,
            primitiveType: type.$type == "PrimitiveType" ? this.convertPrimitiveTypes(type as PrimitiveType) : undefined,
        }
        this.simpleTypeMap.set(type.name, result)
        return result

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
    convert2ReferenceType(type: Type, container: GrammarAST.ReferenceType | GrammarAST.ArrayType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.ReferenceType {
        return {
            $container: container,
            $type: 'ReferenceType',
            referenceType: this.convert2SimpleType(type, container, false),

        }
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
    convert2ArrayType(type: Type, container: GrammarAST.ArrayType | GrammarAST.ReferenceType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.ArrayType {
        return {
            $container: container,
            $containerIndex: index,
            $type: 'ArrayType',
            elementType: this.convertType(type, container, undefined, isOptional, aggregationKind),
        }
    }

    isReference(type: Type){
        return isEnumeration(type) || isClass(type) || isInterface(type)
    }

    /** 
     * Convertit un modèle UML (liste d'éléments) en un objet Grammar Langium.
     * 
     * @param elems - La liste des éléments UML à convertir.
     * @returns Un objet `GrammarAST.Grammar` contenant les interfaces et types convertis.
     */
    convertModel(elems: NamedElement[]): GrammarAST.Grammar{ //TODO mettre a jour la doc 

        const result: Array<GrammarAST.Interface> = []

        const grammar: GrammarAST.Grammar = {
            $type: 'Grammar',
            imports: [],
            definesHiddenTokens: false,
            hiddenTokens: [],
            rules: [],
            usedGrammars: [],
            isDeclared: true,
            interfaces: result,
            types: []
        }
        elems.forEach((value , index) =>{
            if(isClass(value) || isInterface(value)){
                const convertedValue = this.convertClass(value, grammar, index)
                result.push(convertedValue)
            }
            else if(isAssociation(value)){
                if( value.navigableOwnedEnd.length == 2){
                    this.refMapLink.set(value.ownedEnd[0].type.name, value.ownedEnd[1].type.name)
                    this.refMapLink.set(value.ownedEnd[1].type.name, value.ownedEnd[0].type.name) 
                }
                else{
                    this.refMapLink.set(value.ownedEnd[0].type.name, value.ownedEnd[1].type.name)
                }
            }
        })
        for(const elem of result){
            const target: string | undefined = this.refMapLink[elem.name]
            if(target){
                this.simpleTypeMap[target].typeRef = {
                    $refText: elem.name,
                    ref: elem
                }
            }
        }
        return grammar
    }
}

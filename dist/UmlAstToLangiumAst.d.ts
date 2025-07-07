import { Interface, Class, NamedElement, Property, AggregationKind, Type, PrimitiveType } from './umlMetamodel.js';
import { GrammarAST } from 'langium';
export declare class U2LConverter {
    private interfMap;
    private propretiesArray;
    /**
     * Convertit un type primitif UML (PrimitiveType) en un type primitif Langium.
     *
     * @param primitiveType - Le type primitif UML à convertir.
     * @returns Le type primitif Langium correspondant, ou `undefined` si non reconnu.
     */
    convertPrimitiveTypes(primitiveType: PrimitiveType): GrammarAST.PrimitiveType | undefined;
    /**
     * Convertit une classe ou une interface UML en une interface Langium.
     *
     * @param interfaceOrClass - L’élément UML de type Interface ou Class à convertir.
     * @param container - Le conteneur Grammar AST.
     * @param containerIndex - L'index de l'élément dans le conteneur.
     * @returns L’interface Langium générée.
     */
    convertClass(interfaceOrClass: Interface | Class, container: GrammarAST.Grammar, containerIndex: number): GrammarAST.Interface;
    /**
     * Convertit une propriété UML en attribut Langium.
     *
     * @param property - L'objet UML Property à convertir.
     * @param container - Le conteneur Langium (Interface).
     * @param index - L'index de la propriété dans la liste.
     * @returns L’attribut Langium correspondant.
     */
    convertProperty(property: Property, container: GrammarAST.Interface, index: number): GrammarAST.TypeAttribute;
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
    convertType(type: Type, container: GrammarAST.ArrayType | GrammarAST.ReferenceType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType, isArray: boolean, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.TypeDefinition;
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
    convert2AbstractType(type: Type, container: GrammarAST.Action, isArray: boolean, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.AbstractType;
    /**
     * Convertit un type UML en SimpleType Langium.
     *
     * @param type - Le type UML.
     * @param container - Le conteneur Langium.
     * @param isOptional - Si le type est optionnel.
     * @param index - Index dans le conteneur.
     * @returns Un objet SimpleType Langium.
     */
    convert2SimpleType(type: Type, container: GrammarAST.ReferenceType | GrammarAST.ArrayType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType, isOptional: boolean, index?: number, ref?: string): GrammarAST.SimpleType;
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
    convert2ReferenceType(type: Type, container: GrammarAST.ReferenceType | GrammarAST.ArrayType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.ReferenceType;
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
    convert2ArrayType(type: Type, container: GrammarAST.ArrayType | GrammarAST.ReferenceType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.ArrayType;
    isReference(type: Type): boolean;
    property2Attribute(prop: Property, parent: GrammarAST.Interface): void;
    /**
     * Convertit un modèle UML (liste d'éléments) en un objet Grammar Langium.
     *
     * @param elems - La liste des éléments UML à convertir.
     * @returns Un objet `GrammarAST.Grammar` contenant les interfaces et types convertis.
     */
    convertModel(elems: NamedElement[]): GrammarAST.Grammar;
}

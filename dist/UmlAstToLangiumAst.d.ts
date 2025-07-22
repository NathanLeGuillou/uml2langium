import { Interface, Class, NamedElement, Property, AggregationKind, Type, PrimitiveType, Enumeration } from './umlMetamodel.js';
import { GrammarAST } from 'langium';
export declare class U2LConverter {
    private interfMap;
    private propretiesArray;
    private refArray;
    interfArray: GrammarAST.Interface[];
    primitiveTypeArray: GrammarAST.PrimitiveType[];
    enumArray: GrammarAST.UnionType[];
    private terminalMap;
    getTerminal(primitiveType: GrammarAST.PrimitiveType): string;
    removeDuplicates<T>(arr: T[], seen?: Set<T>, index?: number): void;
    getTypeString(type: GrammarAST.TypeDefinition): string;
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
    convertPropretyToRef(property: Property, container: GrammarAST.Interface, index: number): GrammarAST.TypeAttribute;
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
    convert2AbstractType(type: Type, container: GrammarAST.Action, isArray: boolean, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.AbstractType;
    /**
     * le premier types dans types est le nom de l'enumeration, le reste sont ses éléments
     * @param enumeration
     * @param container
     * @returns
     */
    convertEnum(enumeration: Enumeration, container?: GrammarAST.TypeAttribute | GrammarAST.ArrayType | GrammarAST.ReferenceType | GrammarAST.UnionType | GrammarAST.Type): GrammarAST.UnionType;
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
    * Convertit un ensemble d’éléments UML (`NamedElement[]`) en un objet `Grammar` Langium.
    *
    * Les `Class` et `Interface` UML sont converties en interfaces Langium.
    * Les `Association` UML sont analysées pour générer des propriétés navigables entre types.
    *
    * @param elems - Liste des éléments UML (classes, interfaces, associations).
    * @returns Un objet `Grammar` contenant les interfaces Langium correspondantes.
    * @throws Erreur si une association UML possède un nombre de `navigableOwnedEnd` non supporté.
    */
    convertModel(elems: NamedElement[]): GrammarAST.Grammar;
}

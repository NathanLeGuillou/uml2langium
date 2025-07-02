export interface Element {
    $type: "DirectedRelationship" | "Generalization" | "Class" | "DataType" | "Interface" | "Enumeration" | "PrimitiveType" | "Association" | "AssociationClass" | "Property" | "EnumerationLitteral" | "TypedElement" | "StructuralFeature";
    owner: Element;
    ownedElement: Element[];
}
export interface Relationship extends Element {
}
export interface DirectedRelationship extends Relationship {
    $type: "DirectedRelationship" | "Generalization";
    source: Element[];
    target: Element[];
}
export interface InterfaceRealisation extends DirectedRelationship {
}
export interface Generalization extends DirectedRelationship {
    $type: "Generalization";
    isSubstituable: boolean;
    specialization: Classifier[];
    specific: Classifier;
}
export interface GeneralisationSet {
    isCovering: boolean;
    isDisjoint: boolean;
    generalizations: Generalization[];
}
export declare enum VisibilityKind {
    private = 0,
    public = 1,
    protected = 2,
    package = 3
}
export interface NamedElement extends Element {
    $type: "Class" | "DataType" | "Interface" | "Enumeration" | "PrimitiveType" | "Association" | "AssociationClass" | "TypedElement" | "EnumerationLitteral" | "StructuralFeature" | "Property";
    name: string;
    visibility: VisibilityKind;
}
export interface NameSpace extends NamedElement {
    $type: "Class" | "DataType" | "Interface" | "Enumeration" | "PrimitiveType" | "Association" | "AssociationClass";
    member: NamedElement;
}
export interface Type extends NamedElement {
    $type: "Class" | "DataType" | "Interface" | "Enumeration" | "PrimitiveType" | "Association" | "AssociationClass";
}
export interface TypedElement extends NamedElement {
    $type: "TypedElement" | "StructuralFeature" | "Property";
    type: Type;
}
export interface Feature extends NamedElement {
    $type: "StructuralFeature";
    isStatic: boolean;
    featuringClassifier: Classifier;
}
export interface StructuralFeature extends TypedElement, Feature {
    $type: "StructuralFeature";
    isReadOnly: boolean;
}
export interface MultiplicityElement extends Element {
    $type: "Property";
    isOrdered: boolean;
    isUnique: boolean;
    lower: number;
    upper: number;
}
export declare enum AggregationKind {
    none = 0,
    shared = 1,
    composite = 2
}
export interface Property extends MultiplicityElement, NamedElement, TypedElement {
    $type: "Property";
    agggregation: AggregationKind;
    isDerived: boolean;
    initialValue: Expression;
    association: Association;
}
export interface Expression {
    $type: "Expression";
}
export interface Association extends Classifier, Relationship {
    $type: "Association" | "AssociationClass";
    isDerived: boolean;
    addOnly: boolean;
    navigableOwnedEnd: Array<string>;
    ownedEnd: [Property, Property];
}
export interface AssociationClass extends Class, Association {
    $type: "AssociationClass";
}
export interface Classifier extends Type, NameSpace {
    $type: "Class" | "DataType" | "Interface" | "Enumeration" | "PrimitiveType" | "Association" | "AssociationClass";
    isAbstract: boolean;
    inheritedMember: NamedElement[];
    feature: Feature[];
    generalisations: Generalization[];
    general: Generalization;
    attributes: Property[];
}
export interface Class extends Classifier {
    $type: "Class" | "AssociationClass";
    ownedAttribute: Property[];
}
export interface Interface extends Classifier {
    ownedAttribute: Property[];
}
export interface DataType extends Classifier {
    $type: "Enumeration" | "PrimitiveType" | "DataType";
}
export interface PrimitiveType extends DataType {
    $type: "PrimitiveType";
}
export interface Enumeration extends DataType {
    $type: "Enumeration";
    ownedLiteral: EnumerationLitteral[];
}
export interface EnumerationLitteral extends NamedElement {
    $type: "EnumerationLitteral";
}
export declare function isClass(value: {
    $type: string;
}): value is Class;
export declare function isDataType(value: {
    $type: string;
}): value is DataType;
export declare function isPrimitiveType(value: {
    $type: string;
}): value is PrimitiveType;
export declare function isInterface(value: {
    $type: string;
}): value is Interface;
export declare function isClassifier(value: {
    $type: string;
}): value is Classifier;
export declare function isAssociation(value: {
    $type: string;
}): value is Association;
export declare function isEnumeration(value: {
    $type: string;
}): value is Enumeration;

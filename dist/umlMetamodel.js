export var VisibilityKind;
(function (VisibilityKind) {
    VisibilityKind[VisibilityKind["private"] = 0] = "private";
    VisibilityKind[VisibilityKind["public"] = 1] = "public";
    VisibilityKind[VisibilityKind["protected"] = 2] = "protected";
    VisibilityKind[VisibilityKind["package"] = 3] = "package";
})(VisibilityKind = VisibilityKind || (VisibilityKind = {}));
export var AggregationKind;
(function (AggregationKind) {
    AggregationKind[AggregationKind["none"] = 0] = "none";
    AggregationKind[AggregationKind["shared"] = 1] = "shared";
    AggregationKind[AggregationKind["composite"] = 2] = "composite";
})(AggregationKind = AggregationKind || (AggregationKind = {}));
export function isClass(value) {
    return value.$type == 'Class';
}
export function isDataType(value) {
    const test = value.$type;
    return value.$type == 'DataType' || value.$type == 'PrimitiveType' || value.$type == 'Enumeration';
}
export function isPrimitiveType(value) {
    return value.$type == 'PrimitiveType';
}
export function isInterface(value) {
    return value.$type == 'Interface';
}
export function isClassifier(value) {
    return value.$type == 'Classifier';
}
export function isAssociation(value) {
    return value.$type == 'Association';
}
export function isEnumeration(value) {
    return value.$type == 'Enumeration';
}
//# sourceMappingURL=umlMetamodel.js.map
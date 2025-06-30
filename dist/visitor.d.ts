import { Class, PrimitiveType, Property } from "./umlMetamodel.js";
export interface Visitor {
    visitClass(clazz: Class): any;
    visitProperty(property: Property): any;
    visitPrimitiveType(type: PrimitiveType): any;
}

import { Class, PrimitiveType, Property, Type } from "./umlMetamodel.js";

export interface Visitor {
    visitClass (clazz: Class)
    visitProperty (property: Property)
    visitPrimitiveType(type: PrimitiveType): any
}

class Acceptor {
    acceptClass (visitor:Visitor, clazz: Class): void{
        visitor.visitClass(clazz)
    }

    acceptType(visitor: Visitor, type: Type): any {
        if(type.$type == "PrimitiveType") {
            return this.acceptPrimitiveType(visitor,type as PrimitiveType);
        }
    }

    acceptPrimitiveType(visitor: Visitor, type: PrimitiveType): any {
        return visitor.visitPrimitiveType(type)
    }
}

class Acceptor {
    acceptClass(visitor, clazz) {
        visitor.visitClass(clazz);
    }
    acceptType(visitor, type) {
        if (type.$type == "PrimitiveType") {
            return this.acceptPrimitiveType(visitor, type);
        }
    }
    acceptPrimitiveType(visitor, type) {
        return visitor.visitPrimitiveType(type);
    }
}
export {};
//# sourceMappingURL=visitor.js.map
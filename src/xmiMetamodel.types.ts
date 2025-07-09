import { AstNode, LinkingError, Reference } from "langium";

export class Struct {
    elem: Map<string, string | Struct | Array<Struct>>

    constructor() {
        this.elem = new Map()
    }
}
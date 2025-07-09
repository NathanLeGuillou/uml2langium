import { AstNode } from "langium";
import { LangiumGrammarFormatter } from "langium/grammar";
export declare class LangiumFormatter extends LangiumGrammarFormatter {
    formatAST(astNode: AstNode): string;
}

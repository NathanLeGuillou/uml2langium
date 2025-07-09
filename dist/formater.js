import { AstUtils } from "langium";
import { LangiumGrammarFormatter } from "langium/grammar";
export class LangiumFormatter extends LangiumGrammarFormatter {
    formatAST(astNode) {
        AstUtils.streamAst(astNode).forEach(node => this.format(node));
        return "";
    }
}
//# sourceMappingURL=formater.js.map
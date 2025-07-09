import { DocumentState, TextDocument, URI } from "langium";
import { LangiumGrammarFormatter } from "langium/grammar";
export class LangiumFormatter extends LangiumGrammarFormatter {
    formatAST(astNode) {
        const uri = URI.parse("http://www.example.com/some/path?query#fragment");
        const result = this.doDocumentFormat({
            uri,
            state: DocumentState.Validated,
            textDocument: TextDocument.create(uri.toString(), "langium", 0, ""),
            parseResult: {
                lexerErrors: [],
                parserErrors: [],
                value: astNode
            },
            references: []
        }, {
            insertSpaces: true,
            tabSize: 4
        }, {
            end: { line: 0, character: 0 },
            start: { line: 0, character: 0 }
        });
        return "";
    }
}
//# sourceMappingURL=formatter.js.map
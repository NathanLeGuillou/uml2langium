import { AstNode, AstUtils, DocumentState, TextDocument, URI } from "langium";
import { LangiumGrammarFormatter } from "langium/grammar";


export class LangiumFormatter extends LangiumGrammarFormatter{
    formatAST(astNode: AstNode): string{
        const uri: URI = URI.parse("http://www.example.com/some/path?query#fragment")
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
        },
        {
            insertSpaces: true,
            tabSize: 4
        },
        {
            end: {line: 0, character: 0 },
            start: {line: 0, character: 0 }
        })
        return ""
    }
}
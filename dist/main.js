import { writeFileSync } from 'fs';
import { U2LConverter } from './UmlAstToLangiumAst.js';
import { transformXmlIntoJObj, xmi2Umlconverter } from './xmiToUml.js';
import nunjucks from 'nunjucks';
/**
 * @function converter
 * @description
 * Transforms a UML file in XMI format into a Langium grammar through a series of conversions:
 * - Parsing the XML into a JSON object
 * - Converting XMI into a UML model
 * - Converting the UML model into a Langium AST
 * - Rendering the grammar using a Nunjucks template
 *
 * @param {string} pathToXML - Path to the UML (.xmi) file to be converted
 * @param {string} langiumFileLocation - Output path where the Langium grammar file will be written
 *
 * @throws
 * - Any error related to XML parsing or grammar generation is propagated
 *
 * @dependencies
 * - transformXmlIntoJObj: transforms the XML file into a JavaScript object
 * - xmi2Umlconverter: converts an XMI object into a UML model
 * - U2LConverter: converts a UML model into a Langium AST
 * - nunjucks: template engine used to generate the Langium grammar file
 * - writeFileSync: writes the generated Langium file to the file system
 */
export function converter(pathToXML, langiumFileLocation) {
    const uml2langium = new U2LConverter();
    const jObj = transformXmlIntoJObj(pathToXML);
    const umlObj = xmi2Umlconverter(jObj);
    const langObj = uml2langium.convertModel(umlObj);
    const contexte = {
        primitiveTypes: uml2langium.primitiveTypeArray,
        interfaces: uml2langium.interfArray,
        enumerations: uml2langium.enumArray,
        getTypeString: (type) => uml2langium.getTypeString(type),
        getTerminal: (type) => uml2langium.getTerminal(type)
    };
    const grammarTemplate = nunjucks.render('src/grammarTemplate.njk', contexte);
    writeFileSync(langiumFileLocation, grammarTemplate);
}
converter('/home/nleguillou/workspace/FSM/model.uml', 'src/langFiles/langFileCli.langium');
//# sourceMappingURL=main.js.map
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
export declare function converter(pathToXML: string, langiumFileLocation: string): void;

import {writeFileSync} from 'fs'
import {U2LConverter} from './UmlAstToLangiumAst.js'
import { transformXmlIntoJObj, xmi2Umlconverter } from './xmiToUml.js'
import nunjucks from 'nunjucks'
import path from 'path'

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
export function converter(pathToXML: string, langiumFileLocation: string, entryRuleName= ""):void{
  const uml2langium = new U2LConverter()

  const jObj = transformXmlIntoJObj(pathToXML)
  const umlObj = xmi2Umlconverter(jObj)
  const langObj = uml2langium.convertModel(umlObj)

  const grammarName = path.basename(langiumFileLocation).split(".")[0]

  const contexte = {
  primitiveTypes: uml2langium.primitiveTypeArray,
  interfaces: uml2langium.interfArray,
  enumerations: uml2langium.enumArray,
  getTypeString: (type) => uml2langium.getTypeString(type),
  getTerminal: (type) => uml2langium.getTerminal(type),
  getTerminalName: (type) => uml2langium.getTerminalName(type),
  getInterfaceFromName: (name) => uml2langium.getInterfaceFromName(name),
  entryRule: uml2langium.getInterfaceFromName(entryRuleName),
  grammarName: grammarName.charAt(0).toUpperCase() + grammarName.slice(1)
  }

  const grammarTemplate = nunjucks.render('src/grammarTemplate.njk', contexte)

  writeFileSync(langiumFileLocation, grammarTemplate)
}
const fsmModel = "/home/nleguillou/workspace/git/model-transformation-uml-langium/src/tests/umlModels/fsmModelV2.uml"
const sourceRoboML = "/home/nleguillou/workspace/git/model-transformation-uml-langium/src/tests/umlModels/roboml.uml"
converter(sourceRoboML, "src/langFiles/langFileCli.langium", "Program")
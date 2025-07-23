import {writeFileSync} from 'fs'
import {U2LConverter} from './UmlAstToLangiumAst.js'
import { transformXmlIntoJObj, xmi2Umlconverter } from './xmiToUml.js'
import nunjucks from 'nunjucks'
/**
 * @function converter
 * @description
 * Transforme un fichier UML au format XMI en une grammaire Langium à l'aide d'une chaîne de conversions successives :
 * - Parsing XML en objet JSON
 * - Transformation XMI en modèle UML
 * - Conversion UML en AST Langium
 * - Rendu de la grammaire via un template Nunjucks
 *
 * @param {string} pathToXML - Chemin vers le fichier UML (.xmi) à convertir
 * @param {string} langiumFileLocation - Chemin de sortie où la grammaire Langium sera écrite
 *
 * @throws
 * - Toute erreur liée au parsing XML ou à la génération de grammaire est propagée
 *
 * @dependencies
 * - transformXmlIntoJObj : transforme le fichier XML en objet JavaScript
 * - xmi2Umlconverter : transforme un objet XMI en modèle UML
 * - U2LConverter : convertit un modèle UML en AST Langium
 * - nunjucks : moteur de template utilisé pour générer le fichier de grammaire Langium
 * - writeFileSync : écrit le fichier Langium généré dans le système de fichiers
 */

export function converter(pathToXML: string, langiumFileLocation: string):void{
  const uml2langium = new U2LConverter()

  const jObj = transformXmlIntoJObj(pathToXML)
  const umlObj = xmi2Umlconverter(jObj)
  const langObj = uml2langium.convertModel(umlObj)

  const contexte = {
  primitiveTypes: uml2langium.primitiveTypeArray,
  interfaces: uml2langium.interfArray,
  enumerations: uml2langium.enumArray,
  getTypeString: (type) => uml2langium.getTypeString(type),
  getTerminal: (type) => uml2langium.getTerminal(type)
  }

  const grammarTemplate = nunjucks.render('src/grammarTemplate.njk', contexte)

  writeFileSync(langiumFileLocation, grammarTemplate)
}
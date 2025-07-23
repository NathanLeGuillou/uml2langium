import {writeFileSync} from 'fs'
import {U2LConverter} from './UmlAstToLangiumAst.js'
import { transformXmlIntoJObj, xmi2Umlconverter } from './xmiToUml.js'
import nunjucks from 'nunjucks'

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

converter('/home/nleguillou/workspace/FSM/model.uml', 'src/langFiles/langFile.langium')

// uml-to-langium generate -i '/home/nleguillou/workspace/FSM/model.uml' -o 'src/langFiles/langFileCli.langium'
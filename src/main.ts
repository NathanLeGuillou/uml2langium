import { LangiumFormatter } from './formatter.js'
import {U2LConverter} from './UmlAstToLangiumAst.js'
import { jObjTest, jObjTestActuel, xmi2Umlconverter } from './xmiToUml.js'
import nunjucks from 'nunjucks';

const uml2lang = new U2LConverter()
const umlObj = xmi2Umlconverter(jObjTestActuel)
const langObj = uml2lang.convertModel(umlObj)

const contexte = {
  name: 'MyGrammar',
  entryRule: 'Model',
  primitiveTypes: uml2lang.primitiveTypeArray,
  interfaces: uml2lang.interfArray,
  getTypeString: (type) => uml2lang.getTypeString(type),
  getTerminal: (type) => uml2lang.getTerminal(type)
};

const grammarTemplate = nunjucks.render('src/grammarTemplate.njk', contexte)

console.log(grammarTemplate)
const a = 1
const b = 2
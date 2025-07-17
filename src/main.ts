import { LangiumFormatter } from './formatter.js'
import {U2LConverter} from './UmlAstToLangiumAst.js'
import { jObjTest, xmi2Umlconverter } from './xmiToUml.js'
import nunjucks from 'nunjucks';

const formatter = new LangiumFormatter()
const uml2lang = new U2LConverter()

const umlObj = xmi2Umlconverter(jObjTest)
const langObj = uml2lang.convertModel(umlObj)

const contexte = {
  name: 'MyGrammar',
  entryRule: 'Model',
  primitivetypes: uml2lang.primitiveTypeArray,
  interfaces: uml2lang.interfArray,
  getTypeString: (type) => uml2lang.getTypeString(type),
};

const grammarTemplate = nunjucks.render('src/grammarTemplate.njk', contexte)

console.log(grammarTemplate)
const a = 1
const b = 2
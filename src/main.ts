import { LangiumFormatter } from './formatter.js'
import {U2LConverter} from './UmlAstToLangiumAst.js'
import {createIdMap, jObjTest, typeConverter, xmi2Umlconverter, propretyConverter, classConverter} from './xmiToUml.js'


const formatter = new LangiumFormatter()
const uml2lang = new U2LConverter()
 

const umlObj = xmi2Umlconverter(jObjTest)

const langObj = uml2lang.convertModel(umlObj)

console.log(langObj)

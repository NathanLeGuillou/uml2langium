import { U2LConverter } from './UmlAstToLangiumAst.js';
import { jObjTest, xmi2Umlconverter } from './xmiToUml.js';
const umlObj = xmi2Umlconverter(jObjTest);
const uml2lang = new U2LConverter();
const langObj = uml2lang.convertModel(umlObj);
console.log(langObj['interfaces'][0]['attributes'][0]);
//# sourceMappingURL=main.js.map
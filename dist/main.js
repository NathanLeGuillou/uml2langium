import { U2LConverter } from './UmlAstToLangiumAst.js';
import { createIdMap, jObjTest, xmi2Umlconverter } from './xmiToUml.js';
const IDs = createIdMap(jObjTest);
const umlObj = xmi2Umlconverter(jObjTest);
const uml2lang = new U2LConverter();
const langObj = uml2lang.convertModel(umlObj);
console.log(langObj);
//# sourceMappingURL=main.js.map
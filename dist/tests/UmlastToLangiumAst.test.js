import { describe, it, expect } from 'vitest';
import * as xmi2Uml from '../xmiToUml.js';
import { U2LConverter } from '../UmlAstToLangiumAst.js';
import * as umlModel from '../umlMetamodel.js';
const jObj = xmi2Uml.transformXmlIntoJObj('src/tests/umlModels /fsmModel.uml');
const IDs = xmi2Uml.createIdMap(jObj);
const umlModelConverted = xmi2Uml.xmi2Umlconverter(jObj);
const converter = new U2LConverter();
const langiumModel = converter.convertModel(umlModelConverted);
describe('convertPrimitiveTypes', () => {
    it('convertit string en string', () => {
        expect(converter.convertPrimitiveTypes({ name: 'string', $type: 'PrimitiveType' })).toBe('string');
    });
    it('convertit integer en bigint', () => {
        expect(converter.convertPrimitiveTypes({ name: 'integer', $type: 'PrimitiveType' })).toBe('bigint');
    });
    it('convertit float en number', () => {
        expect(converter.convertPrimitiveTypes({ name: 'float', $type: 'PrimitiveType' })).toBe('number');
    });
    it('convertit boolean en boolean', () => {
        expect(converter.convertPrimitiveTypes({ name: 'boolean', $type: 'PrimitiveType' })).toBe('boolean');
    });
    it('convertit date en Date', () => {
        expect(converter.convertPrimitiveTypes({ name: 'date', $type: 'PrimitiveType' })).toBe('Date');
    });
    it('retourne undefined pour type inconnu', () => {
        expect(converter.convertPrimitiveTypes({ name: 'unknown', $type: 'PrimitiveType' })).toBeUndefined();
    });
});
describe('convertProperty', () => {
    it('convertit une propriété en attribut Langium', () => {
        const classState = umlModelConverted.find(e => e.name === 'State');
        const prop = classState.attributes.find(a => a.name === 'name');
        const iface = converter.convertClass(classState, { $type: 'Grammar' }, 0);
        const result = converter.convertProperty(prop, iface, 0);
        expect(result.name).toBe('name');
        expect(result.type).toBeDefined();
    });
});
describe('convertClass', () => {
    it('convertit une classe UML en interface Langium', () => {
        const stateClass = umlModelConverted.find(e => e.name === 'State');
        const iface = converter.convertClass(stateClass, { $type: 'Grammar' }, 0);
        expect(iface.name).toBe('State');
        expect(iface.attributes.length).toBeGreaterThan(0);
    });
    it('ajoute la classe convertie à la map interne', () => {
        const stateClass = umlModelConverted.find(e => e.name === 'State');
        converter.convertClass(stateClass, { $type: 'Grammar' }, 0);
        const entry = converter['interfMap'].get('State');
        expect(entry).toBeDefined();
    });
});
describe('convertModel', () => {
    it('convertit tout le modèle UML en AST Langium', () => {
        expect(langiumModel).toBeDefined();
        expect(langiumModel.interfaces.length).toBeGreaterThan(0);
    });
    it('génère des interfaces pour chaque classe UML', () => {
        const umlClasses = umlModelConverted.filter(e => e.$type === 'Class');
        for (const umlCls of umlClasses) {
            const interf = langiumModel.interfaces.find(i => i.name === umlCls.name);
            expect(interf).toBeDefined();
        }
    });
    it('gère les associations bidirectionnelles avec 2 ends', () => {
        const hasBidirectional = langiumModel.interfaces.some(i => i.attributes.some(a => a.type?.$type === 'ReferenceType'));
        expect(hasBidirectional).toBe(true);
    });
});
describe('convert2SimpleType', () => {
    it('retourne un SimpleType avec le bon primitiveType', () => {
        const dummyAttr = { $type: 'TypeAttribute' };
        const result = converter.convert2SimpleType({ name: 'string', $type: 'PrimitiveType' }, dummyAttr, false);
        expect(result.$type).toBe('SimpleType');
        expect(result.primitiveType).toBe('string');
    });
});
describe('convert2ArrayType', () => {
    it('retourne un ArrayType contenant un type simple', () => {
        const dummyContainer = { $type: 'TypeAttribute' };
        const result = converter.convert2ArrayType({ name: 'string', $type: 'PrimitiveType' }, dummyContainer, false, umlModel.AggregationKind.none);
        expect(result.$type).toBe('ArrayType');
        expect(result.elementType.$type).toBe('SimpleType');
    });
});
describe('convert2ReferenceType', () => {
    it('retourne un ReferenceType avec un SimpleType interne', () => {
        const dummyContainer = { $type: 'TypeAttribute' };
        const refType = converter.convert2ReferenceType({ name: 'OtherClass', $type: 'Class' }, dummyContainer, false, umlModel.AggregationKind.none);
        expect(refType.$type).toBe('ReferenceType');
        expect(refType.referenceType.$type).toBe('SimpleType');
    });
});
describe('convert2AbstractType', () => {
    it('retourne Interface si $type est Class', () => {
        const dummy = converter.convert2AbstractType({ name: 'C', $type: 'Class' }, { $type: 'Action' }, false, false, umlModel.AggregationKind.none);
        expect(dummy.$type).toBe('Interface');
    });
    it('retourne Type sinon', () => {
        const dummy = converter.convert2AbstractType({ name: 'T', $type: 'PrimitiveType' }, { $type: 'Action' }, false, false, umlModel.AggregationKind.none);
        expect(dummy.$type).toBe('Type');
    });
});
describe('isReference', () => {
    it('renvoie true pour Class', () => {
        expect(converter.isReference({ $type: 'Class' })).toBe(true);
    });
    it('renvoie false pour DataType', () => {
        expect(converter.isReference({ $type: 'DataType' })).toBe(false);
    });
});
describe('property2Attribute', () => {
    it('ajoute un attribut converti à une interface', () => {
        const stateClass = umlModelConverted.find(e => e.name === 'State');
        const iface = converter.convertClass(stateClass, { $type: 'Grammar' }, 0);
        const lengthBefore = iface.attributes.length;
        converter.property2Attribute(stateClass.attributes[0], iface);
        expect(iface.attributes.length).toBe(lengthBefore + 1);
    });
});
describe('convertModel (cas erreur)', () => {
    it('lève une erreur si une association a 0 navigableOwnedEnd', () => {
        const badAssoc = {
            $type: 'Association',
            navigableOwnedEnd: [],
            ownedEnd: [{}, {}]
        };
        expect(() => converter.convertModel([badAssoc])).toThrow();
    });
});
//# sourceMappingURL=UmlastToLangiumAst.test.js.map
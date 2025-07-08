import { describe, it, expect } from 'vitest'
import * as xmi2Uml from './xmiToUml.js'
import { U2LConverter } from './UmlAstToLangiumAst.js'
import * as umlModel from './umlMetamodel.js'

const jObj = xmi2Uml.transformXmlIntoJObj('./src/fsmModel.uml')
const IDs = xmi2Uml.createIdMap(jObj)
const umlModelConverted = xmi2Uml.xmi2Umlconverter(jObj)
const converter = new U2LConverter()
const langiumModel = converter.convertModel(umlModelConverted)


describe('convertPrimitiveTypes', () => {
    it('convertit string en string', () => {
        expect(converter.convertPrimitiveTypes({ name: 'string', $type: 'PrimitiveType' } as any)).toBe('string')
    })
    it('convertit integer en bigint', () => {
        expect(converter.convertPrimitiveTypes({ name: 'integer', $type: 'PrimitiveType' } as any)).toBe('bigint')
    })
    it('retourne undefined pour type inconnu', () => {
        expect(converter.convertPrimitiveTypes({ name: 'unknown', $type: 'PrimitiveType' } as any)).toBeUndefined()
    })
})

describe('convertProperty', () => {
    it('convertit une propriété en attribut Langium', () => {
        const classState = umlModelConverted.find(e => e.name === 'State') as umlModel.Class
        const prop = classState.attributes.find(a => a.name === 'name')!
        const iface = converter.convertClass(classState, { $type: 'Grammar' } as any, 0)
        const result = converter.convertProperty(prop, iface, 0)
        expect(result.name).toBe('name')
        expect(result.type).toBeDefined()
    })
})

describe('convertClass', () => {
    it('convertit une classe UML en interface Langium', () => {
        const stateClass = umlModelConverted.find(e => e.name === 'State') as umlModel.Class
        const iface = converter.convertClass(stateClass, { $type: 'Grammar' } as any, 0)
        expect(iface.name).toBe('State')
        expect(iface.attributes.length).toBeGreaterThan(0)
    })
})

describe('convertModel', () => {
    it('convertit tout le modèle UML en AST Langium', () => {
        expect(langiumModel).toBeDefined()
        expect(langiumModel.interfaces.length).toBeGreaterThan(0)
    })
})

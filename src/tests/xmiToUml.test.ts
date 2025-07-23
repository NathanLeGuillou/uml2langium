import { describe, it, expect, should } from 'vitest'
import * as xmi2Uml from '../xmiToUml.js'
import * as umlModel from '../umlMetamodel.js'
//* forme des tests :
// describe('Sujet des tests', () => {
//   it('comporte un test', () => {
//     expect(valeur).toBe(ceQuOnAttend)
//   })
// })

const jObjTest = xmi2Uml.transformXmlIntoJObj('src/tests/umlModels /fsmModel.uml')

const IDs = xmi2Uml.createIdMap(jObjTest) 


describe("Fonction visibility", () => {
    it("devrait retourner package", () => {
        expect(xmi2Uml.visibility('package')).toBe(umlModel.VisibilityKind.package)
    })
    it("devrait retourner private", () => {
        expect(xmi2Uml.visibility('private')).toBe(umlModel.VisibilityKind.private)
    })
    it("devrait retourner protected", () => {
        expect(xmi2Uml.visibility('protected')).toBe(umlModel.VisibilityKind.protected)
    })
    it("devrait retourner public pour undefined", () => {
        expect(xmi2Uml.visibility(undefined)).toBe(umlModel.VisibilityKind.public)
    })
    it("devrait retourner public pour une valeur inconnue", () => {
        expect(xmi2Uml.visibility('inconnu')).toBe(umlModel.VisibilityKind.public)
    })
})

describe("dataTypeConverter", () => {
    it("convertit un DataType", () => {
        /**
         * {
         *   '@_xmi:id': '_x4LDoEIJEfCAKoLQDDLBjw',
         *   '@_name': 'final',
         *   '@_type': '_JuDJEEIJEfCAKoLQDDLBjw'
         * }
         */
        const jobjDataType = jObjTest[1]['ownedAttribute'][1]

        const result = xmi2Uml.dataTypeConverter(jobjDataType)
        expect(result.name).toBe("final")
        expect(result.visibility).toBe(umlModel.VisibilityKind.public)
    })
})

describe("typeConverter", () => {
    it("doit retourner un DataType valide", () => {
        /**
         *{ 
         * '@_xmi:type': 'uml:DataType',
         * '@_xmi:id': '_BYcJAEIJEfCAKoLQDDLBjw',
         * '@_name': 'String',
         * '@_visibility': 'public'
         *}
         */
        const jObjDataType = jObjTest[3]

        const result = xmi2Uml.typeConverter(jObjDataType, IDs)
        console.log(result)
        expect(result['name']).toBe("String")
        expect(result['$type'],`type = ${result['$type']}`).toBe("DataType")
    })
})

describe("propretyConverter", () => {
    it("convertit une propriété simple", () => {
        /**
         * {
         * '@_xmi:id': '_mT0PoEIJEfCAKoLQDDLBjw',
         * '@_name': 'name',
         * '@_type': '_BYcJAEIJEfCAKoLQDDLBjw'
         *}
         */
        const jObjProprety = jObjTest[1]['ownedAttribute'][0]

        const result = xmi2Uml.propretyConverter(jObjProprety, IDs)
        expect(result.name).toBe("name")
        expect(result.type.name).toBe("String")
    })
})

describe("classConverter", () => {
    it("convertit une classe avec des propriété", () => {
        /**
         * {
         * ownedAttribute: [
         *   {
         *     '@_xmi:id': '_mT0PoEIJEfCAKoLQDDLBjw',
         *     '@_name': 'name',
         *     '@_type': '_BYcJAEIJEfCAKoLQDDLBjw'
         *   },
         *   {
         *     '@_xmi:id': '_x4LDoEIJEfCAKoLQDDLBjw',
         *     '@_name': 'final',
         *     '@_type': '_JuDJEEIJEfCAKoLQDDLBjw'
         *   }
         * ],
         * ownedOperation: [
         *   {
         *     ownedParameter: [Object],
         *     '@_xmi:id': '_ipumsEINEfCAKoLQDDLBjw',
         *     '@_name': 'addTransition'
         *   },
         *   {
         *     ownedParameter: [Object],
         *     '@_xmi:id': '_tyJsoEINEfCAKoLQDDLBjw',
         *     '@_name': 'getFollowingState'
         *   }
         * ],
         * '@_xmi:type': 'uml:Class',
         * '@_xmi:id': '_MOAWoEIEEfCAKoLQDDLBjw',
         * '@_name': 'State',
         * '@_visibility': 'public'
         *}
         */
        const jobjClass = jObjTest[1]

        const result = xmi2Uml.classConverter(jobjClass, IDs)
        expect(result.name).toBe("State")
        expect(result.attributes.length).toBe(2)
        expect(result.attributes[0].name).toBe("name")
        expect(result.attributes[0].type.name).toBe("String")
    })
})

// Test de converter (modèle complet)
describe("converter", () => {
    it("convertit un modèle simple contenant une classe et un type", () => {
        
    })
    it("lève une erreur pour un type non reconnu", () => {
    })
})


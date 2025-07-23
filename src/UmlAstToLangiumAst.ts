import { Interface, Class, VisibilityKind, DataType, Generalization, Element, NamedElement, Property, Expression, Association, Classifier, AggregationKind, Type, PrimitiveType, isClass, isDataType, isPrimitiveType, isInterface, isEnumeration, isAssociation, TypedElement, MultiplicityElement, Enumeration } from './umlMetamodel.js'
import {DefaultReferences, GrammarAST} from 'langium'
import { classConverter } from './xmiToUml.js'
import { UnionType } from 'langium/grammar'

export class U2LConverter{

    private interfMap = new Map<string, GrammarAST.Interface>
    private propretiesArray = new Array<[Property, Property]>
    private refArray = new Array<GrammarAST.SimpleType>

    public interfArray = new Array<GrammarAST.Interface>
    public primitiveTypeArray = new Array<GrammarAST.PrimitiveType>
    public enumArray = new Array<GrammarAST.UnionType>

    private  terminalMap: Record<GrammarAST.PrimitiveType , string> = { //? mettre datatype ? 
        "string" : `terminal STRING: /"(\\\\.|[^"\\\\])*"|'(\\\\.|[^'\\\\])*'/;`,
        "boolean": 'terminal BOOLEAN: /\\b(?:true|false)\\b/;',
        "Date": 'terminal DATE: /^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/(\\d{4}|\\d{2})$;',
        "bigint": 'terminal INT: ^\\d+$;',
        "number": 'terminal FLOAT: [-+]?[0-9]*\\.?[0-9]+;',
    }

    /**
    * @method getTerminal
    * Retourne la déclaration Langium d’un terminal pour un type primitif donné.
    * La déclaration est stockée dans `terminalMap`.
    *
    * @param primitiveType - Type primitif Langium.
    * @returns La chaîne contenant la déclaration du terminal correspondant.
    */
    getTerminal(primitiveType: GrammarAST.PrimitiveType): string{
        return this.terminalMap[primitiveType]
    }

    /**
    * @method removeDuplicates
    * Supprime les doublons d'un tableau en modifiant ce dernier récursivement.
    * La fonction vérifie chaque élément, et si déjà vu, le supprime.
    *
    * @param arr - Tableau contenant les éléments.
    * @param seen - Set des éléments déjà rencontrés (par défaut vide).
    * @param index - Index courant (par défaut 0).
    */
    removeDuplicates<T>(arr: T[], seen = new Set<T>(), index = 0): void {
        if (index >= arr.length) return;

            const value = arr[index];
        if (seen.has(value)) {
            arr.splice(index, 1);
            this.removeDuplicates(arr, seen, index);
        }
        else {
            seen.add(value);
            this.removeDuplicates(arr, seen, index + 1);
        }
    }

    /**
    * @method getTypeString
    * Reconstruit une représentation textuelle d’un type Langium.
    * Utilise la récursivité pour gérer les types imbriqués comme Array ou Reference.
    *
    * @param type - Définition de type Langium.
    * @returns Chaîne représentant le type.
    */
    getTypeString(type: GrammarAST.TypeDefinition): string {
        if (type.$type === 'ReferenceType') {
            return this.getTypeString(type.referenceType);
        }
        if (type.$type === 'ArrayType') {
            return `${this.getTypeString(type.elementType)}[]`;
        }
        if (type.$type === 'SimpleType') {
            return type.primitiveType ? type.primitiveType : type.typeRef.$refText;
        }
        return 'unknown';
    }

    /**
     * @method convertPrimitiveTypes
     * Associe les noms de types primitifs UML à des types primitifs Langium.
     * Les types reconnus sont ajoutés dans `primitiveTypeArray` pour traitement ultérieur.
     *
     * @param primitiveType - Type primitif UML.
     * @returns Le type Langium ou `undefined` si non reconnu.
     */
    convertPrimitiveTypes(primitiveType: PrimitiveType): GrammarAST.PrimitiveType | undefined {
        let result: GrammarAST.PrimitiveType
        const typeName = primitiveType.name.toLowerCase() 
        if (typeName == "string" || typeName == "str") {
            result = 'string'
        }
        else if (typeName == "boolean" || typeName == "bool") {
            result = 'boolean'
        }
        else if (typeName == "float" || typeName == "double") {
            result = 'number'
        }
        else if (typeName == "integer" || typeName == "int") {
            result = 'bigint'
        }
        else if (primitiveType.name == "date") {
            result = 'Date'
        }
        else{
            result = undefined
        }
        this.primitiveTypeArray.push(result)
        return result
    }

    /**
     * @method convertClass
     * Transforme une classe ou interface UML en Interface Langium.
     * Attribue les attributs UML, gère les généralisations récursivement.
     *
     * @param interfaceOrClass - Élément UML (Class ou Interface).
     * @param container - Grammaire Langium.
     * @param containerIndex - Index de l’élément dans `Grammar.interfaces`.
     * @returns Interface Langium.
     */
    convertClass(interfaceOrClass: Interface | Class, container: GrammarAST.Grammar, containerIndex: number): GrammarAST.Interface {
        const attributes: GrammarAST.TypeAttribute[] = []

        const result: GrammarAST.Interface = {
            $type: 'Interface',
            name: interfaceOrClass.name,
            attributes: attributes,
            $container: container,
            $containerIndex: containerIndex,
            superTypes: []
        }
        attributes.push(...interfaceOrClass.attributes
            .map((prop, index) => this.convertProperty(prop, result, index))
        )
        if(interfaceOrClass.generalisations.length > 0){
            
            for(const gen of interfaceOrClass.generalisations){
                for(const targ of gen.target as Class[]){
                    const convertedClass = this.convertClass(targ, container, result.attributes.length)
                    result.superTypes.push({
                        ref: convertedClass,
                        $refText: convertedClass.name
                    })
                }
            }
        }

        this.interfMap.set(result.name, result)
        return result
    }

    /**
     * @method convertProperty
     * Convertit une propriété UML en attribut typé Langium (`TypeAttribute`).
     * Utilise `convertType` pour le typage, puis construit l’objet.
     *
     * @param property - Propriété UML source.
     * @param container - Interface Langium cible.
     * @param index - Position dans le conteneur.
     * @returns Attribut Langium généré.
     */
    convertProperty(property: Property, container: GrammarAST.Interface, index: number): GrammarAST.TypeAttribute {
        const result: Omit<GrammarAST.TypeAttribute, 'type'> & Partial<Pick<GrammarAST.TypeAttribute, 'type'>> = {
            $type: 'TypeAttribute',
            $container: container,
            $containerIndex: index,
            isOptional: property.lower == 0,
            name: property.name,
        }
        result.type = this.convertType(property.type, result as GrammarAST.TypeAttribute, property.upper > 1, property.lower == 0, property.agggregation)
        return result as GrammarAST.TypeAttribute
    }

    /**
     * @method convertPropretyToRef
     * Produit un attribut Langium dont le type est une référence (`ReferenceType`).
     * Ce cas est utilisé pour les propriétés UML navigables.
     *
     * @param property - Propriété UML.
     * @param container - Interface Langium.
     * @param index - Index de la propriété.
     * @returns TypeAttribute avec ReferenceType comme type.
     */
    convertPropretyToRef(property: Property, container: GrammarAST.Interface, index: number): GrammarAST.TypeAttribute {
        const result: Omit<GrammarAST.TypeAttribute, 'type'> & Partial<Pick<GrammarAST.TypeAttribute, 'type'>> = {
            $type: 'TypeAttribute',
            $container: container,
            $containerIndex: index,
            isOptional: property.lower == 0,
            name: property.name,
        }
        result.type =  {
            $container : result as GrammarAST.TypeAttribute,
            $type: 'ReferenceType',
            referenceType : this.convertType(property.type, result as GrammarAST.TypeAttribute, property.upper > 1, property.lower == 0, property.agggregation)
        }
        return result as GrammarAST.TypeAttribute
    }

    /**
     * @method convertType
     * Détermine dynamiquement le type Langium à générer selon les propriétés UML.
     * Redirige vers `convert2ArrayType`, `convert2ReferenceType` ou `convert2SimpleType`.
     *
     * @param type - Type UML.
     * @param container - Élément Langium parent.
     * @param isArray - Indique si le type est un tableau.
     * @param isOptional - Indique si le type est optionnel.
     * @param aggregationKind - Type d’agrégation UML.
     * @param index - Index optionnel dans le conteneur.
     * @returns Définition de type Langium.
     */
    convertType(type: Type, container: GrammarAST.ArrayType | GrammarAST.ReferenceType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType,
        isArray: boolean, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.TypeDefinition {
        if (isArray) {
            return this.convert2ArrayType(type, container, isOptional, index, aggregationKind)
        }
        else if (aggregationKind == AggregationKind.none && !isDataType(type)) {
            return this.convert2ReferenceType(type, container, isOptional, aggregationKind)
        }
        else {
            return this.convert2SimpleType(type, container, false)
        }
    }

    /**
     * @method convert2AbstractType
     * Transforme un type UML en un type abstrait Langium (Interface ou Type).
     * N’inclut pas d’attributs, utilisé dans les actions.
     *
     * @param type - Type UML.
     * @param container - Action Langium.
     * @param isArray - Non utilisé.
     * @param isOptional - Non utilisé.
     * @param aggregationKind - Non utilisé.
     * @param index - Position dans le conteneur.
     * @returns AbstractType Langium.
     */
    convert2AbstractType(type: Type, container: GrammarAST.Action,isArray: boolean, isOptional: boolean, aggregationKind: AggregationKind,
         index?: number): GrammarAST.AbstractType{
        let temptype: any = ''
        if (type.$type == 'Class' || type.$type == 'Interface'){
            temptype = 'Interface'
        }
        else{
            temptype = 'Type'
        }
        return {
            $type:  temptype,
            name: type.name,
            attributes: [],
            $container: container,
            $containerIndex: index,
            superTypes: []
        }
    }

    /**
     * @method convertEnum
     * Construit un `UnionType` Langium à partir d’une énumération UML.
     * Le premier type est le nom de l’énumération, suivi des littéraux.
     *
     * @param enumeration - Enum UML.
     * @param container - Conteneur Langium.
     * @returns UnionType Langium.
     */
    convertEnum(enumeration: Enumeration, container?: GrammarAST.TypeAttribute | GrammarAST.ArrayType | GrammarAST.ReferenceType 
        | GrammarAST.UnionType | GrammarAST.Type): GrammarAST.UnionType{
        const unionType: GrammarAST.UnionType = {
        $type: 'UnionType',
        types: [],
        $container: container,
        $containerIndex: undefined
        }
        unionType.types.push({
                $type: 'SimpleType',
                $container: unionType,
                $containerIndex: 0,
                stringType: enumeration.name
            })

        for(const elem of enumeration.ownedLiteral){
            const enumElem:GrammarAST.SimpleType = {
                $type: 'SimpleType',
                $container: unionType,
                $containerIndex: unionType.types.length,
                stringType: `'${elem.name}'`
            }
            unionType.types.push(enumElem)
        }
        return unionType
    }

    /**
     * @method convert2SimpleType
     * Convertit un Type UML en SimpleType Langium.
     * Si c’est un `PrimitiveType`, remplit `primitiveType`, sinon `typeRef`.
     * Ajoute le SimpleType généré dans `refArray`.
     *
     * @param type - Type UML.
     * @param container - Conteneur Langium.
     * @param isOptional - Non utilisé ici.
     * @param index - Position facultative.
     * @param ref - Référence externe optionnelle.
     * @returns SimpleType Langium.
     */
    convert2SimpleType(type: Type, container: GrammarAST.ReferenceType | GrammarAST.ArrayType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType, isOptional: boolean, index?: number, ref?: string): GrammarAST.SimpleType { //TODO mettre a jour la doc
        const result: GrammarAST.SimpleType = {//TODO mettre doc à jour pour parler des références
            $type: 'SimpleType',
            $container: container,
            $containerIndex: index,
            primitiveType: type.$type == "PrimitiveType" ? this.convertPrimitiveTypes(type as PrimitiveType) : undefined,
            typeRef: type.$type == "PrimitiveType" ? undefined : {
                $refText: type.name
            }
        }
        this.refArray.push(result)
        return result

    }

    /**
     * @method convert2ReferenceType
     * Retourne un `ReferenceType` Langium vers un SimpleType.
     * Utilisé pour les associations ou types référencés.
     *
     * @param type - Type UML.
     * @param container - Conteneur Langium.
     * @param isOptional - Indique optionnalité.
     * @param aggregationKind - Type UML d’agrégation.
     * @param index - Position optionnelle.
     * @returns ReferenceType Langium.
     */
    convert2ReferenceType(type: Type, container: GrammarAST.ReferenceType | GrammarAST.ArrayType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.ReferenceType {
        return {
            $container: container,
            $type: 'ReferenceType',
            referenceType: this.convert2SimpleType(type, container, false),
        }

    }

    /**
     * @method convert2ArrayType
     * Crée un `ArrayType` Langium contenant le type sous-jacent.
     * Utilise récursivement `convertType` pour gérer les types internes.
     *
     * @param type - Type UML.
     * @param container - Conteneur Langium.
     * @param isOptional - Si les éléments peuvent être absents.
     * @param aggregationKind - Agrégation UML.
     * @param index - Position facultative.
     * @returns ArrayType Langium.
     */
    convert2ArrayType(type: Type, container: GrammarAST.ArrayType | GrammarAST.ReferenceType | GrammarAST.Type | GrammarAST.TypeAttribute | GrammarAST.UnionType, isOptional: boolean, aggregationKind: AggregationKind, index?: number): GrammarAST.ArrayType {
        return {
            $container: container,
            $containerIndex: index,
            $type: 'ArrayType',
            elementType: this.convertType(type, container, undefined, isOptional, aggregationKind),
        }
    }

    /**
     * @method isReference
     * Vérifie si le type UML est une référence vers une classe, interface ou enum.
     *
     * @param type - Type UML.
     * @returns true si c’est une référence, sinon false.
     */
    isReference(type: Type){
        return isEnumeration(type) || isClass(type) || isInterface(type)
    }

    /**
     * @method property2Attribute
     * Convertit et ajoute une propriété UML comme attribut dans une Interface Langium.
     *
     * @param prop - Propriété UML.
     * @param parent - Interface Langium cible.
     */
    property2Attribute(prop: Property, parent: GrammarAST.Interface): void{
        const langProp = this.convertProperty(prop, parent, parent.attributes.length)
        parent.attributes.push(langProp)
    }

    /**
     * @method convertModel
     * Transforme une liste d’éléments UML (`NamedElement[]`) en une grammaire Langium.
     * Gère :
     * - Les classes/interfaces via `convertClass`
     * - Les associations bidirectionnelles et unidirectionnelles
     * - Les énumérations via `convertEnum`
     * Gère aussi la reconstruction des références et supprime les doublons.
     *
     * @param elems - Éléments UML à convertir.
     * @returns Objet Grammar Langium final.
     */
    convertModel(elems: NamedElement[]): GrammarAST.Grammar{
        const result: Array<GrammarAST.Interface> = []

        const grammar: GrammarAST.Grammar = {
            $type: 'Grammar',
            imports: [],
            definesHiddenTokens: false,
            hiddenTokens: [],
            rules: [],
            usedGrammars: [],
            isDeclared: true,
            interfaces: result,
            types: []
        }

        elems.forEach((value , index) =>{
            if(isClass(value) || isInterface(value)){
                const convertedValue = this.convertClass(value, grammar, index)
                this.interfArray.push(convertedValue)
                result.push(convertedValue)
            }
            else if(isAssociation(value)){
                if(value.navigableOwnedEnd.length == 2){
                    this.propretiesArray.push([value.ownedEnd[0], value.ownedEnd[1]])
                    this.propretiesArray.push([value.ownedEnd[1], value.ownedEnd[0]])
                }
                else if(value.navigableOwnedEnd.length == 1){
                    this.propretiesArray.push([value.ownedEnd[0], value.ownedEnd[1]])
                }
                else{
                    throw new Error(`there can't be ${value.navigableOwnedEnd.length} navigableOwnedEnd on an association.`)
                }
            }
            else if(isEnumeration(value)){
                const convertedValue = this.convertEnum(value)
                this.enumArray.push(convertedValue)
            }
        })
        for(const [prop1, prop2] of this.propretiesArray){
            const interfName = prop1.type.name
            this.interfMap.get(interfName).attributes.push(
                prop2.agggregation == AggregationKind.composite ?
                this.convertProperty(prop2, this.interfMap.get(interfName), this.interfMap.get(interfName).attributes.length) :
                this.convertPropretyToRef(prop2, this.interfMap.get(interfName), this.interfMap.get(interfName).attributes.length)
                
            ) // push la property convertie en objet langium
            
        }
        this.refArray.forEach(simpleType => {
            if(simpleType.typeRef){
                (simpleType.typeRef as any).ref = this.interfMap.get(simpleType.typeRef.$refText)
        }
        })
        this.removeDuplicates(this.primitiveTypeArray)
        return grammar
    }
}


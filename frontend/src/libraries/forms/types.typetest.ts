/* eslint-disable @typescript-eslint/no-unused-vars */
import {ArrayPath, Idx, PropertyAtPath, TypedArrayPath} from './types'

type O = {
  boolProp: boolean
  stringProp: string
  boolString: boolean | string
  stringU: string | undefined
  stringUN: string | null | undefined
  boolArray: boolean[]
  boolObjArray: {a: boolean}[]
  objArray: {
    b: boolean
    s: string
  }[]
  obj: {
    b: string
  }
  missing?: string
  missingObj?: {
    s: string
  }
}

type OPath = ArrayPath<O>
type BooleanOPath = TypedArrayPath<boolean, O>
type StringOPath = TypedArrayPath<string, O>

const typedExtendsGeneric : BooleanOPath extends OPath ? 1 : 0 = 1

const oPaths : OPath[] = [
  ['boolProp'],
  ['stringProp'],
  ['boolString'],
  ['stringU'],
  ['stringUN'],
  ['boolArray'],
  ['boolArray', 0],
  ['boolArray', 1],
  ['boolObjArray'],
  ['boolObjArray', 0],
  ['boolObjArray', 0, 'a'],
  ['boolObjArray', 1],
  ['boolObjArray', 1, 'a'],
  ['objArray'],
  ['objArray', 0],
  ['objArray', 0, 'b'],
  ['objArray', 0, 's'],
  ['objArray', 1],
  ['objArray', 1, 'b'],
  ['objArray', 1, 's'],
  ['obj'],
  ['obj', 'b'],
  ['missing'],
  ['missingObj'],
  ['missingObj', 's'],
]

let notPath : OPath
// @ts-expect-error Test that non paths don't assign to paths
notPath  = ['not-a-path']
// @ts-expect-error Test that non paths don't assign to paths
notPath  = ['obj', 'not']

const oBooleanPaths : BooleanOPath[] = [
  ['boolProp'],
  ['boolArray', 0],
  ['boolArray', 1],
  ['boolObjArray', 0, 'a'],
  ['boolObjArray', 1, 'a'],
  ['objArray', 0, 'b'],
  ['objArray', 1, 'b'],
]

const oStringPaths : StringOPath[] = [
  ['stringProp'],
  ['stringU'],
  ['stringUN'],
  ['objArray', 0, 's'],
  ['objArray', 1, 's'],
  ['obj', 'b'],
  ['missing'],
  ['missingObj', 's'],
]

let notBoolPath : BooleanOPath
// @ts-expect-error Test that non paths don't assign to paths
notBoolPath  = ['stringProp']
// @ts-expect-error Test that non paths don't assign to paths
notBoolPath  = ['objArray', 0, 's']

// @ts-expect-error Nothing should be assignable to non existing path
const notPossible : PropertyAtPath<O, 'c.1'> = ''

const string1: PropertyAtPath<O, 'stringProp'> = 's'
const string2: PropertyAtPath<O, 'objArray.1.s'> = 's'
const bool1: PropertyAtPath<O, 'objArray.1.b'> = true
const boolArr: PropertyAtPath<O, 'boolArray'> = [true]
const objArray: PropertyAtPath<O, 'objArray'> = [{s: '', b: true}]
const missingString: PropertyAtPath<O, 'missingObj.s'> = 's'

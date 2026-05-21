import type { AnyNode, MinifiedValue, Transformation } from './types'

import { LEXICAL_KEY_MAPPING, TYPE_UNMAP } from './constants'
import { applyMinifyKey } from './keyMap'
import { expandFabricDiagram, minifyFabricDiagram } from './minifyFabric'
import { applyReverseTransformations, applyTransformations, createDefaultValues, createForTypes } from './transformationUtils'

const minifyKey = (key: string) => applyMinifyKey(LEXICAL_KEY_MAPPING, key)
const typeKey = minifyKey('type')

const forTypes = (types: string[], transformation: Transformation) =>
  createForTypes(types, transformation, { typeKey, typeUnmap: TYPE_UNMAP })

const defaultValues = (defaults: Record<string, MinifiedValue>) =>
  createDefaultValues(defaults, minifyKey)

const transformations: Transformation[] = [
  forTypes(['root', 'paragraph', 'heading', 'list', 'listitem', 'checklist-item', 'layout-container', 'layout-item', 'table', 'tablerow', 'tablecell'], defaultValues({
    indent: 0,
    direction: null,
    format: '',
    version: 1,
  })),
  forTypes(['paragraph'], defaultValues({
    textFormat: 0,
    textStyle: '',
  })),
  forTypes(['text'], defaultValues({
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    version: 1,
  })),
  forTypes(['image', 'tablecell'], defaultValues({
    width: undefined,
  })),
  forTypes(['table'], defaultValues({
    colWidths: undefined,
    frozenColumnCount: undefined,
    frozenRowCount: undefined,
    rowStriping: undefined,
  })),
  forTypes(['checklist-item', 'listitem'], defaultValues({
    checked: undefined,
  })),
  {
    minify: node => Object.fromEntries(Object.entries(node).filter(([_, value]) => value !== undefined)),
    expand: node => node,
  },
  forTypes(['root'], {
    minify: ({ _id: _ignored, ...node }) => node as AnyNode,
    expand: node => node,
  }),
  forTypes(['fabric-diagram'], {
    minify: minifyFabricDiagram,
    expand: expandFabricDiagram,
  }),
]

export const runMinifyTransformations = (node: AnyNode): AnyNode =>
  applyTransformations(transformations, node)

export const runExpandTransformations = (node: AnyNode): AnyNode =>
  applyReverseTransformations(transformations, node)

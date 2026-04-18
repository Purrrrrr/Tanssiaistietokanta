import equal from 'fast-deep-equal'

import { AnyNode, MinifiedValue } from './types'

import { TYPE_UNMAP } from './constants'
import { minifyKey } from './keys'

interface Transformation {
  minify: (node: AnyNode) => AnyNode
  expand: (node: AnyNode) => AnyNode
}

const forTypes = (types: string[], transformation: Transformation): Transformation => ({
  minify: (node: AnyNode) => {
    const minifiedType = node[minifyKey('type')] as string
    const type = TYPE_UNMAP[minifiedType] ?? minifiedType
    if (types.includes(type as string)) {
      return transformation.minify(node)
    }
    return node
  },
  expand: (node: AnyNode) => {
    if (types.includes(node.type as string)) {
      return transformation.expand(node)
    }
    return node
  },
})

const defaultValues = (defaults: Record<string, MinifiedValue>): Transformation => ({
  minify: (node: AnyNode) => {
    let changed = false
    const result = { ...node }
    for (const [key, defaultValue] of Object.entries(defaults)) {
      const minKey = minifyKey(key)
      if (equal(result[minKey], defaultValue)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete result[minKey]
        changed = true
      }
    }
    return changed ? result : node
  },
  expand: (node: AnyNode) => {
    let changed = false
    const newFields = {}
    for (const [key, defaultValue] of Object.entries(defaults)) {
      if (node[key] === undefined) {
        newFields[key] = defaultValue
        changed = true
      }
    }
    return changed ? { ...node, ...newFields } : node
  },
})

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
]

export const runMinifyTransformations = (node: AnyNode): AnyNode => {
  let result = node
  for (const transformation of transformations) {
    result = transformation.minify(result)
  }
  return result
}

export const runExpandTransformations = (node: AnyNode): AnyNode => {
  let result = node
  for (const transformation of transformations.slice().reverse()) {
    result = transformation.expand(result)
  }
  return result
}

import type { AnyNode, Transformation } from 'libraries/common/minificationUtils'
import { applyReverseTransformations, applyTransformations, defaultValues, forTypes, keyMapper, mapKey, typeMapper } from 'libraries/common/minificationUtils'

import { LEXICAL_KEY_MAPPING, TYPE_MAPPING } from './constants'

const transformations: Transformation[] = [
  {
    minify: node => node,
    expand: node => node.type === 'root'
      ? ({ root: node })
      : node,
  },
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
  mapKey<AnyNode[] | null>('children', {
    minify: objects => objects?.map(runMinifyTransformations) ?? null,
    expand: objects => objects?.map(runExpandTransformations) ?? null,
  }),
  typeMapper(TYPE_MAPPING),
  keyMapper(LEXICAL_KEY_MAPPING),
]

export const runMinifyTransformations = (node: AnyNode): AnyNode =>
  applyTransformations(transformations, node)

export const runExpandTransformations = (node: AnyNode): AnyNode =>
  applyReverseTransformations(transformations, node)

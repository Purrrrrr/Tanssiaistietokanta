import type { AnyNode, MinifiedValue, Transformation } from './types'

import { FABRIC_KEY_MAPPING, KEY_MAP } from './constants'
import { applyMinifyKey, expandObjectKeys, minifyObjectKeys } from './keyMap'
import { applyReverseTransformations, applyTransformations, createDefaultValues, createForTypes } from './transformationUtils'

const fabricMinifyKey = (key: string) => applyMinifyKey(FABRIC_KEY_MAPPING, key)
const forTypes = (types: string[], transformation: Transformation) =>
  createForTypes(types, transformation, { typeKey: fabricMinifyKey('type'), typeUnmap: {} })
const defaultValues = (defaults: Record<string, MinifiedValue>) =>
  createDefaultValues(defaults, fabricMinifyKey)

/** Default values to strip from every fabric object during minification. */
const fabricObjectTransformations = [
  defaultValues({
    angle: 0,
    opacity: 1,
    visible: true,
    shadow: null,
    flipX: false,
    flipY: false,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    originX: 'center',
    originY: 'center',
    strokeWidth: 2,
    strokeDashArray: null,
    strokeDashOffset: 0,
    strokeUniform: false,
    paintFirst: 'fill',
    globalCompositeOperation: 'source-over',
    fillRule: 'nonzero',
    backgroundColor: '',
  }),
  forTypes(['Circle', 'Ellipse', 'Polygon', 'Textbox'], defaultValues({
    // strokeMiterLimit: 4,
    // strokeLineCap: 'butt',
    // strokeLineJoin: 'miter',
  })),
  forTypes(['Path'], defaultValues({
    // strokeMiterLimit: 10,
    // strokeLineCap: 'round',
    // strokeLineJoin: 'round',
  })),
  forTypes(['Circle'], defaultValues({
    // startAngle: 0,
    // endAngle: 360,
    // counterClockwise: false,
  })),
  forTypes(['Textbox'], defaultValues({
    // fontSize: 20,
    // fontWeight: 'normal',
    // fontFamily: 'Times New Roman',
    // fontStyle: 'normal',
    // lineHeight: 1.16,
    // charSpacing: 0,
    // textAlign: 'left',
    // styles: [],
    // pathStartOffset: 0,
    // pathSide: 'left',
    // pathAlign: 'baseline',
    // underline: false,
    // overline: false,
    // linethrough: false,
    // textBackgroundColor: '',
    // direction: 'ltr',
    // textDecorationThickness: 66.667,
    // minWidth: 20,
    // splitByGrapheme: false,
  })),
]

function minifyFabricObject(obj: AnyNode): AnyNode {
  const keyed = minifyObjectKeys(FABRIC_KEY_MAPPING, obj)
  const transformed = applyTransformations(fabricObjectTransformations, keyed)
  // Recursively minify nested groups
  const objectsKey = fabricMinifyKey('objects')
  if (Array.isArray(transformed[objectsKey])) {
    return {
      ...transformed,
      [objectsKey]: (transformed[objectsKey] as AnyNode[]).map(minifyFabricObject),
    }
  }
  return transformed
}

function expandFabricObject(obj: AnyNode): AnyNode {
  const restored = applyReverseTransformations(fabricObjectTransformations, obj)
  const expanded = expandObjectKeys(FABRIC_KEY_MAPPING, restored)
  // Recursively expand nested groups
  if (Array.isArray(expanded.objects)) {
    return {
      ...expanded,
      objects: (expanded.objects as AnyNode[]).map(expandFabricObject),
    }
  }
  return expanded
}

function parseFabricData(raw: unknown): AnyNode | null {
  if (!raw) return null
  if (typeof raw === 'object') return raw as AnyNode
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as AnyNode
    } catch {
      return null
    }
  }
  return null
}

const dataKey = KEY_MAP.data

/** Minifies the fabric canvas JSON stored in the `da` (data) field of a fabric-diagram node. */
export function minifyFabricDiagram(node: AnyNode): AnyNode {
  const canvasData = parseFabricData(node[dataKey])
  if (!canvasData) return node

  const minifiedCanvas: AnyNode = minifyObjectKeys(FABRIC_KEY_MAPPING, canvasData)
  const objectsKey = fabricMinifyKey('objects')
  if (Array.isArray(minifiedCanvas[objectsKey])) {
    minifiedCanvas[objectsKey] = (minifiedCanvas[objectsKey] as AnyNode[]).map(minifyFabricObject)
  }

  return { ...node, [dataKey]: minifiedCanvas }
}

/** Expands a minified fabric canvas JSON in the `da` (data) field back to full Fabric.js format. */
export function expandFabricDiagram(node: AnyNode): AnyNode {
  const canvasData = parseFabricData(node.data)
  if (!canvasData) return node

  const expandedCanvas = expandObjectKeys(FABRIC_KEY_MAPPING, canvasData)
  if (Array.isArray(expandedCanvas.objects)) {
    expandedCanvas.objects = (expandedCanvas.objects as AnyNode[]).map(expandFabricObject)
  }

  return { ...node, data: expandedCanvas }
}

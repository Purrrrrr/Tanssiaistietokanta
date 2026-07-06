import type { AnyNode } from './types'

import { FABRIC_KEY_MAPPING } from './constants'
import { applyReverseTransformations, applyTransformations, defaultValues, forTypes, keyMapper, mapKey } from './transformationUtils'

/** Default values to strip from every fabric object during minification. */
const fabricObjectTransformations = [
  defaultValues({
    version: '7.4.0',
  }),
  forTypes(['Rect', 'Circle', 'Ellipse', 'Polygon', 'Textbox', 'Path', 'Arrowline'], defaultValues({
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
  })),
  forTypes(['Rect', 'Circle', 'Ellipse', 'Polygon', 'Textbox', 'Arrowline'], defaultValues({
    strokeMiterLimit: 4,
    strokeLineCap: 'butt',
    strokeLineJoin: 'miter',
  })),
  forTypes(['Path'], defaultValues({
    strokeMiterLimit: 10,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
  })),
  forTypes(['Path'], mapKey<(string | number)[][], string>('path', {
    minify: path => path
      .map(segment => segment.map(value => typeof value == 'number' ? value.toFixed(2) : value).join(' '))
      .join(','),
    expand: path => path.split(',').map(segment => segment.split(' ').map(value => isNaN(Number(value)) ? value : Number(value))),
  })),
  forTypes(['Circle'], defaultValues({
    startAngle: 0,
    endAngle: 360,
    counterClockwise: false,
  })),
  forTypes(['Textbox'], defaultValues({
    fontSize: 20,
    fontWeight: 'normal',
    fontFamily: 'Times New Roman',
    fontStyle: 'normal',
    lineHeight: 1.16,
    charSpacing: 0,
    textAlign: 'left',
    styles: [],
    pathStartOffset: 0,
    pathSide: 'left',
    pathAlign: 'baseline',
    underline: false,
    overline: false,
    linethrough: false,
    textBackgroundColor: '',
    direction: 'ltr',
    textDecorationThickness: 66.667,
    minWidth: 20,
    splitByGrapheme: false,
  })),
  mapKey<AnyNode[] | undefined>('objects', {
    minify: objects => objects?.map(minifyFabricObject),
    expand: objects => objects?.map(expandFabricObject),
  }),
  keyMapper(FABRIC_KEY_MAPPING),
]

export function minifyFabricObject(obj: AnyNode): AnyNode {
  return applyTransformations(fabricObjectTransformations, obj)
}

export function expandFabricObject(obj: AnyNode): AnyNode {
  return applyReverseTransformations(fabricObjectTransformations, obj)
}

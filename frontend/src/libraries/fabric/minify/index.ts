import type { AnyNode, Transformation } from 'libraries/common/minificationUtils'
import { applyReverseTransformations, applyTransformations, defaultValues, forTypes, keyMapper, mapKey } from 'libraries/common/minificationUtils'

import { FABRIC_KEY_MAPPING } from './constants'

/** Default values to strip from every fabric object during minification. */
const fabricObjectTransformations = [
  defaultValues({
    version: '7.4.0',
  }),
  forTypes(['Circle'], {
    minify: ({ width: _, height: __, ...rest }: AnyNode) => rest,
    expand: ({ radius, ...rest }: AnyNode) => ({
      ...rest,
      radius,
      width: radius as number * 2,
      height: radius as number * 2,
    }),
  }),
  forTypes(['Ellipse'], {
    minify: ({ width: _, height: __, ...rest }: AnyNode) => rest,
    expand: ({ rx, ry, ...rest }: AnyNode) => ({
      ...rest,
      rx, ry,
      width: rx as number * 2,
      height: ry as number * 2,
    }),
  }),
  forTypes(['Circle'], transformDimensionsProps(['left', 'top', 'radius'], 'dimensions')),
  forTypes(['Ellipse'], transformDimensionsProps(['left', 'top', 'rx', 'ry'], 'dimensions')),
  forTypes(['Rect', 'Polygon', 'Textbox', 'Path'], transformDimensionsProps(['left', 'top', 'width', 'height'], 'dimensions')),
  forTypes(['Rect', 'Circle', 'Ellipse', 'Polygon', 'Textbox', 'Path', 'Arrowline', 'Polyline'], defaultValues({
    fill: '#fff',
    stroke: '#000',
    strokeWidth: 2,
  })),
  forTypes(['Rect', 'Circle', 'Ellipse', 'Polygon', 'Textbox', 'Arrowline', 'Polyline'], defaultValues({
    strokeUniform: true,
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
  mapKey<AnyNode[] | undefined>('objects', {
    minify: objects => objects?.map(minifyFabricObject),
    expand: objects => objects?.map(expandFabricObject),
  }),
  keyMapper(FABRIC_KEY_MAPPING),
]

function transformDimensionsProps(props: string[], resultProp: string): Transformation {
  return {
    minify: (obj: AnyNode) => {
      const values = props.map(prop => obj[prop]) as number[]
      obj[resultProp] = values.map(value => Number(value.toFixed(2))).join(',')
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      props.forEach(prop => delete obj[prop])
      return obj
    },
    expand: (obj: AnyNode) => {
      const { [resultProp]: minified, ...rest } = obj
      if (typeof minified === 'string') {
        const values = minified.split(',').map(value => Number(value))
        if (values.length === props.length) {
          props.forEach((prop, index) => {
            rest[prop] = values[index]
          })
        }
        return rest
      }
      return obj
    },
  }
}

export function minifyFabricObject(obj: AnyNode): AnyNode {
  return applyTransformations(fabricObjectTransformations, obj)
}

export function expandFabricObject(obj: AnyNode): AnyNode {
  return applyReverseTransformations(fabricObjectTransformations, obj)
}

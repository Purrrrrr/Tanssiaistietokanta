import { Canvas, Circle, config, Ellipse } from 'fabric'

import { hashValue } from 'libraries/common/hashValue'
import randomIdWithLen from 'utils/randomId'

import { minifyFabricObject } from '../minify'

export const randomId = () => randomIdWithLen(9)

export async function saveCanvasToJson(canvas: Canvas) {
  canvas.getObjects().forEach(obj => {
    obj._id ??= randomId()
  })
  normalizeObjectScales(canvas)
  const json = minifyFabricObject(canvas.toJSON())
  const data = { data: json, width: canvas.width, height: canvas.height }
  const hash = await hashValue(data)
  return { ...data, hash }
}

export const round = (value: number) => Number(value.toFixed(config.NUM_FRACTION_DIGITS))

function normalizeObjectScales(canvas: Canvas) {
  canvas.getObjects().forEach(obj => {
    if (obj.scaleX === 1 && obj.scaleY === 1) return
    switch (obj.type) {
      case 'rect':
        obj.set({
          width: round(obj.width * obj.scaleX),
          height: round(obj.height * obj.scaleY),
          scaleX: 1,
          scaleY: 1,
        })
        break
      case 'circle': {
        const minScale = Math.min(obj.scaleX, obj.scaleY)
        obj.set({
          radius: round((obj as Circle).radius * minScale),
          scaleX: round(obj.scaleX / minScale),
          scaleY: round(obj.scaleY / minScale),
        })
        break
      }
      case 'ellipse':
        obj.set({
          rx: round((obj as Ellipse).rx * obj.scaleX),
          ry: round((obj as Ellipse).ry * obj.scaleY),
          scaleX: 1,
          scaleY: 1,
        })
        break
      default:
        return
    }
  })
}

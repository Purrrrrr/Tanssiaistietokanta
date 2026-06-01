import { Polyline } from 'fabric'

import randomId from 'utils/randomId'

interface XYI { x: number, y: number, _id: string }

const originalToObject = Polyline.prototype.toObject

Polyline.prototype.toObject = function (propertiesToInclude) {
  const original = originalToObject.call(this, propertiesToInclude as unknown as undefined[]) // I have no idea why the typings are so weird for this method, but this works
  const points = this.points as XYI[]
  points.forEach((point: XYI) => {
    point._id ??= randomId(3)
  })
  return {
    ...original,
    points: points.map(({ x, y, _id }) => ({ x, y, _id })),
  }
}

import { Polyline } from 'fabric'

import randomId from 'utils/randomId'

interface XYI { x: number, y: number, _id: string }

const originalToObject = Polyline.prototype.toObject

Polyline.prototype.toObject = function (propertiesToInclude) {
  const original = originalToObject.call(this, propertiesToInclude as any)
  return {
    ...original,
    points: (original.points as XYI[]).map(({ x, y, _id }) => ({ x, y, _id: _id ?? randomId(3) })),
  }
}

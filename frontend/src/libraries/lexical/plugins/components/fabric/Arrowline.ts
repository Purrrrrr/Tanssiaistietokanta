import { controlsUtils, FabricObjectProps, ObjectEvents, Polyline, SerializedPolylineProps, TClassProperties } from 'fabric'

export class Arrowline extends Polyline {
  static type = 'Arrowline'
  static ownDefaults: Partial<TClassProperties<Polyline<Partial<FabricObjectProps>, SerializedPolylineProps, ObjectEvents>>> = {
    controls: controlsUtils.createPolyControls(2),
    hasBorders: false,
    cornerStyle: 'circle',
    cornerSize: 15,
    perPixelTargetFind: true,
  }

  constructor(points: { x: number, y: number }[], options?: Partial<FabricObjectProps>) {
    super(points, options)
    this.set({ ...Arrowline.ownDefaults })
  }

  _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx)

    if (this.width === 0 || this.height === 0 || !this.visible) return // skip rendering arrowhead for zero-length lines

    const { x1, y1, x2, y2 } = this.calcLinePoints()
    const yDiff = y2 - y1
    const xDiff = x2 - x1

    const angle = Math.atan2(yDiff, xDiff)
    const base = this.strokeWidth
    const headLength = base * 4 // length of the arrowhead, proportional to stroke width
    const headWidth = base * 3 // width of the arrowhead, proportional to stroke width

    ctx.save()
    ctx.translate(xDiff / 2, yDiff / 2) // move to line midpoint for better arrowhead positioning
    ctx.rotate(angle) // rotate to line angle
    ctx.beginPath()
    ctx.moveTo(base, 0)
    ctx.lineTo(base - headLength, headWidth)
    ctx.lineTo(base - headLength, -headWidth)
    ctx.closePath()
    ctx.fillStyle = this.stroke as string
    ctx.fill()

    ctx.restore()
  }

  calcLinePoints(): { x1: number, y1: number, x2: number, y2: number } {
    const { points } = this
    return {
      x1: points[0].x,
      y1: points[0].y,
      x2: points[1].x,
      y2: points[1].y,
    }
  }
}

import { controlsUtils, FabricObjectProps, ObjectEvents, Polygon, Polyline, SerializedPolylineProps, TClassProperties, TSVGReviver } from 'fabric'

export class Arrowline extends Polyline {
  static type = 'Arrowline'
  static ownDefaults: Partial<TClassProperties<Polyline<Partial<FabricObjectProps>, SerializedPolylineProps, ObjectEvents>>> = {
    controls: controlsUtils.createPolyControls(2),
    hasBorders: false,
    cornerStyle: 'circle',
    cornerSize: 15,
    perPixelTargetFind: true,
  }

  get type(): string {
    return Arrowline.type
  }

  constructor(points: { x: number, y: number }[], options?: Partial<FabricObjectProps>) {
    super(points, options)
    this.set({ ...Arrowline.ownDefaults })
  }

  toSVG(reviver: TSVGReviver): string {
    return super.toSVG(reviver)
      .replace('arrowline', 'polyline') // replace the tag name to avoid confusion
      .replace('</g>', `${this._getArrowSvg(reviver)}</g>`) // add arrowhead polygon to the end of the polyline
  }

  toClipPathSVG(reviver: TSVGReviver): string {
    return super.toClipPathSVG(reviver)
      .replace('arrowline', 'polyline') // replace the tag name to avoid confusion
      .replace('</g>', `${this._getArrowSvg(reviver)}</g>`) // add arrowhead polygon to the end of the polyline
  }

  _getArrowSvg(reviver: TSVGReviver): string {
    const { angle, yDiff, xDiff, base, headWidth, headLength } = this.calcArrowDetails()
    const ax = Math.cos(angle)
    const ay = Math.sin(angle)
    const x = xDiff / 2 + base * ax
    const y = yDiff / 2 + base * ay
    const p = new Polygon([
      { x, y },
      { x: x - ax * headLength + ay * headWidth, y: y - ay * headLength - ax * headWidth },
      { x: x - ax * headLength - ay * headWidth, y: y - ay * headLength + ax * headWidth },
    ], { fill: this.stroke })
    return p.toSVG(reviver)
  }

  _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx)
    if (!this.visible) return // skip rendering arrowhead for zero-length lines

    const {
      angle, xDiff, yDiff, base, headLength, headWidth,
    } = this.calcArrowDetails()

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

  calcArrowDetails() {
    const { x1, y1, x2, y2 } = this.calcLinePoints()
    const yDiff = y2 - y1
    const xDiff = x2 - x1

    const angle = Math.atan2(yDiff, xDiff)
    const base = this.strokeWidth
    const headLength = base * 4 // length of the arrowhead, proportional to stroke width
    const headWidth = base * 3 // width of the arrowhead, proportional to stroke width

    return { yDiff, xDiff, base, angle, headLength, headWidth }
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

import { useEffect } from 'react'
import { Canvas, Circle, Ellipse, FabricObject, PencilBrush, Polygon, Rect, Textbox, TFiller } from 'fabric'

import { useEditorT } from 'libraries/lexical/i18n'
import randomId from 'utils/randomId'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function regularPolygonPoints(sides: number, radius: number) {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (2 * Math.PI * i / sides) - Math.PI / 2
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) }
  })
}

const toColor = (value: string | TFiller | null): string =>
  typeof value === 'string' ? value : 'black'

// ─── React component ─────────────────────────────────────────────────────────

interface FabricComponentProps {
  onSaveCanvas: () => void
  onRemoveNode: () => void
  canvas: Canvas
  activeObjects: FabricObject[]
}

export function FabricToolbar({ canvas, activeObjects, onSaveCanvas: saveCanvasData, onRemoveNode: removeNode }: FabricComponentProps) {
  const t = useEditorT('diagram')

  // ── Initialize fabric canvas (once on mount) ──────────────────────────────

  useEffect(() => {
    const brush = new PencilBrush(canvas)
    brush.color = '#f00'
    brush.width = 2
    // eslint-disable-next-line react-hooks/immutability
    canvas.freeDrawingBrush = brush
  }, [canvas])

  const toggleDrawingMode = () => {
    // eslint-disable-next-line react-hooks/immutability
    canvas.isDrawingMode = !canvas.isDrawingMode
  }

  // ── Shape insertion ───────────────────────────────────────────────────────

  function modifyCanvas(modifier: (canvas: Canvas) => void) {
    modifier(canvas)
    canvas.renderAll()
  }
  const addObject = (obj: FabricObject) => modifyCanvas(canvas => canvas.add(obj))
  const defaultProps = () => {
    const hue = Math.floor(Math.random() * 360)
    return {
      _id: randomId(),
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: 'center',
      originY: 'center',
      strokeWidth: 2,
      fill: `hsl(${hue}, 70%, 80%)`,
      stroke: `hsl(${hue}, 70%, 50%)`,
    } as const
  }

  const addRect = () => addObject(new Rect({
    ...defaultProps(),
    width: 100,
    height: 60,
  }))
  const addEllipse = () => addObject(new Ellipse({
    ...defaultProps(),
    rx: 60,
    ry: 40,
  }))
  const addCircle = () => addObject(new Circle({
    ...defaultProps(),
    radius: 40,
  }))
  const addPolygon = (sides: number) => addObject(new Polygon(regularPolygonPoints(sides, 50), {
    ...defaultProps(),
  }))
  const addText = () => addObject(new Textbox('Text', {
    ...defaultProps(),
    width: 120,
    fontSize: 20,
    strokeWidth: 1,
  }))

  // ── Object color editing ──────────────────────────────────────────────────
  const modifyActiveObjects = (modifier: (obj: FabricObject[], canvas: Canvas) => void) => {
    modifyCanvas(canvas => {
      const active = canvas.getActiveObjects()
      if (active.length > 0) {
        modifier(active, canvas)
        saveCanvasData()
      }
    })
  }
  const modifyActiveObject = (modifier: (obj: FabricObject) => void) =>
    modifyActiveObjects(objs => objs.forEach(modifier))

  const applyFill = (color: string) => modifyActiveObject(obj => {
    obj.set('fill', color)
    console.log(color)
  })
  const applyStroke = (color: string) => modifyActiveObject(obj => obj.set('stroke', color))

  // Object z-indexing (bring forward/send backward)
  const sortedByZIndex = (objects: FabricObject[], canvas: Canvas) => {
    const allObjects = canvas.getObjects()
    return objects.slice().sort((a, b) => allObjects.indexOf(a) - allObjects.indexOf(b))
  }
  const bringForward = () => modifyActiveObjects(
    (objs, canvas) => sortedByZIndex(objs, canvas).reverse().forEach(obj => canvas.bringObjectForward(obj, true)),
  )
  const sendBackward = () => modifyActiveObjects(
    (objs, canvas) => sortedByZIndex(objs, canvas).forEach(obj => canvas.sendObjectBackwards(obj, true)))

  const deleteActiveObjects = () => modifyActiveObjects(
    (objs, canvas) => {
      objs.forEach(obj => canvas.remove(obj))
      canvas.discardActiveObject()
    },
  )

  // ── Render ────────────────────────────────────────────────────────────────

  const shapeButtonClass = 'py-0.5 px-2 text-xs bg-white rounded border-gray-300 hover:bg-gray-50 border cursor-pointer select-none'

  return (
    <div className="flex flex-wrap gap-1 items-center absolute top-full left-0 bg-white p-1 rounded border border-gray-300 z-10 max-w-dvw">
      <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addRect() }} title={t('addRect')}>▭</button>
      <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addEllipse() }} title={t('addEllipse')}>⬭</button>
      <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addCircle() }} title={t('addCircle')}>○</button>
      <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addPolygon(3) }} title={t('addTriangle')}>△</button>
      <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addPolygon(5) }} title={t('addPentagon')}>⬠</button>
      <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addPolygon(6) }} title={t('addHexagon')}>⬡</button>
      <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addText() }} title={t('addText')}>T</button>
      <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); toggleDrawingMode() }} title={t('freeDraw')}>🖌</button>
      {activeObjects.length > 0 && (
        <>
          <span className="w-px self-stretch bg-gray-300 mx-1" />
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); bringForward() }} title={t('bringForward')}>Y</button>
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); sendBackward() }} title={t('sendBackward')}>A</button>
          <label className="flex items-center gap-1 text-xs text-gray-600">
            {t('fill')}
            <input
              type="color"
              value={toColor(activeObjects[0].fill)}
              className="w-6 h-5 cursor-pointer rounded border-0 p-0"
              onChange={(e) => applyFill(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-600">
            {t('stroke')}
            <input
              type="color"
              value={toColor(activeObjects[0].stroke)}
              className="w-6 h-5 cursor-pointer rounded border-0 p-0"
              onChange={(e) => applyStroke(e.target.value)}
            />
          </label>
          <button
            className="py-0.5 px-2 text-xs text-red-600 bg-white rounded border-gray-300 hover:bg-gray-50 border cursor-pointer"
            onMouseDown={deleteActiveObjects}
          >
            {t('deleteShape')}
          </button>
        </>
      )}
      <span className="ml-auto">
        <button
          className="py-0.5 px-2 text-xs text-red-600 bg-white rounded border-gray-300 hover:bg-gray-50 border cursor-pointer"
          onMouseDown={(e) => { e.preventDefault(); removeNode() }}
          onTouchMove={e => e.preventDefault()}
        >
          {t('removeDiagram')}
        </button>
      </span>
    </div>
  )
}

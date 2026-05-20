import { useEffect, useReducer } from 'react'
import { Canvas, Circle, Ellipse, FabricObject, PencilBrush, Polygon, Rect, Textbox, TFiller } from 'fabric'

import { useEditorT } from 'libraries/lexical/i18n'
import { FloatingToolbar, ToolbarButton, ToolbarRow } from 'libraries/lexical/toolbar/widgets'
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
  anchorName: string
  onSaveCanvas: () => void
  onRemoveNode: () => void
  canvas: Canvas
  activeObjects: FabricObject[]
}

export function FabricToolbar({ anchorName, canvas, activeObjects, onSaveCanvas: saveCanvasData, onRemoveNode: removeNode }: FabricComponentProps) {
  const t = useEditorT('diagram')
  const [, forceUpdate] = useReducer(x => x + 1, 0) // for force re-render on tool state changes

  const toggleDrawingMode = () => {
    // eslint-disable-next-line react-hooks/immutability
    canvas.isDrawingMode = !canvas.isDrawingMode
    forceUpdate()
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
  const addPolygon = (sides: number) => addObject(new Polygon(regularPolygonPoints(sides, 50), defaultProps()))

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

  const toggleControls = () => modifyActiveObject(
    obj => {
      if (obj instanceof Polygon) {
        const isEditing = obj.cornerStyle === 'circle'
        if (isEditing) {
          obj.cornerStyle = 'rect'
          obj.hasBorders = true
          obj.controls = controlsUtils.createObjectDefaultControls()
        } else {
          obj.cornerStyle = 'circle'
          obj.hasBorders = false
          obj.controls = createPolygonControls(obj)
        }
        obj.setCoords()
      }
    },
  )

  // ── Initialize fabric canvas (once on mount) ──────────────────────────────

  useEffect(() => {
    const brush = new PencilBrush(canvas)
    brush.color = '#f00'
    brush.width = 2
    // eslint-disable-next-line react-hooks/immutability
    canvas.freeDrawingBrush = brush
    canvas.on('mouse:dblclick', toggleControls)
  }, [canvas])

  // ── Render ────────────────────────────────────────────────────────────────

  return <>
    <FloatingToolbar anchorName={anchorName} side="top">
      <ToolbarRow title={t('diagram')}>
        <ToolbarButton onMouseDown={addRect} tooltip={t('addRect')} icon="▭" />
        <ToolbarButton onMouseDown={addEllipse} tooltip={t('addEllipse')} icon="⬭" />
        <ToolbarButton onMouseDown={addCircle} tooltip={t('addCircle')} icon="○" />
        <ToolbarButton onMouseDown={() => { addPolygon(3) }} tooltip={t('addTriangle')} icon="△" />
        <ToolbarButton onMouseDown={() => { addPolygon(5) }} tooltip={t('addPentagon')} icon="⬠" />
        <ToolbarButton onMouseDown={() => { addPolygon(6) }} tooltip={t('addHexagon')} icon="⬡" />
        <ToolbarButton onMouseDown={addText} tooltip={t('addText')} icon="T" />
        <ToolbarButton onMouseDown={toggleDrawingMode} active={canvas.isDrawingMode} tooltip={t('freeDraw')} icon="🖌" />
        <ToolbarButton color="danger" onMouseDown={removeNode} text={t('removeDiagram')} />
      </ToolbarRow>
    </FloatingToolbar>
    {activeObjects.length > 0 && (
      <FloatingToolbar anchorName={anchorName}>
        <ToolbarRow title={t('chosenObject', { count: activeObjects.length })}>
          <ToolbarButton onMouseDown={toggleControls} tooltip={t('editPolygon')} icon="E" />
          <ToolbarButton onMouseDown={bringForward} tooltip={t('bringForward')} icon="Y" />
          <ToolbarButton onMouseDown={sendBackward} tooltip={t('sendBackward')} icon="A" />
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
          <ToolbarButton
            color="danger"
            onMouseDown={deleteActiveObjects}
            text={t('deleteShape')}
          />
        </ToolbarRow>
      </FloatingToolbar>
    )}
  </>
}

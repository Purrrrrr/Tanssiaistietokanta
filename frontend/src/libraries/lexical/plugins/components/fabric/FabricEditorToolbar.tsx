import { useCallback, useEffect, useReducer, useState } from 'react'
import { Canvas, Circle, controlsUtils, Ellipse, FabricObject, PencilBrush, Polygon, Rect, Textbox, TFiller } from 'fabric'

import { useEditorT } from 'libraries/lexical/i18n'
import { FloatingToolbar, ToolbarButton, ToolbarColorPicker, ToolbarInput, ToolbarRow } from 'libraries/lexical/toolbar/widgets'
import randomId from 'utils/randomId'

import { Arrowline } from './Arrowline'
import { ArrowIcon, BringToTopIcon, CircleIcon, DrawIcon, EditPolygon, EllipseIcon, HexagonIcon, PentagonIcon, RectangleIcon, SendToBottomIcon, TriangleIcon } from './icons'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function regularPolygonPoints(sides: number, radius: number) {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (2 * Math.PI * i / sides) - Math.PI / 2
    return { x: Math.round(radius * Math.cos(angle)), y: Math.round(radius * Math.sin(angle)) }
  })
}

const toColor = (value: string | TFiller | null): string =>
  typeof value === 'string' ? value : 'black'

// ─── React component ─────────────────────────────────────────────────────────

interface FabricComponentProps {
  anchorName: string
  onRemoveNode: () => void
  canvas: Canvas
  activeObjects: FabricObject[]
}

export function FabricToolbar({ anchorName, canvas, activeObjects, onRemoveNode: removeNode }: FabricComponentProps) {
  const t = useEditorT('diagram')
  const [, forceUpdate] = useReducer(x => x + 1, 0) // for force re-render on tool state changes
  const [fill, setFill] = useState('#fff')
  const [stroke, setStroke] = useState('#000')
  const [strokeWidth, setStrokeWidth] = useState(2)

  const stopDrawingMode = useCallback(() => {
    if (canvas.isDrawingMode) {
      // eslint-disable-next-line react-hooks/immutability
      canvas.isDrawingMode = false
      forceUpdate()
    }
  }, [canvas])

  const toggleDrawingMode = () => {
    // eslint-disable-next-line react-hooks/immutability
    canvas.isDrawingMode = !canvas.isDrawingMode
    if (canvas.isDrawingMode) {
      canvas.discardActiveObject() // deselect any active objects when entering drawing modifier
      canvas.requestRenderAll()
      canvas.once('object:added', stopDrawingMode) // turn off drawing mode after one shape is drawn
    } else {
      canvas.off('object:added', stopDrawingMode)
    }
    forceUpdate()
  }

  // ── Shape insertion ───────────────────────────────────────────────────────

  function modifyCanvas(modifier: (canvas: Canvas) => void) {
    modifier(canvas)
    canvas.renderAll()
  }
  const addObject = (obj: FabricObject) => modifyCanvas(canvas => canvas.add(obj))
  const defaultProps = () => ({
    _id: randomId(9),
    left: canvas.width / 2,
    top: canvas.height / 2,
    originX: 'center',
    originY: 'center',
    strokeWidth,
    fill,
    stroke,
    strokeUniform: true,
  } as const)

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
  const addArrow = () => addObject(new Arrowline(
    [{ x: -50, y: 0 }, { x: 50, y: 0 }],
    {
      ...defaultProps(),
    },
  ))

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
        canvas.fire('object:modified', { target: active[0] })
      }
      forceUpdate()
    })
  }
  const modifyActiveObject = (modifier: (obj: FabricObject) => void) =>
    modifyActiveObjects(objs => objs.forEach(modifier))

  const applyFill = (color: string) => modifyActiveObject(obj => obj.set('fill', color))
  const applyStroke = (color: string) => modifyActiveObject(obj => obj.set('stroke', color))
  const applyStrokeWidth = (width: number) => modifyActiveObject(obj => obj.set('strokeWidth', width))

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
          obj.controls = controlsUtils.createPolyControls(obj) // createPolygonControls(obj)
        }
        obj.setCoords()
      }
    },
  )

  // ── Initialize fabric canvas (once on mount) ──────────────────────────────

  useEffect(() => {
    const brush = new PencilBrush(canvas)
    brush.color = stroke
    brush.width = 2
    // eslint-disable-next-line react-hooks/immutability
    canvas.freeDrawingBrush = brush
    canvas.on('mouse:dblclick', toggleControls)
  }, [canvas])
  useEffect(() => {
    const brush = canvas.freeDrawingBrush as PencilBrush
    // eslint-disable-next-line react-hooks/immutability
    brush.color = stroke
  }, [stroke, canvas])

  // ── Render ────────────────────────────────────────────────────────────────

  return <>
    <FloatingToolbar anchorName={anchorName} side="top">
      <ToolbarRow title={t('diagram')}>
        <ToolbarColorPicker label={t('fill')} value={fill} onChange={setFill} />
        <ToolbarColorPicker label={t('stroke')} value={stroke} onChange={setStroke} />
        <ToolbarInput
          label={t('strokeWidth')}
          type="number"
          size={2}
          value={strokeWidth}
          onChange={value => setStrokeWidth(Number(value))}
          min={0}
        />
        <ToolbarButton onMouseDown={addRect} tooltip={t('addRect')} icon={<RectangleIcon />} />
        <ToolbarButton onMouseDown={addEllipse} tooltip={t('addEllipse')} icon={<EllipseIcon />} />
        <ToolbarButton onMouseDown={addCircle} tooltip={t('addCircle')} icon={<CircleIcon />} />
        <ToolbarButton onMouseDown={() => { addPolygon(3) }} tooltip={t('addTriangle')} icon={<TriangleIcon />} />
        <ToolbarButton onMouseDown={() => { addPolygon(5) }} tooltip={t('addPentagon')} icon={<PentagonIcon />} />
        <ToolbarButton onMouseDown={() => { addPolygon(6) }} tooltip={t('addHexagon')} icon={<HexagonIcon />} />
        <ToolbarButton onMouseDown={addArrow} tooltip={t('addArrow')} icon={<ArrowIcon />} />
        <ToolbarButton onMouseDown={addText} tooltip={t('addText')} icon="T" />
        <ToolbarButton onMouseDown={toggleDrawingMode} active={canvas.isDrawingMode} tooltip={t('freeDraw')} icon={<DrawIcon />} />
        <ToolbarButton color="danger" onMouseDown={removeNode} text={t('removeDiagram')} />
      </ToolbarRow>
    </FloatingToolbar>
    {activeObjects.length > 0 && (
      <FloatingToolbar anchorName={anchorName}>
        <ToolbarRow title={t('chosenObject', { count: activeObjects.length })}>
          <ToolbarButton onMouseDown={toggleControls} tooltip={t('editPolygon')} icon={<EditPolygon size={18} className="text-stone-400" />} />
          <ToolbarButton onMouseDown={bringForward} tooltip={t('bringForward')} icon={<BringToTopIcon />} />
          <ToolbarButton onMouseDown={sendBackward} tooltip={t('sendBackward')} icon={<SendToBottomIcon />} />
          <ToolbarColorPicker label={t('fill')} value={toColor(activeObjects[0]?.fill)} onChange={applyFill} />
          <ToolbarColorPicker label={t('stroke')} value={toColor(activeObjects[0]?.stroke)} onChange={applyStroke} />
          <ToolbarInput
            label={t('strokeWidth')}
            type="number"
            size={2}
            value={activeObjects[0]?.strokeWidth || 1}
            onChange={value => applyStrokeWidth(Number(value))}
            min={0}
          />
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

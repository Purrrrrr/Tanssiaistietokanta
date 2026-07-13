import { useCallback, useEffect, useId, useReducer, useRef, useState } from 'react'
import classNames from 'classnames'
import { ActiveSelection, Canvas, Circle, controlsUtils, Ellipse, FabricObject, PencilBrush, Polygon, Rect, Textbox, TFiller } from 'fabric'

import { useEditorT } from 'libraries/lexical/i18n'
import { Button, ColorPickerButton as ToolbarColorPicker, FloatingToolbar, MenuButton, ToolbarButton, ToolbarRow, TooltipContainer } from 'libraries/ui'
import { CssClass } from 'libraries/ui/classes'
import randomId from 'utils/randomId'

import { Arrowline } from './Arrowline'
import { ArrowIcon, BringToTopIcon, CircleIcon, DrawIcon, EditPolygon, EllipseIcon, HexagonIcon, PentagonIcon, RectangleIcon, SendToBottomIcon, StarIcon, StrokeWidthIcon, TriangleIcon } from './icons'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function regularPolygonPoints(sides: number, radius: number) {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (2 * Math.PI * i / sides) - Math.PI / 2
    return { x: Math.round(radius * Math.cos(angle)), y: Math.round(radius * Math.sin(angle)) }
  })
}
function starPolygonPoints(spikes: number, outerRadius: number, innerRadius: number) {
  return Array.from({ length: spikes * 2 }, (_, i) => {
    const angle = (Math.PI * i / spikes) - Math.PI / 2
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    return { x: Math.round(radius * Math.cos(angle)), y: Math.round(radius * Math.sin(angle)) }
  })
}

const toColor = (value: string | TFiller | null): string =>
  typeof value === 'string' ? value : 'black'

// ─── React component ─────────────────────────────────────────────────────────

interface FabricToolbarProps {
  anchorName: string
  onRemoveNode: () => void
  canvas: Canvas
  visible: boolean
  activeObjects: FabricObject[]
}

export function FabricToolbar({ anchorName, canvas, visible, activeObjects, onRemoveNode: removeNode }: FabricToolbarProps) {
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
  const addStar = () => addObject(new Polygon(starPolygonPoints(5, 50, 22), defaultProps()))
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

  if (!visible) return null

  const polygonSelected = activeObjects.length === 1 && activeObjects[0] instanceof Polygon

  return <>
    <FloatingToolbar anchorName={anchorName} side="top span-right" className="mb-1">
      <ToolbarRow title={t('diagram')}>
        <ToolbarColorPicker label={t('fill')} value={fill} onChange={setFill} type="fill" />
        <ToolbarColorPicker label={t('stroke')} value={stroke} onChange={setStroke} type="stroke" />
        <StrokeWidthInput label={t('strokeWidth')} value={strokeWidth} onChange={setStrokeWidth} />
        <ToolbarButton onMouseDown={addRect} tooltip={t('addRect')} icon={<RectangleIcon />} />
        <ToolbarButton onMouseDown={addEllipse} tooltip={t('addEllipse')} icon={<EllipseIcon />} />
        <MenuButton buttonRenderer={props =>
          <ToolbarButton
            {...props}
            tooltip={t('addShape')}
            icon={<StarIcon />}
          />
        }>
          <div className="grid sm:grid-cols-3 grid-cols-3 gap-1 p-1">
            <ToolbarButton onMouseDown={addCircle} tooltip={t('addCircle')} icon={<CircleIcon />} />
            <ToolbarButton onMouseDown={() => { addPolygon(3) }} tooltip={t('addTriangle')} icon={<TriangleIcon />} />
            <ToolbarButton onMouseDown={() => { addPolygon(5) }} tooltip={t('addPentagon')} icon={<PentagonIcon />} />
            <ToolbarButton onMouseDown={() => { addPolygon(6) }} tooltip={t('addHexagon')} icon={<HexagonIcon />} />
            <ToolbarButton onMouseDown={addStar} tooltip={t('addStar')} icon={<StarIcon />} />
          </div>
        </MenuButton>
        <ToolbarButton onMouseDown={addArrow} tooltip={t('addArrow')} icon={<ArrowIcon />} />
        <ToolbarButton onMouseDown={addText} tooltip={t('addText')} icon="T" />
        <ToolbarButton onMouseDown={toggleDrawingMode} active={canvas.isDrawingMode} tooltip={t('freeDraw')} icon={<DrawIcon />} />
        <ToolbarButton color="danger" onMouseDown={removeNode} text={t('removeDiagram')} />
      </ToolbarRow>
    </FloatingToolbar>
    {activeObjects.length > 0 && (
      <FloatingToolbar anchorName={anchorName} className="mt-1" side="bottom span-right">
        <ToolbarRow title={t('chosenObject', { count: activeObjects.length })}>
          {polygonSelected &&
            <ToolbarButton onMouseDown={toggleControls} tooltip={t('editPolygon')} icon={<EditPolygon size={18} className="text-stone-400" />} />
          }
          <ToolbarButton onMouseDown={bringForward} tooltip={t('bringForward')} icon={<BringToTopIcon />} />
          <ToolbarButton onMouseDown={sendBackward} tooltip={t('sendBackward')} icon={<SendToBottomIcon />} />
          <ToolbarColorPicker label={t('fill')} value={toColor(activeObjects[0]?.fill)} onChange={applyFill} type="fill" />
          <ToolbarColorPicker label={t('stroke')} value={toColor(activeObjects[0]?.stroke)} onChange={applyStroke} type="stroke" />
          <StrokeWidthInput label={t('strokeWidth')} value={activeObjects[0]?.strokeWidth || 1} onChange={applyStrokeWidth} />
          <ToolbarButton
            onMouseDown={() => duplidateActiveObjects(canvas)}
            tooltip={t('duplicate')}
            icon="⎘"
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

function StrokeWidthInput({ value, onChange, label }: { value: number, onChange: (value: number) => void, label: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()

  return <TooltipContainer tooltip={label}>
    <div className={CssClass.inputBoxAppearance + ' rounded-full overflow-hidden flex items-center ps-2'}>
      <label htmlFor={id}>
        <StrokeWidthIcon />
      </label>
      <Button minimal onClick={() => { onChange(Math.max(0, value - 1)); inputRef.current?.focus() }}>-</Button>
      <input
        ref={inputRef}
        id={id}
        type="number"
        aria-label={label}
        value={value}
        min={0}
        onChange={e => {
          const num = Number(e.target.value)
          onChange(isNaN(num) ? 0 : num)
        }}
        className={classNames(CssClass.inputAppearance, 'text-center p-1 field-sizing-content align-baseline hide-arrows')}
      />
      <Button minimal onClick={() => { onChange(value + 1); inputRef.current?.focus() }}>
              +
      </Button>
    </div>
  </TooltipContainer>
}

async function duplidateActiveObjects(canvas: Canvas) {
  const activeObject = canvas.getActiveObject()
  if (!activeObject) return

  const clone = await activeObject.clone()
  canvas.discardActiveObject()
  clone.set({
    left: clone.left + 10,
    top: clone.top + 10,
    _id: randomId(9),
  })
  if (clone instanceof ActiveSelection) {
    clone.canvas = canvas
    clone.forEachObject((obj) => {
      canvas.add(obj)
    })
    clone.setCoords()
  } else {
    canvas.add(clone)
  }
  canvas.setActiveObject(clone)
  canvas.requestRenderAll()
}

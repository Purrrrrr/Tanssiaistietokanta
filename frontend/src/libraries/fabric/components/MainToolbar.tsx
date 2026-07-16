import { useCallback, useEffect, useState } from 'react'
import { Canvas, Circle, Ellipse, FabricObject, PencilBrush, Polygon, Rect, Textbox } from 'fabric'

import { FabricDiagramData } from '../types'

import { useUndoHistory } from 'libraries/common/useUndoHistory'
import { ColorPickerButton as ToolbarColorPicker, MenuButton, ToolbarButton, ToolbarRow } from 'libraries/ui'

import { Arrowline } from '../canvas/Arrowline'
import { copySelectionToClipboard, pasteFromClipboard } from '../canvas/clipboard'
import { randomId } from '../canvas/util'
import { useFabricT as useEditorT } from '../i18n'
import { ArrowIcon, CircleIcon, CopyIcon, DrawIcon, EllipseIcon, HexagonIcon, PasteIcon, PentagonIcon, RectangleIcon, Redo, StarIcon, TriangleIcon, Undo } from './icons'
import { StrokeWidthInput } from './StrokeWidthInput'

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

// ─── React component ─────────────────────────────────────────────────────────

interface FabricMainToolbarProps {
  onRemoveNode?: () => void
  canvas: Canvas
  visible: boolean
  undoState?: UndoState
}

export function FabricMainToolbar({ canvas, visible, undoState, onRemoveNode: removeNode }: FabricMainToolbarProps) {
  const t = useEditorT('')
  const [fill, setFill] = useState('#fff')
  const [stroke, setStroke] = useState('#000')
  const [strokeWidth, setStrokeWidth] = useState(2)

  const stopDrawingMode = useCallback(() => {
    if (canvas.isDrawingMode) {
      // eslint-disable-next-line react-hooks/immutability
      canvas.isDrawingMode = false
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
  }

  // ── Shape insertion ───────────────────────────────────────────────────────

  function modifyCanvas(modifier: (canvas: Canvas) => void) {
    modifier(canvas)
    canvas.renderAll()
  }
  const addObject = (obj: FabricObject) => modifyCanvas(canvas => canvas.add(obj))
  const defaultProps = () => ({
    _id: randomId(),
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
  const copySelection = () => { void copySelectionToClipboard(canvas) }
  const pasteSelection = () => { void pasteFromClipboard(canvas) }

  // ── Initialize fabric canvas (once on mount) ──────────────────────────────

  useEffect(() => {
    const brush = new PencilBrush(canvas)
    brush.width = 2

    // eslint-disable-next-line react-hooks/immutability
    canvas.freeDrawingBrush = brush
  }, [canvas])

  useEffect(() => {
    const brush = canvas.freeDrawingBrush as PencilBrush
    // eslint-disable-next-line react-hooks/immutability
    brush.color = stroke
  }, [stroke, canvas])

  // ── Render ────────────────────────────────────────────────────────────────

  if (!visible) return null

  return <ToolbarRow title={t('diagram')}>
    {undoState && <UndoButtons {...undoState} />}
    <ToolbarButton onMouseDown={copySelection} tooltip={t('copyToClipboard')} icon={<CopyIcon />} />
    <ToolbarButton onMouseDown={pasteSelection} tooltip={t('pasteFromClipboard')} icon={<PasteIcon />} />
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
    {removeNode && <ToolbarButton color="danger" onMouseDown={removeNode} text={t('removeDiagram')} />}
  </ToolbarRow>
}

interface UndoState {
  data: FabricDiagramData
  onChange: (data: FabricDiagramData) => void
}

function UndoButtons({ data, onChange }: UndoState) {
  const t = useEditorT('')
  const { undo, redo, canUndo, canRedo } = useUndoHistory(data, onChange)

  return <>
    <ToolbarButton onMouseDown={undo} disabled={!canUndo} tooltip={t('undo')} icon={<Undo />} />
    <ToolbarButton onMouseDown={redo} disabled={!canRedo} tooltip={t('redo')} icon={<Redo />} />
  </>
}

import { useEffect, useReducer } from 'react'
import { ActiveSelection, Canvas, controlsUtils, FabricObject, Polygon, TFiller } from 'fabric'

import { ColorPickerButton as ToolbarColorPicker, ToolbarButton, ToolbarRow } from 'libraries/ui'

import { randomId } from '../canvas/util'
import { useFabricT as useEditorT } from '../i18n'
import { BringToTopIcon, EditPolygon, SendToBottomIcon, Trash } from './icons'
import { StrokeWidthInput } from './StrokeWidthInput'
import { Arrowline } from '../canvas/Arrowline'

const toColor = (value: string | TFiller | null): string =>
  typeof value === 'string' ? value : 'black'

interface SelectedObjectToolbarProps {
  canvas: Canvas
  alwaysVisible?: boolean
  activeObjects: FabricObject[]
}

export function SelectedObjectToolbar({ canvas, activeObjects, alwaysVisible }: SelectedObjectToolbarProps) {
  const t = useEditorT('')
  const [, forceUpdate] = useReducer(x => x + 1, 0) // for force re-render on tool state changes

  // ── Object color editing ──────────────────────────────────────────────────
  const modifyActiveObjects = (modifier: (obj: FabricObject[], canvas: Canvas) => void) => {
    const active = canvas.getActiveObjects()
    if (active.length > 0) {
      modifier(active, canvas)
      canvas.fire('object:modified', { target: active[0] })
    }
    forceUpdate()
    canvas.renderAll()
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
      if (obj instanceof Arrowline) {
        const isEditing = obj.cornerStyle === 'circle'
        if (isEditing) {
          obj.cornerStyle = 'rect'
          obj.hasBorders = true
          obj.controls = controlsUtils.createObjectDefaultControls()
        } else {
          obj.cornerStyle = 'circle'
          obj.hasBorders = false
          obj.controls = controlsUtils.createPolyControls(2)
        }
        obj.setCoords()
      }
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

  useEffect(() => {
    canvas.on('mouse:dblclick', toggleControls)
  }, [canvas])

  // ── Render ────────────────────────────────────────────────────────────────

  const polygonSelected = activeObjects.length === 1 &&
    (activeObjects[0] instanceof Polygon || activeObjects[0] instanceof Arrowline)

  return (activeObjects.length > 0 || alwaysVisible) && (
    <ToolbarRow title={t('chosenObject', { count: activeObjects.length })}>
      {polygonSelected &&
            <ToolbarButton onMouseDown={toggleControls} tooltip={t('editPolygon')} icon={<EditPolygon size={18} className="text-stone-400" />} />
      }
      {activeObjects.length > 0 &&
        <>
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
            tooltip={t('deleteShape')}
            icon={<Trash />}
            color="danger"
            onMouseDown={deleteActiveObjects}
          />
        </>
      }
    </ToolbarRow>
  )
}

async function duplidateActiveObjects(canvas: Canvas) {
  const activeObject = canvas.getActiveObject()
  if (!activeObject) return

  const clone = await activeObject.clone()
  canvas.discardActiveObject()
  clone.set({
    left: clone.left + 10,
    top: clone.top + 10,
    _id: randomId(),
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

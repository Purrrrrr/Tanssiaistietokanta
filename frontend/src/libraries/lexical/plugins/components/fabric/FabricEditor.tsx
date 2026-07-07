import { useImperativeHandle, useState } from 'react'
import { Canvas, Circle, config, Ellipse, FabricObject } from 'fabric'
import type { NodeKey } from 'lexical'

import { useEditorT } from 'libraries/lexical/i18n'
import randomId from 'utils/randomId'

import { FabricCanvas } from './FabricCanvas'
import { FabricToolbar } from './FabricEditorToolbar'

export interface FabricDiagramData {
  data: object
  width: number
  height: number
}

interface FabricComponentProps {
  nodeKey: NodeKey
  width: number
  height: number
  data: string
  editable?: boolean
  isSelected?: boolean
  onRemoveEditor: () => void
  onChange: (data: FabricDiagramData) => void
  ref?: React.Ref<{ deleteSelectedObjects: () => boolean }>
}

export function FabricEditor({ editable, isSelected, nodeKey, width, height, data, onChange, onRemoveEditor, ref }: FabricComponentProps) {
  const t = useEditorT('diagram')
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [activeObjects, setActiveObjects] = useState<FabricObject[]>([])
  const showControls = editable && isSelected

  // ── Serialize canvas to node ──────────────────────────────────────────────
  async function saveCanvas(canvas: Canvas) {
    normalizeObjectScales(canvas)
    const json = canvas.toJSON()
    onChange({ data: json, width: canvas.width, height: canvas.height })
  }

  function onUpdate() {
    if (!canvas) return
    canvas.getObjects().forEach(obj => {
      obj._id ??= randomId(9)
    })
    saveCanvas(canvas)
  }

  useImperativeHandle(ref, () => ({
    /** Delete selected objects on canvas, returns true if any objects were deleted */
    deleteSelectedObjects() {
      if (canvas) {
        const active = canvas.getActiveObjects()
        if (active.length > 0) {
          active.forEach(obj => canvas.remove(obj))
          canvas.discardActiveObject()
          canvas.renderAll()
          return true
        }
      }
      return false
    },
  }))

  // ── Canvas resize handle ──────────────────────────────────────────────────

  function handleResizeStart(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    e.stopPropagation()
    const controller = new AbortController()
    const { signal } = controller

    const { clientX: startX, clientY: startY } = toCoordinates(e)
    const startW = width
    const startH = height

    function toCoordinates(e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) {
      return 'touches' in e
        ? e.touches[0] ?? e.changedTouches[0]
        : e
    }

    function onMove(e: MouseEvent | TouchEvent) {
      const { clientX, clientY } = toCoordinates(e)
      canvas?.setDimensions({
        width: Math.max(200, startW + clientX - startX),
        height: Math.max(100, startH + clientY - startY),
      })
    }

    function onUp() {
      if (!canvas) return
      saveCanvas(canvas)
      controller.abort()
    }

    window.addEventListener('mousemove', onMove, { signal })
    window.addEventListener('touchmove', onMove, { signal })
    window.addEventListener('mouseup', onUp, { signal })
    window.addEventListener('touchend', onUp, { signal })
  }

  return (
    <div className="[anchor-name:--fabric-editor] my-2" data-fabric-node-key={nodeKey}>
      {showControls && canvas && (
        <FabricToolbar anchorName="--fabric-editor" activeObjects={activeObjects} canvas={canvas} onRemoveNode={onRemoveEditor} />
      )}
      <div className={`relative w-max border-2 ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}>
        <FabricCanvas
          width={width}
          height={height}
          data={data}
          editable={editable}
          onCanvasCreated={setCanvas}
          onUpdate={onUpdate}
          onSelect={setActiveObjects}
        />
        {showControls && (
          <button
            className="absolute -bottom-2 -right-2 size-4 border-2 border-blue-500 cursor-se-resize z-10 touch-none"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            title={t('resize')}
          />
        )}
      </div>
    </div>
  )
}

const round = (value: number) => Number(value.toFixed(config.NUM_FRACTION_DIGITS))

function normalizeObjectScales(canvas: Canvas) {
  canvas.getObjects().forEach(obj => {
    if (obj.scaleX === 1 && obj.scaleY === 1) return
    switch (obj.type) {
      case 'rect':
        obj.set({
          width: round(obj.width * obj.scaleX),
          height: round(obj.height * obj.scaleY),
          scaleX: 1,
          scaleY: 1,
        })
        break
      case 'circle': {
        const minScale = Math.min(obj.scaleX, obj.scaleY)
        obj.set({
          radius: round((obj as Circle).radius * minScale),
          scaleX: round(obj.scaleX / minScale),
          scaleY: round(obj.scaleY / minScale),
        })
        break
      }
      case 'ellipse':
        obj.set({
          rx: round((obj as Ellipse).rx * obj.scaleX),
          ry: round((obj as Ellipse).ry * obj.scaleY),
          scaleX: 1,
          scaleY: 1,
        })
        break
      default:
        return
    }
  })
}

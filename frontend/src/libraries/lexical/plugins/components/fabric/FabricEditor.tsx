import { useImperativeHandle, useState } from 'react'
import { Canvas, config, FabricObject } from 'fabric'
import type { NodeKey } from 'lexical'

import { useEditorT } from 'libraries/lexical/i18n'
import randomId from 'utils/randomId'

import { FabricCanvas } from './FabricCanvas'
import { FabricToolbar } from './FabricEditorToolbar'

declare module 'fabric' {
  // to have the properties recognized on the instance and in the constructor
  interface FabricObject {
    _id?: string
  }
  // to have the properties typed in the exported object
  interface SerializedObjectProps {
    _id?: string
  }
}
FabricObject.customProperties = ['_id']
config.NUM_FRACTION_DIGITS = 2

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

import { useState } from 'react'
import { Canvas, FabricObject } from 'fabric'

import randomId from 'utils/randomId'

import { normalizeObjectScales } from './canvas/util'
import { CanvasResizeButton } from './components/CanvasResizeButton'
import { FabricCanvas } from './FabricCanvas'
import { FabricToolbar } from './FabricEditorToolbar'

export interface FabricDiagramData {
  data: object
  width: number
  height: number
}

interface FabricComponentProps extends FabricDiagramData {
  nodeKey?: string
  editable?: boolean
  isSelected?: boolean
  onRemoveEditor?: () => void
  onChange: (data: FabricDiagramData) => void
}

export function FabricEditor({ editable, isSelected, nodeKey, width, height, data, onChange, onRemoveEditor }: FabricComponentProps) {
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [activeObjects, setActiveObjects] = useState<FabricObject[]>([])

  // ── Serialize canvas data ──
  async function saveCanvas() {
    if (!canvas) return
    canvas.getObjects().forEach(obj => {
      obj._id ??= randomId(9)
    })
    normalizeObjectScales(canvas)
    const json = canvas.toJSON()
    onChange({ data: json, width: canvas.width, height: canvas.height })
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="[anchor-name:--fabric-editor] [anchor-scope:all] my-2"
      data-fabric-node-key={nodeKey}
      role="application"
      onKeyDown={e => {
        if (!canvas || !editable) return
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const active = canvas.getActiveObjects()
          if (active.length > 0) {
            active.forEach(obj => canvas.remove(obj))
            canvas.discardActiveObject()
            canvas.renderAll()
            e.preventDefault()
            e.stopPropagation()
          }
        }
      }}
      tabIndex={-1}>
      {canvas && editable && (
        <FabricToolbar visible={!!isSelected} anchorName="--fabric-editor" activeObjects={activeObjects} canvas={canvas} onRemoveNode={onRemoveEditor} />
      )}
      <div className={`relative w-max border-2 ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}>
        <FabricCanvas
          width={width}
          height={height}
          data={data}
          editable={editable}
          onCanvasCreated={setCanvas}
          onUpdate={saveCanvas}
          onSelect={setActiveObjects}
        />
        {editable && isSelected && canvas && <CanvasResizeButton canvas={canvas} onResized={saveCanvas} />}
      </div>
    </div>
  )
}

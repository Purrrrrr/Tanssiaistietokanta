import { useMemo, useState } from 'react'
import classNames from 'classnames'
import { Canvas, FabricObject } from 'fabric'

import { AnyNode } from 'libraries/common/minificationUtils'
import { FloatingToolbar } from 'libraries/ui'
import randomId from 'utils/randomId'

import { onCanvasKeydown } from './canvas/keydownHandler'
import { normalizeObjectScales } from './canvas/util'
import { CanvasResizeButton } from './components/CanvasResizeButton'
import { FabricMainToolbar } from './components/MainToolbar'
import { SelectedObjectToolbar } from './components/SelectedObjectToolbar'
import { FabricCanvas } from './FabricCanvas'
import { expandFabricObject, minifyFabricObject } from './minify'

export type MinfiedFabricData = AnyNode // Opaque minified data type

export interface FabricDiagramData {
  data: MinfiedFabricData
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
  const expandedData = useMemo(() => expandFabricObject(data), [data])

  async function saveCanvas() {
    if (!canvas) return
    canvas.getObjects().forEach(obj => {
      obj._id ??= randomId(9)
    })
    normalizeObjectScales(canvas)
    const json = minifyFabricObject(canvas.toJSON())
    onChange({ data: json, width: canvas.width, height: canvas.height })
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="[anchor-name:--fabric-editor] [anchor-scope:all] my-2"
      data-fabric-node-key={nodeKey}
      role="application"
      onKeyDown={e => {
        if (canvas && editable) onCanvasKeydown(e, canvas)
      }}
      tabIndex={-1}>
      {canvas && editable && (
        <FabricToolbar visible={!!isSelected} anchorName="--fabric-editor" activeObjects={activeObjects} canvas={canvas} onRemoveNode={onRemoveEditor} />
      )}
      <div className={`relative w-max border-2 ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}>
        <FabricCanvas
          width={width}
          height={height}
          data={expandedData}
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

interface FabricToolbarProps {
  anchorName: string
  onRemoveNode?: () => void
  canvas: Canvas
  visible: boolean
  activeObjects: FabricObject[]
}

export function FabricToolbar({ anchorName, canvas, visible, activeObjects, onRemoveNode }: FabricToolbarProps) {
  return <>
    <FloatingToolbar className={classNames('mb-1', visible || 'hidden')} anchorName={anchorName} side="top span-right">
      <FabricMainToolbar canvas={canvas} visible={visible} onRemoveNode={onRemoveNode} />
    </FloatingToolbar>
    {activeObjects.length > 0 && (
      <FloatingToolbar anchorName={anchorName} className="mt-1" side="bottom span-right">
        <SelectedObjectToolbar activeObjects={activeObjects} canvas={canvas} />
      </FloatingToolbar>
    )}
  </>
}

import { useMemo, useState } from 'react'
import { Canvas, FabricObject } from 'fabric'

import { FabricDiagramData } from './types'

import { CssClass } from 'libraries/ui/classes'

import { saveCanvasToJson } from './canvas/util'
import { CanvasResizeButton } from './components/CanvasResizeButton'
import { FabricMainToolbar } from './components/MainToolbar'
import { SelectedObjectToolbar } from './components/SelectedObjectToolbar'
import { FabricCanvas } from './FabricCanvas'
import { expandFabricObject } from './minify'

export type { FabricDiagramData, MinifiedFabricData } from './types'

interface FabricComponentProps extends FabricDiagramData {
  editable?: boolean
  onChange: (data: FabricDiagramData) => void
  backgroundImage?: string | null
  fixedSize?: boolean
}

export function FabricEditor({ editable, width, height, data, backgroundImage, fixedSize, hash, onChange }: FabricComponentProps) {
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [activeObjects, setActiveObjects] = useState<FabricObject[]>([])
  const expandedData = useMemo(() => expandFabricObject(data), [data])

  async function saveCanvas() {
    if (!canvas) return
    onChange(await saveCanvasToJson(canvas))
  }

  return (
    <div className={`${CssClass.inputBoxAppearance} [anchor-scope:all] flex flex-col my-2 bg-stone-100`}>
      {canvas && editable &&
        <FabricMainToolbar
          canvas={canvas}
          undoState={{ data: { width, height, data, hash }, onChange }}
          visible />
      }
      <div className="bg-stone-300 p-2 mx-px">
        <div className="relative w-max border-2 border-blue-500">
          <FabricCanvas
            backgroundImage={backgroundImage}
            width={width}
            height={height}
            data={expandedData}
            editable={editable}
            onCanvasCreated={setCanvas}
            onUpdate={saveCanvas}
            onSelect={setActiveObjects}
          />
          {editable && canvas && !fixedSize && <CanvasResizeButton canvas={canvas} onResized={saveCanvas} />}
        </div>
      </div>
      {canvas && editable && <SelectedObjectToolbar activeObjects={activeObjects} canvas={canvas} alwaysVisible />}
    </div>
  )
}

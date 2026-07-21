import { useMemo, useState } from 'react'
import { Canvas, FabricObject } from 'fabric'

import { FabricDiagramData } from './types'
import { FieldComponentDisplayProps } from 'libraries/forms/types'

import { CssClass } from 'libraries/ui/classes'

import { saveCanvasToJson } from './canvas/util'
import { CanvasResizeButton } from './components/CanvasResizeButton'
import { FabricMainToolbar } from './components/MainToolbar'
import { SelectedObjectToolbar } from './components/SelectedObjectToolbar'
import { FabricCanvas } from './FabricCanvas'
import { expandFabricObject } from './minify'
import { useFabricImageUrl } from './useFabricImageUrl'

export type { FabricDiagramData, MinifiedFabricData } from './types'

interface FabricComponentProps extends Omit<FieldComponentDisplayProps, 'id'> {
  id?: string
  value: FabricDiagramData | undefined | null
  onChange: (data: FabricDiagramData) => void
  baseDiagram?: FabricDiagramData
}

export const defaultDiagram: FabricDiagramData = {
  width: 300,
  height: 300,
  data: {},
  hash: '',
}

const emptyData = {}

export function FabricEditor({ readOnly, value, baseDiagram, onChange, inline, ...rest }: FabricComponentProps) {
  const data = value?.data ?? emptyData
  const width = baseDiagram?.width ?? value?.width ?? 300
  const height = baseDiagram?.height ?? value?.height ?? 300
  const hash = value?.hash ?? ''
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [activeObjects, setActiveObjects] = useState<FabricObject[]>([])
  const expandedData = useMemo(() => expandFabricObject(data), [data])
  const backgroundImage = useFabricImageUrl(baseDiagram)
  const editable = !readOnly

  async function saveCanvas() {
    if (!canvas) return
    onChange(await saveCanvasToJson(canvas))
  }

  return (
    <div className={`${CssClass.inputBoxAppearance} ${inline ? 'inline-block' : ''} [anchor-scope:all] flex flex-col my-2 bg-stone-100`}>
      {canvas && editable &&
        <FabricMainToolbar
          canvas={canvas}
          undoState={{ data: { width, height, data, hash }, onChange }}
          visible />
      }
      <div className="bg-stone-300 p-2 mx-px">
        <div className="bg-white relative w-max border-2 border-blue-500">
          <FabricCanvas
            {...rest}
            backgroundImage={backgroundImage}
            width={width}
            height={height}
            data={expandedData}
            editable={!readOnly}
            onCanvasCreated={setCanvas}
            onUpdate={saveCanvas}
            onSelect={setActiveObjects}
          />
          {editable && canvas && !baseDiagram && <CanvasResizeButton canvas={canvas} onResized={saveCanvas} />}
        </div>
      </div>
      {canvas && editable && <SelectedObjectToolbar activeObjects={activeObjects} canvas={canvas} alwaysVisible />}
    </div>
  )
}

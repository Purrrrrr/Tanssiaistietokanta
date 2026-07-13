import classNames from 'classnames'
import { Canvas, FabricObject } from 'fabric'

import { FloatingToolbar } from 'libraries/ui'

import { FabricMainToolbar } from './components/MainToolbar'
import { SelectedObjectToolbar } from './components/SelectedObjectToolbar'

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

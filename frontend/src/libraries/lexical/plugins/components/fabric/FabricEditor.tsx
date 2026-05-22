import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useCallback, useEffect, useRef, useState } from 'react'
import { mergeRegister } from '@lexical/utils'
import { Canvas, FabricObject } from 'fabric'
import type { NodeKey } from 'lexical'
import {
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical'

import { useEditorT } from 'libraries/lexical/i18n'

import { FabricCanvas } from './FabricCanvas'
import { FabricToolbar } from './FabricToolbar'

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

interface FabricComponentProps {
  nodeKey: NodeKey
  width: number
  height: number
  data: string
  onChangeData: (data: string) => void
  onChangeDimensions: (width: number, height: number) => void
}

export function FabricEditor({ nodeKey, width, height, data, onChangeData, onChangeDimensions }: FabricComponentProps) {
  const t = useEditorT('diagram')
  const [editor] = useLexicalComposerContext()
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const canvasRef = useRef<Canvas | null>(null)
  const [activeObjects, setActiveObjects] = useState<FabricObject[]>([])
  const isEditable = editor.isEditable()

  // ── Serialize canvas to node ──────────────────────────────────────────────

  function saveCanvasData() {
    const canvas = canvasRef.current
    if (!canvas) return
    const json = canvas.toJSON()
    onChangeData(json)
  }

  function onCanvasCreated(canvas: Canvas) {
    canvasRef.current = canvas
    canvas.on('mouse:down', () => {
      clearSelection()
      setSelected(true)
    })
  }

  // ── Lexical node delete handling selection ───────────────────────────────────────────────

  const onDelete = useCallback((event: KeyboardEvent) => {
    if (!isSelected) return false
    const canvas = canvasRef.current
    event.preventDefault()
    if (canvas) {
      const active = canvas.getActiveObjects()
      if (active.length > 0) {
        active.forEach(obj => canvas.remove(obj))
        canvas.discardActiveObject()
        canvas.renderAll()
        return true
      }
    }
    editor.update(() => { $getNodeByKey(nodeKey)?.remove() })
    return true
  }, [editor, isSelected, nodeKey])

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (event) => {
          const target = event.target as HTMLElement
          if (target.closest(`[data-fabric-node-key="${nodeKey}"]`)) {
            // clearSelection()
            // setSelected(true)
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
    )
  }, [editor, nodeKey, clearSelection, setSelected, onDelete])

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
      canvasRef.current?.setDimensions({
        width: Math.max(200, startW + clientX - startX),
        height: Math.max(100, startH + clientY - startY),
      })
    }

    function onUp() {
      if (!canvasRef.current) return
      onChangeDimensions(canvasRef.current.width, canvasRef.current.height)
      controller.abort()
    }

    window.addEventListener('mousemove', onMove, { signal })
    window.addEventListener('touchmove', onMove, { signal })
    window.addEventListener('mouseup', onUp, { signal })
    window.addEventListener('touchend', onUp, { signal })
  }

  // ── Remove node ───────────────────────────────────────────────────────────

  function removeNode() {
    editor.update(() => { $getNodeByKey(nodeKey)?.remove() })
  }

  return (
    <div className="[anchor-name:--fabric-editor] my-2" data-fabric-node-key={nodeKey}>
      {isSelected && isEditable && canvasRef.current && (
        <FabricToolbar anchorName="--fabric-editor" activeObjects={activeObjects} canvas={canvasRef.current} onRemoveNode={removeNode} />
      )}
      <div className={`relative w-max border-2 ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}>
        <FabricCanvas
          width={width}
          height={height}
          data={data}
          editable={isEditable}
          onCanvasCreated={onCanvasCreated}
          onUpdate={saveCanvasData}
          onSelect={setActiveObjects}
        />
        {isSelected && isEditable && (
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

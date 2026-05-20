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
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const isLoadingRef = useRef(false)
  const lastDataRef = useRef(data)
  const [activeObjects, setActiveObjects] = useState<FabricObject[]>([])
  const isEditable = editor.isEditable()

  // ── Serialize canvas to node ──────────────────────────────────────────────

  function saveCanvasData() {
    const canvas = fabricRef.current
    if (!canvas || isLoadingRef.current) return
    const json = canvas.toJSON()
    if (json === lastDataRef.current) return
    lastDataRef.current = json
    onChangeData(json)
  }

  // ── Initialize fabric canvas (once on mount) ──────────────────────────────

  useEffect(() => {
    const el = canvasElRef.current
    if (!el) return
    let cancelled = false

    const canvas = new Canvas(el, {
      width,
      height,
      backgroundColor: '#ffffff',
      selection: isEditable,
    })
    fabricRef.current = canvas
    lastDataRef.current = data

    if (data) {
      isLoadingRef.current = true
      canvas.loadFromJSON(data).then(() => {
        if (cancelled) return
        isLoadingRef.current = false
        if (!isEditable) {
          canvas.getObjects().forEach(obj => {
            obj.selectable = false
            obj.evented = false
          })
        }
        canvas.renderAll()
      })
    }

    const handleModified = () => saveCanvasData()
    canvas.on('mouse:down', () => {
      clearSelection()
      setSelected(true)
    })
    canvas.on('object:added', handleModified)
    canvas.on('object:modified', handleModified)
    canvas.on('object:removed', handleModified)

    canvas.on('selection:created', (e) => setActiveObjects(e.selected ?? []))
    canvas.on('selection:updated', (e) => setActiveObjects(e.selected ?? []))
    canvas.on('selection:cleared', () => setActiveObjects([]))

    return () => {
      cancelled = true
      canvas.dispose()
      fabricRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync data from external changes (undo/redo) ───────────────────────────

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || data === lastDataRef.current) return
    lastDataRef.current = data
    isLoadingRef.current = true
    const load = data
      ? canvas.loadFromJSON(data)
      : Promise.resolve(canvas.clear())
    load.then(() => {
      isLoadingRef.current = false
      if (!isEditable) {
        canvas.getObjects().forEach(obj => {
          obj.selectable = false
          obj.evented = false
        })
      }
      canvas.renderAll()
    })
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync dimensions from external changes ────────────────────────────────

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    if (canvas.width !== width || canvas.height !== height) {
      canvas.setDimensions({ width, height })
    }
  }, [width, height])

  // ── Sync editable state ───────────────────────────────────────────────────

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.selection = isEditable
    canvas.getObjects().forEach(obj => {
      obj.selectable = isEditable
      obj.evented = isEditable
    })
    canvas.renderAll()
  }, [isEditable])

  // ── Lexical node delete handling selection ───────────────────────────────────────────────

  const onDelete = useCallback((event: KeyboardEvent) => {
    if (!isSelected) return false
    const canvas = fabricRef.current
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
      fabricRef.current?.setDimensions({
        width: Math.max(200, startW + clientX - startX),
        height: Math.max(100, startH + clientY - startY),
      })
    }

    function onUp() {
      if (!fabricRef.current) return
      onChangeDimensions(fabricRef.current.width, fabricRef.current.height)
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
      {isSelected && isEditable && fabricRef.current && (
        <FabricToolbar activeObjects={activeObjects} canvas={fabricRef.current} onRemoveNode={removeNode} onSaveCanvas={saveCanvasData} />
      )}
      <div className={`relative w-max border-2 ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}>
        <canvas ref={canvasElRef} />
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

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useCallback, useEffect, useRef, useState } from 'react'
import { mergeRegister } from '@lexical/utils'
import { Canvas, Circle, Ellipse, FabricObject, Polygon, Rect, Textbox } from 'fabric'
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import {
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical'

import { useEditorT } from 'libraries/lexical/i18n'

export type SerializedFabricNode = Spread<
  { width: number, height: number, data: string },
  SerializedLexicalNode
>

function $convertFabricElement(domNode: HTMLElement): DOMConversionOutput | null {
  const width = parseInt(domNode.getAttribute('data-fabric-width') ?? '600', 10)
  const height = parseInt(domNode.getAttribute('data-fabric-height') ?? '400', 10)
  const data = domNode.getAttribute('data-fabric-data') ?? ''
  return { node: $createFabricNode(width, height, data) }
}

export class FabricNode extends DecoratorNode<React.ReactNode> {
  __width: number
  __height: number
  __data: string

  constructor(width: number, height: number, data: string, key?: NodeKey) {
    super(key)
    this.__width = width
    this.__height = height
    this.__data = data
  }

  static getType(): string {
    return 'fabric-diagram'
  }

  static clone(node: FabricNode): FabricNode {
    return new FabricNode(node.__width, node.__height, node.__data, node.__key)
  }

  static importJSON(json: SerializedFabricNode): FabricNode {
    return $createFabricNode(json.width, json.height, json.data)
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-fabric-diagram')) return null
        return { conversion: $convertFabricElement, priority: 2 }
      },
    }
  }

  exportJSON(): SerializedFabricNode {
    return {
      ...super.exportJSON(),
      width: this.__width,
      height: this.__height,
      data: this.__data,
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-fabric-diagram', 'true')
    element.setAttribute('data-fabric-width', String(this.__width))
    element.setAttribute('data-fabric-height', String(this.__height))
    element.setAttribute('data-fabric-data', this.__data)
    return { element }
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div')
    div.style.display = 'block'
    return div
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return false
  }

  getWidth(): number { return this.getLatest().__width }
  getHeight(): number { return this.getLatest().__height }
  getData(): string { return this.getLatest().__data }

  setDimensions(width: number, height: number): this {
    const self = this.getWritable()
    self.__width = width
    self.__height = height
    return self
  }

  setData(data: string): this {
    const self = this.getWritable()
    self.__data = data
    return self
  }

  decorate(): React.ReactNode {
    return (
      <FabricComponent
        nodeKey={this.__key}
        width={this.__width}
        height={this.__height}
        data={this.__data}
      />
    )
  }
}

// ─── Shape helpers ───────────────────────────────────────────────────────────

function regularPolygonPoints(sides: number, radius: number) {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (2 * Math.PI * i / sides) - Math.PI / 2
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) }
  })
}

// ─── React component ─────────────────────────────────────────────────────────

interface FabricComponentProps {
  nodeKey: NodeKey
  width: number
  height: number
  data: string
}

function FabricComponent({ nodeKey, width, height, data }: FabricComponentProps) {
  const t = useEditorT('diagram')
  const [editor] = useLexicalComposerContext()
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const isLoadingRef = useRef(false)
  const lastDataRef = useRef(data)
  const [activeObject, setActiveObject] = useState<FabricObject | null>(null)
  const [fillColor, setFillColor] = useState('#93c5fd')
  const [strokeColor, setStrokeColor] = useState('#1d4ed8')
  const [localWidth, setLocalWidth] = useState(width)
  const [localHeight, setLocalHeight] = useState(height)

  const isEditable = editor.isEditable()

  // ── Serialize canvas to node ──────────────────────────────────────────────

  function saveCanvasData() {
    const canvas = fabricRef.current
    if (!canvas || isLoadingRef.current) return
    const json = canvas.toJSON()
    if (json === lastDataRef.current) return
    lastDataRef.current = json
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isFabricNode(node)) node.setData(json)
    })
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
    canvas.on('object:added', handleModified)
    canvas.on('object:modified', handleModified)
    canvas.on('object:removed', handleModified)

    canvas.on('selection:created', (e) => setActiveObject(e.selected?.[0] ?? null))
    canvas.on('selection:updated', (e) => setActiveObject(e.selected?.[0] ?? null))
    canvas.on('selection:cleared', () => setActiveObject(null))

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
      setLocalWidth(width)
      setLocalHeight(height)
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

  // ── Sync active object color state ───────────────────────────────────────

  useEffect(() => {
    if (!activeObject) return
    const fill = activeObject.fill
    const stroke = activeObject.stroke
    if (typeof fill === 'string') setFillColor(fill)
    if (typeof stroke === 'string') setStrokeColor(stroke)
  }, [activeObject])

  // ── Lexical click selection ───────────────────────────────────────────────

  const onDelete = useCallback((event: KeyboardEvent) => {
    if (!isSelected) return false
    const canvas = fabricRef.current
    if (canvas) {
      const active = canvas.getActiveObject()
      if (active) {
        canvas.remove(active)
        canvas.discardActiveObject()
        canvas.renderAll()
        event.preventDefault()
        return true
      }
    }
    event.preventDefault()
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
            clearSelection()
            setSelected(true)
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

  // ── Shape insertion ───────────────────────────────────────────────────────

  function addRect() {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.add(new Rect({
      left: localWidth / 2 - 50,
      top: localHeight / 2 - 30,
      width: 100,
      height: 60,
      fill: '#93c5fd',
      stroke: '#1d4ed8',
      strokeWidth: 2,
    }))
    canvas.renderAll()
  }

  function addEllipse() {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.add(new Ellipse({
      left: localWidth / 2,
      top: localHeight / 2,
      originX: 'center',
      originY: 'center',
      rx: 60,
      ry: 40,
      fill: '#86efac',
      stroke: '#15803d',
      strokeWidth: 2,
    }))
    canvas.renderAll()
  }

  function addCircle() {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.add(new Circle({
      left: localWidth / 2,
      top: localHeight / 2,
      originX: 'center',
      originY: 'center',
      radius: 40,
      fill: '#fde68a',
      stroke: '#d97706',
      strokeWidth: 2,
    }))
    canvas.renderAll()
  }

  function addPolygon(sides: number) {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.add(new Polygon(regularPolygonPoints(sides, 50), {
      left: localWidth / 2,
      top: localHeight / 2,
      originX: 'center',
      originY: 'center',
      fill: '#c4b5fd',
      stroke: '#6d28d9',
      strokeWidth: 2,
    }))
    canvas.renderAll()
  }

  function addText() {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.add(new Textbox('Text', {
      left: localWidth / 2,
      top: localHeight / 2,
      originX: 'center',
      originY: 'center',
      width: 120,
      fontSize: 20,
      fill: '#fca5a5',
      stroke: '#b91c1c',
      strokeWidth: 1,
    }))
    canvas.renderAll()
  }

  // ── Object color editing ──────────────────────────────────────────────────

  function applyFill(color: string) {
    const canvas = fabricRef.current
    if (!canvas || !activeObject) return
    setFillColor(color)
    activeObject.set('fill', color)
    canvas.renderAll()
    saveCanvasData()
  }

  function applyStroke(color: string) {
    const canvas = fabricRef.current
    if (!canvas || !activeObject) return
    setStrokeColor(color)
    activeObject.set('stroke', color)
    canvas.renderAll()
    saveCanvasData()
  }

  // Object z-indexing (bring forward/send backward)

  function bringForward() {
    const canvas = fabricRef.current
    if (!canvas || !activeObject) return
    canvas.bringObjectForward(activeObject, true)
    canvas.renderAll()
    saveCanvasData()
  }

  function sendBackward() {
    const canvas = fabricRef.current
    if (!canvas || !activeObject) return
    canvas.sendObjectBackwards(activeObject, true)
    canvas.renderAll()
    saveCanvasData()
  }

  // ── Canvas resize handle ──────────────────────────────────────────────────

  function handleResizeStart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const startW = localWidth
    const startH = localHeight

    function onMove(me: MouseEvent) {
      const newW = Math.max(200, startW + me.clientX - startX)
      const newH = Math.max(100, startH + me.clientY - startY)
      fabricRef.current?.setDimensions({ width: newW, height: newH })
      setLocalWidth(newW)
      setLocalHeight(newH)
    }

    function onUp(me: MouseEvent) {
      const newW = Math.max(200, startW + me.clientX - startX)
      const newH = Math.max(100, startH + me.clientY - startY)
      fabricRef.current?.setDimensions({ width: newW, height: newH })
      setLocalWidth(newW)
      setLocalHeight(newH)
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isFabricNode(node)) node.setDimensions(newW, newH)
      })
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── Remove node ───────────────────────────────────────────────────────────

  function removeNode() {
    editor.update(() => { $getNodeByKey(nodeKey)?.remove() })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const shapeButtonClass = 'py-0.5 px-2 text-xs bg-white rounded border-gray-300 hover:bg-gray-50 border cursor-pointer select-none'

  return (
    <div className="my-2 relative" data-fabric-node-key={nodeKey}>
      {isSelected && isEditable && (
        <div className="flex flex-wrap gap-1 items-center absolute top-0 left-0 -translate-y-full bg-white p-1 rounded border border-gray-300 z-10 max-w-dvw">
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addRect() }} title={t('addRect')}>▭</button>
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addEllipse() }} title={t('addEllipse')}>⬭</button>
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addCircle() }} title={t('addCircle')}>○</button>
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addPolygon(3) }} title={t('addTriangle')}>△</button>
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addPolygon(5) }} title={t('addPentagon')}>⬠</button>
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addPolygon(6) }} title={t('addHexagon')}>⬡</button>
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addText() }} title={t('addText')}>T</button>
          {activeObject && (
            <>
              <span className="w-px self-stretch bg-gray-300 mx-1" />
              <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); bringForward() }} title={t('bringForward')}>Y</button>
              <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); sendBackward() }} title={t('sendBackward')}>A</button>
              <label className="flex items-center gap-1 text-xs text-gray-600">
                {t('fill')}
                <input
                  type="color"
                  value={fillColor}
                  className="w-6 h-5 cursor-pointer rounded border-0 p-0"
                  onChange={(e) => applyFill(e.target.value)}
                />
              </label>
              <label className="flex items-center gap-1 text-xs text-gray-600">
                {t('stroke')}
                <input
                  type="color"
                  value={strokeColor}
                  className="w-6 h-5 cursor-pointer rounded border-0 p-0"
                  onChange={(e) => applyStroke(e.target.value)}
                />
              </label>
              <button
                className="py-0.5 px-2 text-xs text-red-600 bg-white rounded border-gray-300 hover:bg-gray-50 border cursor-pointer"
                onMouseDown={(e) => {
                  e.preventDefault()
                  const canvas = fabricRef.current
                  if (canvas && activeObject) {
                    canvas.remove(activeObject)
                    canvas.discardActiveObject()
                    canvas.renderAll()
                  }
                }}
              >
                {t('deleteShape')}
              </button>
            </>
          )}
          <span className="ml-auto">
            <button
              className="py-0.5 px-2 text-xs text-red-600 bg-white rounded border-gray-300 hover:bg-gray-50 border cursor-pointer"
              onMouseDown={(e) => { e.preventDefault(); removeNode() }}
            >
              {t('removeDiagram')}
            </button>
          </span>
        </div>
      )}
      <div
        className={`relative inline-block border-2 ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}
        style={{ width: localWidth + 4, height: localHeight + 4 }}
      >
        <canvas ref={canvasElRef} />
        {isSelected && isEditable && (
          <button
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize z-10 rounded-tl"
            onMouseDown={handleResizeStart}
            title={t('resize')}
          />
        )}
      </div>
    </div>
  )
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function $createFabricNode(width = 600, height = 400, data = ''): FabricNode {
  return new FabricNode(width, height, data)
}

export function $isFabricNode(node: LexicalNode | null | undefined): node is FabricNode {
  return node instanceof FabricNode
}

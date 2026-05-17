import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useCallback, useEffect, useRef, useState } from 'react'
import { mergeRegister } from '@lexical/utils'
import { Canvas, Circle, Ellipse, FabricObject, Polygon, Rect, Textbox, TFiller } from 'fabric'
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
import randomId from 'utils/randomId'

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function regularPolygonPoints(sides: number, radius: number) {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (2 * Math.PI * i / sides) - Math.PI / 2
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) }
  })
}

const toColor = (value: string | TFiller | null): string =>
  typeof value === 'string' ? value : 'black'

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
  const [activeObjects, setActiveObjects] = useState<FabricObject[]>([])
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

  // ── Lexical click selection ───────────────────────────────────────────────

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

  function modifyCanvas(modifier: (canvas: Canvas) => void) {
    const canvas = fabricRef.current
    if (!canvas) return
    modifier(canvas)
    canvas.renderAll()
  }
  const addObject = (obj: FabricObject) => modifyCanvas(canvas => canvas.add(obj))
  const defaultProps = () => {
    const hue = Math.floor(Math.random() * 360)
    return {
      _id: randomId(),
      left: width / 2,
      top: height / 2,
      originX: 'center',
      originY: 'center',
      strokeWidth: 2,
      fill: `hsl(${hue}, 70%, 80%)`,
      stroke: `hsl(${hue}, 70%, 50%)`,
    } as const
  }

  const addRect = () => addObject(new Rect({
    ...defaultProps(),
    width: 100,
    height: 60,
  }))
  const addEllipse = () => addObject(new Ellipse({
    ...defaultProps(),
    rx: 60,
    ry: 40,
  }))
  const addCircle = () => addObject(new Circle({
    ...defaultProps(),
    radius: 40,
  }))
  const addPolygon = (sides: number) => addObject(new Polygon(regularPolygonPoints(sides, 50), {
    ...defaultProps(),
  }))
  const addText = () => addObject(new Textbox('Text', {
    ...defaultProps(),
    width: 120,
    fontSize: 20,
    strokeWidth: 1,
  }))

  // ── Object color editing ──────────────────────────────────────────────────
  const modifyActiveObjects = (modifier: (obj: FabricObject[], canvas: Canvas) => void) => {
    modifyCanvas(canvas => {
      const active = canvas.getActiveObjects()
      if (active.length > 0) {
        modifier(active, canvas)
        saveCanvasData()
      }
    })
  }
  const modifyActiveObject = (modifier: (obj: FabricObject) => void) =>
    modifyActiveObjects(objs => objs.forEach(modifier))

  const applyFill = (color: string) => modifyActiveObject(obj => obj.set('fill', color))
  const applyStroke = (color: string) => modifyActiveObject(obj => obj.set('stroke', color))

  // Object z-indexing (bring forward/send backward)
  const sortedByZIndex = (objects: FabricObject[], canvas: Canvas) => {
    const allObjects = canvas.getObjects()
    return objects.slice().sort((a, b) => allObjects.indexOf(a) - allObjects.indexOf(b))
  }
  const bringForward = () => modifyActiveObjects(
    (objs, canvas) => sortedByZIndex(objs, canvas).reverse().forEach(obj => canvas.bringObjectForward(obj, true)),
  )
  const sendBackward = () => modifyActiveObjects(
    (objs, canvas) => sortedByZIndex(objs, canvas).forEach(obj => canvas.sendObjectBackwards(obj, true)))

  const deleteActiveObjects = () => modifyActiveObjects(
    (objs, canvas) => {
      objs.forEach(obj => canvas.remove(obj))
      canvas.discardActiveObject()
    },
  )
  // ── Canvas resize handle ──────────────────────────────────────────────────

  function handleResizeStart(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    e.stopPropagation()

    const { clientX: startX, clientY: startY } = toCoordinates(e)
    const startW = width
    const startH = height

    function toCoordinates(e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) {
      return 'touches' in e
        ? e.touches[0] ?? e.changedTouches[0]
        : e
    }
    function getDimensions(e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) {
      const { clientX, clientY } = toCoordinates(e)
      return {
        width: Math.max(200, startW + clientX - startX),
        height: Math.max(100, startH + clientY - startY),
      }
    }

    function onMove(me: MouseEvent | TouchEvent) {
      fabricRef.current?.setDimensions(getDimensions(me))
    }

    function onUp() {
      editor.update(() => {
        if (!fabricRef.current) return
        const node = $getNodeByKey(nodeKey)
        if ($isFabricNode(node)) node.setDimensions(fabricRef.current.width, fabricRef.current.height)
      })
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)
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
        <div className="flex flex-wrap gap-1 items-center absolute top-full left-0 bg-white p-1 rounded border border-gray-300 z-10 max-w-dvw">
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addRect() }} title={t('addRect')}>▭</button>
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addEllipse() }} title={t('addEllipse')}>⬭</button>
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addCircle() }} title={t('addCircle')}>○</button>
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addPolygon(3) }} title={t('addTriangle')}>△</button>
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addPolygon(5) }} title={t('addPentagon')}>⬠</button>
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addPolygon(6) }} title={t('addHexagon')}>⬡</button>
          <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); addText() }} title={t('addText')}>T</button>
          {activeObjects.length > 0 && (
            <>
              <span className="w-px self-stretch bg-gray-300 mx-1" />
              <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); bringForward() }} title={t('bringForward')}>Y</button>
              <button className={shapeButtonClass} onMouseDown={(e) => { e.preventDefault(); sendBackward() }} title={t('sendBackward')}>A</button>
              <label className="flex items-center gap-1 text-xs text-gray-600">
                {t('fill')}
                <input
                  type="color"
                  value={toColor(activeObjects[0].fill)}
                  className="w-6 h-5 cursor-pointer rounded border-0 p-0"
                  onChange={(e) => applyFill(e.target.value)}
                />
              </label>
              <label className="flex items-center gap-1 text-xs text-gray-600">
                {t('stroke')}
                <input
                  type="color"
                  value={toColor(activeObjects[0].stroke)}
                  className="w-6 h-5 cursor-pointer rounded border-0 p-0"
                  onChange={(e) => applyStroke(e.target.value)}
                />
              </label>
              <button
                className="py-0.5 px-2 text-xs text-red-600 bg-white rounded border-gray-300 hover:bg-gray-50 border cursor-pointer"
                onMouseDown={deleteActiveObjects}
              >
                {t('deleteShape')}
              </button>
            </>
          )}
          <span className="ml-auto">
            <button
              className="py-0.5 px-2 text-xs text-red-600 bg-white rounded border-gray-300 hover:bg-gray-50 border cursor-pointer"
              onMouseDown={(e) => { e.preventDefault(); removeNode() }}
              onTouchMove={e => e.preventDefault()}
            >
              {t('removeDiagram')}
            </button>
          </span>
        </div>
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

// ─── Public API ───────────────────────────────────────────────────────────────

export function $createFabricNode(width = 600, height = 400, data = ''): FabricNode {
  return new FabricNode(width, height, data)
}

export function $isFabricNode(node: LexicalNode | null | undefined): node is FabricNode {
  return node instanceof FabricNode
}

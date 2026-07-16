import { useEffect, useEffectEvent, useRef } from 'react'
import { ActiveSelection, Canvas, FabricImage, FabricObject } from 'fabric'
import equal from 'fast-deep-equal'

import { onCanvasKeydown } from './canvas/keydownHandler'

import './canvas/canvasSetup'
import './canvas/patchPolylineExport'

interface FabricCanvasProps {
  backgroundImage?: string | null
  width: number
  height: number
  data: object
  editable?: boolean
  onCanvasCreated?: (canvas: Canvas) => void
  onUpdate?: (canvas: Canvas) => void
  onSelect?: (objs: FabricObject[]) => void
}

const nop = () => {}

export function FabricCanvas({ width, height, data, backgroundImage, editable = false, onCanvasCreated, onUpdate, onSelect }: FabricCanvasProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<Canvas | null>(null)
  const lastDataRef = useRef<object | null>(null)
  const isLoadingRef = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const loadData = useEffectEvent(() => {
    if (!data || !canvasRef.current) return
    if (equal(data, lastDataRef.current)) return
    lastDataRef.current = data
    isLoadingRef.current = true

    // scale normalization breaks the selection, so we store it to restore it after loading
    const selectedIds = canvasRef.current.getActiveObjects().map(obj => obj._id)

    canvasRef.current.loadFromJSON(data).then(() => {
      if (!canvasRef.current) return
      isLoadingRef.current = false
      setEditable(canvasRef.current, editable)

      if (selectedIds.length > 0) {
        const selectedObjs = canvasRef.current.getObjects().filter(obj => selectedIds.includes(obj._id))
        if (selectedObjs.length > 0) {
          const sel = new ActiveSelection(selectedObjs, { canvas: canvasRef.current })
          canvasRef.current.setActiveObject(sel)
        }
        canvasRef.current.renderAll()
      }
    })
  })
  const createHandler = useEffectEvent(onCanvasCreated ?? nop)
  const onUpdateHandler = useEffectEvent(() => {
    // Apply a small delay to avoid calling onUpdate too often when multiple objects are being modified at once
    if (canvasRef.current && !isLoadingRef.current) {
      // console.log('Canvas updated')
      lastDataRef.current = canvasRef.current.toJSON()
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        if (canvasRef.current) {
          lastDataRef.current = canvasRef.current.toJSON()
          onUpdate?.(canvasRef.current)
        }
        timerRef.current = null
      }, 50)
    }
  })
  const onSelectHandler = useEffectEvent(onSelect ?? nop)

  // ── Initialize fabric canvas (once on mount) ──────────────────────────────

  useEffect(() => {
    const el = canvasElRef.current
    if (!el) return

    const canvas = new Canvas(el, {
      backgroundColor: '#ffffff',
      stopContextMenu: false,
      targetFindTolerance: 5,
    })
    createHandler(canvas)
    canvasRef.current = canvas
    canvas.on('object:added', onUpdateHandler)
    canvas.on('object:modified', onUpdateHandler)
    canvas.on('object:removed', onUpdateHandler)
    canvas.on('selection:created', (e) => onSelectHandler(e.selected ?? []))
    canvas.on('selection:updated', (e) => onSelectHandler(e.selected ?? []))
    canvas.on('selection:cleared', () => onSelectHandler([]))

    return () => {
      canvas.dispose()
      canvasRef.current = null
    }
  }, [])

  // Sync data from external changes (eg. undo/redo/server)
  useEffect(() => loadData(), [data])

  useEffect(() => { // Sync dimensions from external changes
    const canvas = canvasRef.current
    if (canvas) {
      canvas.setDimensions({ width, height })
    }
  }, [width, height])

  useEffect(() => { // Sync background image from external changes
    const canvas = canvasRef.current
    if (canvas) {
      setBackgroundImage(canvas, backgroundImage)
    }
  }, [backgroundImage])

  useEffect(() => { // Sync editable state
    const canvas = canvasRef.current
    if (canvas) setEditable(canvas, editable)
  }, [editable])

  // Wrap the canvas in a div to prevent React erroring on unmount
  // when trying to remove the canvas that fabric has modified
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      role="application"
      onKeyDown={e => {
        // Without an editable canvas, we don't want to handle keydown events
        // we use selection to determine if the canvas is editable, since it is only set when the canvas is editable
        if (!canvasRef.current || !editable) return
        onCanvasKeydown(e, canvasRef.current)
      }}
      tabIndex={-1}>
      <canvas ref={canvasElRef} />
    </div>
  )
}

function setEditable(canvas: Canvas, editable: boolean) {
  canvas.selection = editable
  canvas.getObjects().forEach(obj => {
    obj.selectable = editable
    obj.evented = editable
  })
  canvas.renderAll()
}

async function setBackgroundImage(canvas: Canvas, backgroundImage: string | null | undefined) {
  if (backgroundImage) {
    const image = await FabricImage.fromURL(backgroundImage)
    image.left = image.width / 2
    image.top = image.height / 2
    canvas.backgroundImage = image
  } else {
    canvas.backgroundImage = undefined
  }
  canvas.requestRenderAll()
}

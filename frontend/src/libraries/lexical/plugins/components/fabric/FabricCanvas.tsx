import { useEffect, useEffectEvent, useRef } from 'react'
import { Canvas, FabricObject } from 'fabric'
import equal from 'fast-deep-equal'

interface FabricCanvasProps {
  width: number
  height: number
  data: string
  editable?: boolean
  onCanvasCreated?: (canvas: Canvas) => void
  onUpdate?: (canvas: Canvas) => void
  onSelect?: (objs: FabricObject[]) => void
}

const nop = () => {}

export function FabricCanvas({ width, height, data, editable = false, onCanvasCreated, onUpdate, onSelect }: FabricCanvasProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<Canvas | null>(null)
  const lastDataRef = useRef<string | null>(null)
  const isLoadingRef = useRef(false)

  const loadData = useEffectEvent(() => {
    if (!data || !canvasRef.current) return
    if (equal(data, lastDataRef.current)) return
    lastDataRef.current = data
    isLoadingRef.current = true
    canvasRef.current.loadFromJSON(data).then(() => {
      if (!canvasRef.current) return
      isLoadingRef.current = false
      setEditable(canvasRef.current, editable)
    })
  })
  const createHandler = useEffectEvent(onCanvasCreated ?? nop)
  const onUpdateHandler = useEffectEvent(() => {
    if (canvasRef.current && !isLoadingRef.current) {
      // console.log('Canvas updated')
      lastDataRef.current = canvasRef.current.toJSON()
      onUpdate?.(canvasRef.current)
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

  // Sync data from external changes (undo/redo)
  useEffect(() => loadData(), [data])

  useEffect(() => { // Sync dimensions from external changes
    const canvas = canvasRef.current
    if (canvas) {
      canvas.setDimensions({ width, height })
    }
  }, [width, height])

  useEffect(() => { // Sync editable state
    const canvas = canvasRef.current
    if (canvas) setEditable(canvas, editable)
  }, [editable])

  // Wrap the canvas in a div to prevent React erroring on unmount
  // when trying to remove the canvas that fabric has modified
  return (<div><canvas ref={canvasElRef} /></div>)
}

function setEditable(canvas: Canvas, editable: boolean) {
  canvas.selection = editable
  canvas.getObjects().forEach(obj => {
    obj.selectable = editable
    obj.evented = editable
  })
  canvas.renderAll()
}

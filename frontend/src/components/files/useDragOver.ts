import { useEffect, useRef, useState } from 'react'

export type DropEffect = 'none' | 'copy' | 'move' | 'link'

interface UseDragOverOptions {
  dropEffect?: DropEffect
  onDrop?: (items: DataTransferItem[]) => void
}

// Global shared drag state
let activeDropZoneCount = 0
let lastActiveZone: HTMLElement | null = null

export function useDragOver<T extends HTMLElement>(options: UseDragOverOptions = {}) {
  const { dropEffect = 'copy', onDrop: onDropCallback } = options

  const ref = useRef<T>(null)
  const [isOver, setIsOver] = useState(false)
  const depth = useRef(0)

  useEffect(() => {
    const zone = ref.current
    if (!zone) return

    const abortCtrl = new AbortController()
    zone.addEventListener('dragenter', (e: DragEvent) => {
      if (!hasFiles(e)) return

      depth.current += 1
      if (depth.current === 1) {
        activeDropZoneCount += 1
        lastActiveZone = zone
        setIsOver(true)
      }
    }, abortCtrl)
    zone.addEventListener('dragleave', (e: DragEvent) => {
      if (!hasFiles(e)) return

      depth.current -= 1
      if (depth.current === 0) {
        activeDropZoneCount -= 1
        if (lastActiveZone === zone) lastActiveZone = null
        setIsOver(false)
      }
    }, abortCtrl)
    zone.addEventListener('dragover', (e: DragEvent) => {
      if (!hasFiles(e)) return

      e.preventDefault()
      if (e.dataTransfer && lastActiveZone === zone) {
        e.dataTransfer.dropEffect = dropEffect
      }
    }, abortCtrl)

    zone.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault()

      depth.current = 0
      activeDropZoneCount -= 1
      setIsOver(false)
      if (lastActiveZone === zone) lastActiveZone = null

      if (onDropCallback) {
        const items = getDataTransferItems(e)
          .filter(item => item.kind === 'file')
        onDropCallback(items)
      }
    }, abortCtrl)

    window.addEventListener('dragover', (e: DragEvent) => {
      if (activeDropZoneCount === 0 && e.dataTransfer) {
        e.dataTransfer.dropEffect = 'none'
      }
    }, abortCtrl)

    return () => abortCtrl.abort()
  }, [onDropCallback, dropEffect])

  return { ref, isOver }
}

function hasFiles(event: DragEvent) {
  return getDataTransferItems(event).some(item => item.kind === 'file')
}

function getDataTransferItems(e: DragEvent) {
  if (!e.dataTransfer) return []
  return [...e.dataTransfer.items]
}

import { useEffect, useRef, useState } from 'react'

export type DropEffect = 'none' | 'copy' | 'move' | 'link'

interface UseDragOverOptions {
  dropEffect?: DropEffect
  onDrop?: (files: File[]) => void
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

    const onDragEnter = (e: DragEvent) => {
      if (!hasFiles(e)) {
        return
      }

      depth.current += 1
      if (depth.current === 1) {
        activeDropZoneCount += 1
        lastActiveZone = zone
        setIsOver(true)
      }
    }

    const onDragLeave = (e: DragEvent) => {
      if (!hasFiles(e)) {
        return
      }

      depth.current -= 1
      if (depth.current === 0) {
        activeDropZoneCount -= 1
        if (lastActiveZone === zone) lastActiveZone = null
        setIsOver(false)
      }
    }

    const onDragOver = (e: DragEvent) => {
      if (!hasFiles(e)) {
        // Reject drop
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'none'
        }
        return
      }

      e.preventDefault()
      if (e.dataTransfer && lastActiveZone === zone) {
        e.dataTransfer.dropEffect = dropEffect
      }
    }

    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) {
        return // ignore drop
      }

      e.preventDefault()

      depth.current = 0
      setIsOver(false)

      activeDropZoneCount -= 1
      if (lastActiveZone === zone) lastActiveZone = null

      if (onDropCallback) {
        const files = getDataTransferItems(e)
          .map(file => file.getAsFile())
          .filter(file => file !== null)
        onDropCallback(files)
      }
    }

    const globalOnDragOver = (e: DragEvent) => {
      if (activeDropZoneCount === 0 && e.dataTransfer) {
        e.dataTransfer.dropEffect = 'none'
      }
    }

    zone.addEventListener('dragenter', onDragEnter)
    zone.addEventListener('dragleave', onDragLeave)
    zone.addEventListener('dragover', onDragOver)
    zone.addEventListener('drop', onDrop)
    window.addEventListener('dragover', globalOnDragOver)

    return () => {
      zone.removeEventListener('dragenter', onDragEnter)
      zone.removeEventListener('dragleave', onDragLeave)
      zone.removeEventListener('dragover', onDragOver)
      zone.removeEventListener('drop', onDrop)
      window.removeEventListener('dragover', globalOnDragOver)
    }
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

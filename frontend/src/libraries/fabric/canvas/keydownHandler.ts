import { KeyboardEvent } from 'react'
import { ActiveSelection, Canvas } from 'fabric'

import { copySelectionToClipboard, pasteFromClipboard } from './clipboard'

export function onCanvasKeydown(e: KeyboardEvent<HTMLDivElement>, canvas: Canvas): void {
  if (isCopyShortcut(e)) {
    if (canvas.getActiveObjects().length === 0) return
    e.preventDefault()
    e.stopPropagation()
    void copySelectionToClipboard(canvas)
    return
  }
  if (isPasteShortcut(e)) {
    e.preventDefault()
    e.stopPropagation()
    void pasteFromClipboard(canvas)
    return
  }

  switch (e.key) {
    case 'Delete':
    case 'Backspace': {
      const active = canvas.getActiveObjects()
      if (active.length > 0) {
        active.forEach(obj => canvas.remove(obj))
        canvas.discardActiveObject()
        canvas.renderAll()
        e.preventDefault()
        e.stopPropagation()
      }
      break
    }
    case 'ArrowUp':
      moveActive(e, canvas, 0, -1 * multiplierForArrowKey(e))
      break
    case 'ArrowDown':
      moveActive(e, canvas, 0, 1 * multiplierForArrowKey(e))
      break
    case 'ArrowLeft':
      moveActive(e, canvas, -1 * multiplierForArrowKey(e), 0)
      break
    case 'ArrowRight':
      moveActive(e, canvas, 1 * multiplierForArrowKey(e), 0)
      break
    case 'a': {
      if (e.ctrlKey || e.metaKey) {
        canvas.discardActiveObject()
        const selection = new ActiveSelection(canvas.getObjects(), { canvas })
        canvas.setActiveObject(selection)
        canvas.requestRenderAll()
        e.preventDefault()
        e.stopPropagation()
      }
      break
    }
  }
}

function multiplierForArrowKey(e: KeyboardEvent) {
  if (e.shiftKey || e.ctrlKey || e.metaKey) return 10
  return 1
}

function moveActive(event: KeyboardEvent, canvas: Canvas, dx: number, dy: number) {
  const active = canvas.getActiveObjects()
  if (active.length > 0) {
    active.forEach(obj => {
      obj.left = (obj.left ?? 0) + dx
      obj.top = (obj.top ?? 0) + dy
      obj.setCoords()
    })
    canvas.requestRenderAll()
    event.preventDefault()
    event.stopPropagation()
  }
}

function isCopyShortcut(e: KeyboardEvent<HTMLDivElement>) {
  return !e.shiftKey && !e.altKey && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c'
}

function isPasteShortcut(e: KeyboardEvent<HTMLDivElement>) {
  return !e.shiftKey && !e.altKey && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v'
}

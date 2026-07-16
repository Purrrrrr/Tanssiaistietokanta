import { KeyboardEvent } from 'react'
import { Canvas } from 'fabric'

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
    }
  }
}

function isCopyShortcut(e: KeyboardEvent<HTMLDivElement>) {
  return !e.shiftKey && !e.altKey && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c'
}

function isPasteShortcut(e: KeyboardEvent<HTMLDivElement>) {
  return !e.shiftKey && !e.altKey && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v'
}

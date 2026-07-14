import { KeyboardEvent } from 'react'
import { Canvas } from 'fabric'

export function onCanvasKeydown(e: KeyboardEvent<HTMLDivElement>, canvas: Canvas): void {
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

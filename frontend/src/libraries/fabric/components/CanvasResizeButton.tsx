import { Canvas } from 'fabric'

import { useFabricTranslation } from '../i18n'

interface CanvasResizeButtonProps {
  canvas: Canvas
  onResized: () => void
}

export function CanvasResizeButton({ canvas, onResized }: CanvasResizeButtonProps) {
  function handleResizeStart(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    e.stopPropagation()
    const controller = new AbortController()
    const { signal } = controller

    const { clientX: startX, clientY: startY } = toCoordinates(e)
    const startW = canvas.width
    const startH = canvas.height

    function toCoordinates(e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) {
      return 'touches' in e
        ? e.touches[0] ?? e.changedTouches[0]
        : e
    }

    function onMove(e: MouseEvent | TouchEvent) {
      const { clientX, clientY } = toCoordinates(e)
      canvas?.setDimensions({
        width: Math.max(200, startW + clientX - startX),
        height: Math.max(100, startH + clientY - startY),
      })
    }

    function onUp() {
      onResized()
      controller.abort()
    }

    window.addEventListener('mousemove', onMove, { signal })
    window.addEventListener('touchmove', onMove, { signal })
    window.addEventListener('mouseup', onUp, { signal })
    window.addEventListener('touchend', onUp, { signal })
  }

  return (
    <button
      type="button"
      className="absolute -bottom-2 -right-2 size-4 border-2 border-blue-500 cursor-se-resize z-10 touch-none"
      onMouseDown={handleResizeStart}
      onTouchStart={handleResizeStart}
      title={useFabricTranslation('resize')}
    />
  )
}

import { useEffect } from 'react'

export function useResizeObserver(element: { current: HTMLElement | null }, callback: ResizeObserverCallback) {
  useEffect(() => {
    if (!element.current) return

    const observer = new ResizeObserver(callback)
    observer.observe(element.current)

    return () => observer.disconnect()
  }, [element, callback])
}

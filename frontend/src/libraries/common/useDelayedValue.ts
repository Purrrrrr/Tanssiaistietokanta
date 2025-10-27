import { useLayoutEffect, useRef, useState } from 'react'

export function useDelayedValue<T>(value: T, delay: number): T {
  const [previous, setPrevious] = useState(value)
  const pendingValue = useRef(value)
  useLayoutEffect(() => {
    if (pendingValue.current !== value) {
      pendingValue.current = value
      const id = setTimeout(() => setPrevious(value), delay)
      return () => {
        setPrevious(value)
        clearTimeout(id)
      }
    }
  }, [value, delay])
  return previous
}

import { useLayoutEffect, useState } from 'react'

export function useShouldRender(isOpen: boolean, delay?: number) {
  const [shouldrender, setShouldRender] = useState(false)

  useLayoutEffect(() => {
    if (isOpen) {
      setShouldRender(true)
    } else {
      const id = setTimeout(() => setShouldRender(false), delay)
      return () => clearTimeout(id)
    }
  }, [isOpen, delay])

  return isOpen || shouldrender
}

import { useLayoutEffect, useState } from 'react'

export function useShouldRender(isOpen: boolean, delay?: number) {
  const [shouldrender, setShouldRender] = useState(false)

  useLayoutEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      // const id = setTimeout(() => setShouldRender(true), 30000)
      // return () => clearTimeout(id)
    } else {
      const id = setTimeout(() => setShouldRender(false), delay)
      return () => clearTimeout(id)
    }
  }, [isOpen, delay])

  return shouldrender
}

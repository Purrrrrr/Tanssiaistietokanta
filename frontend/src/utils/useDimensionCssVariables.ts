import { useCallback, useRef } from 'react'

import { useResizeObserver } from 'libraries/ui'

export function useDimensionCssVariables(cssDimensionVariablePrefix?: string) {
  const ref = useRef<HTMLDivElement>(null)

  useResizeObserver(ref, useCallback(entries => {
    if (!cssDimensionVariablePrefix) return
    const [{ target }] = entries
    const h = target?.scrollHeight ?? 0
    const w = target?.scrollWidth ?? 0
    if (h > 0) {
      document.body.style.setProperty(`--${cssDimensionVariablePrefix}-height`, `${h}px`)
    }
    if (w > 0) {
      document.body.style.setProperty(`--${cssDimensionVariablePrefix}-width`, `${w}px`)
    }
  }, [cssDimensionVariablePrefix]))

  return ref
}

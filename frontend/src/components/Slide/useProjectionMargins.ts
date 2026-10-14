import { useEffect, useState } from 'react'

import {
  changeProjectionMargin, defaultProjectionMargins, normalizeProjectionMargins,
  ProjectionMarginSide, projectionMarginsStorageKey,
} from './projectionMargins'

export function useProjectionMargins() {
  const [margins, setMargins] = useState(() => {
    try {
      return normalizeProjectionMargins(JSON.parse(localStorage.getItem(projectionMarginsStorageKey) ?? 'null'))
    } catch {
      return { ...defaultProjectionMargins }
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(projectionMarginsStorageKey, JSON.stringify(margins))
    } catch {
      // Keep adjustments usable when browser storage is unavailable.
    }
  }, [margins])

  return {
    margins,
    setMargin: (side: ProjectionMarginSide, value: number) => {
      setMargins(previous => changeProjectionMargin(previous, side, value))
    },
    resetMargins: () => setMargins({ ...defaultProjectionMargins }),
  }
}

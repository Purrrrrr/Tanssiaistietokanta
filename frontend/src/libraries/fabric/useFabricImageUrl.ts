import { useEffect, useMemo, useState } from 'react'

import type { FabricDiagramData } from './types'

import { socketRequest } from 'backend'

import { expandFabricObject } from './minify'

export function useFabricImageUrl(node?: FabricDiagramData) {
  const { data, width, height } = node ?? { data: null, width: 0, height: 0 }
  const [svg, setSvg] = useState<string | null>(null)

  useEffect(() => {
    if (data === null) {
      return
    }
    const expandedData = expandFabricObject(data)
    socketRequest('diagrams', 'create', { width, height, data: expandedData }).then(svg => setSvg(svg as string))
  }, [width, height, data])

  const src = useMemo(() => {
    if (!svg) return null

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    return URL.createObjectURL(blob)
  }, [svg])

  useEffect(() => {
    return () => {
      if (src) {
        URL.revokeObjectURL(src)
      }
    }
  }, [src])

  return data ? src : null
}

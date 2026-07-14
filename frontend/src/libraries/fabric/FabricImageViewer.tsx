import { useEffect, useMemo, useState } from 'react'

import type { FabricDiagramData } from './types'

import { socketRequest } from 'backend'

import { expandFabricObject } from './minify'

export default function FabricImageViewer({ node }: {
  node: FabricDiagramData
}) {
  const { data: minifiedData, width, height } = node
  const data = useMemo(() => expandFabricObject(minifiedData), [minifiedData])
  const [svg, setSvg] = useState<string | null>(null)

  useEffect(() => {
    socketRequest('diagrams', 'create', { width, height, data }).then(svg => setSvg(svg as string))
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

  return <img src={src as string} alt="" height={height} width={width} />
}

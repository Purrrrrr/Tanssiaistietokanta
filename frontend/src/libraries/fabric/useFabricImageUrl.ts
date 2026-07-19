import { useEffect, useMemo, useState } from 'react'

import type { FabricDiagramData } from './types'

import { socketRequest } from 'backend'

import { expandFabricObject } from './minify'

export function useFabricImageUrl(node?: FabricDiagramData, backgroundNode?: FabricDiagramData): string | null {
  const [svg, setSvg] = useState<string | null>(null)

  useEffect(() => {
    if (node?.data == null) {
      return
    }
    loadSvg(node, backgroundNode).then(svg => setSvg(svg as string))
  }, [node, backgroundNode])

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

  return node?.data ? src : null
}

function loadSvg(node: FabricDiagramData, backgroundNode?: FabricDiagramData): Promise<string> {
  if (backgroundNode) {
    return Promise.all([loadData(backgroundNode), loadData(node)])
      .then(([backgroundSvg, svg]) => combineSvgs(backgroundSvg, svg))
  } else {
    return loadData(node)
  }
}

function loadData(node: FabricDiagramData): Promise<string> {
  const { data, width, height } = node
  const expandedData = expandFabricObject(data)
  return socketRequest('diagrams', 'create', { width, height, data: expandedData }) as Promise<string>
}

function combineSvgs(svg1: string, svg2: string): string {
  const parser = new DOMParser()
  const doc1 = parser.parseFromString(svg1, 'image/svg+xml')
  const doc2 = parser.parseFromString(svg2, 'image/svg+xml')

  const svgElement1 = doc1.documentElement
  const svgElement2 = doc2.documentElement

  // Create a new SVG element to hold the combined content
  const combinedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  combinedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  combinedSvg.setAttribute('width', svgElement1.getAttribute('width') ?? '0')
  combinedSvg.setAttribute('height', svgElement1.getAttribute('height') ?? '0')

  // Append the first SVG's children to the combined SVG
  while (svgElement1.firstChild) {
    combinedSvg.appendChild(svgElement1.firstChild)
  }

  // Append the second SVG's children to the combined SVG
  while (svgElement2.firstChild) {
    combinedSvg.appendChild(svgElement2.firstChild)
  }

  // Serialize the combined SVG back to a string
  const serializer = new XMLSerializer()
  return serializer.serializeToString(combinedSvg)
}

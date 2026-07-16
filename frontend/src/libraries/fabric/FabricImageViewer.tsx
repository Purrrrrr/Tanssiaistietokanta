import type { FabricDiagramData } from './types'

import { useFabricImageUrl } from './useFabricImageUrl'

export default function FabricImageViewer({ diagram, backgroundDiagram }: {
  diagram: FabricDiagramData
  backgroundDiagram?: FabricDiagramData
}) {
  const url = useFabricImageUrl(diagram)

  if (backgroundDiagram) {
    return <div className="relative">
      <FabricImageViewer diagram={backgroundDiagram} />
      <img src={url ?? undefined} alt="" height={diagram.height} width={diagram.width} className="absolute top-0 left-0" />
    </div>
  }

  return <img src={url ?? undefined} alt="" height={diagram.height} width={diagram.width} />
}

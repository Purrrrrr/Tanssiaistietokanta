import type { FabricDiagramData } from './types'

import { useFabricImageUrl } from './useFabricImageUrl'

export default function FabricImageViewer({ diagram, backgroundDiagram, ...rest }: {
  diagram: FabricDiagramData
  backgroundDiagram?: FabricDiagramData
} & Omit<React.ComponentProps<'img'>, 'src' | 'height' | 'width'>) {
  const url = useFabricImageUrl(diagram, backgroundDiagram)

  return <img
    src={url ?? undefined}
    alt=""
    height={diagram.height}
    width={diagram.width}
    {...rest}
  />
}

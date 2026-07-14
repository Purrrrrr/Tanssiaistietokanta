import { AnyNode } from 'libraries/common/minificationUtils'

export type MinifiedFabricData = AnyNode // Opaque minified data type

export interface FabricDiagramData {
  data: MinifiedFabricData
  width: number
  height: number
  hash: string
}

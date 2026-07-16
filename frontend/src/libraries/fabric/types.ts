export type MinifiedValue =
  | string | number | boolean | null | undefined
  | MinifiedNode | MinifiedNode[]

export interface MinifiedNode {
  _id: string
  [key: string]: MinifiedValue
}

export type MinifiedFabricData = Record<string, MinifiedValue>

export interface FabricDiagramData {
  data: MinifiedFabricData
  width: number
  height: number
  hash: string
}

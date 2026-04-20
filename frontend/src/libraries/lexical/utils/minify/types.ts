export type MinifiedValue =
  | string | number | boolean | null | undefined
  | MinifiedNode | MinifiedNode[]

export interface MinifiedNode {
  _id: string
  [key: string]: MinifiedValue
}

export interface MinifiedDocumentContent extends Omit<MinifiedNode, '_id'> {
  /** Format version marker */
  V: number
}

export type AnyNode = Record<string, unknown>

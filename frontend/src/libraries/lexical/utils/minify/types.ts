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

/** A bidirectional key abbreviation mapping. */
export interface KeyMapping {
  /** Maps original (long) key names to their minified short codes. */
  map: Record<string, string>
  /** Maps minified short codes back to original key names. */
  unmap: Record<string, string>
}

/** A paired minify/expand transformation applied to a serialized node. */
export interface Transformation<T = AnyNode, M = T> {
  minify: (node: T) => M
  expand: (node: M) => T
}

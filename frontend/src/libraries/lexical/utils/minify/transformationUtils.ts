import equal from 'fast-deep-equal'

import type { AnyNode, MinifiedValue, Transformation } from './types'

/** Creates a `Transformation` that only applies when the node's `type` field
 *  (at its original, expanded value) matches one of the given `types`.
 *
 *  @param typeKey - The key name used to look up the type in a *minified* node (e.g. `'t'`).
 *  @param typeUnmap - A map from minified type values back to their original names. */
export function createForTypes(
  types: string[],
  transformation: Transformation,
  { typeKey, typeUnmap }: { typeKey: string, typeUnmap: Record<string, string> },
): Transformation {
  return {
    minify: (node: AnyNode) => {
      const minifiedTypeValue = node[typeKey] as string
      const type = typeUnmap[minifiedTypeValue] ?? minifiedTypeValue
      return types.includes(type) ? transformation.minify(node) : node
    },
    expand: (node: AnyNode) => {
      return types.includes(node.type as string) ? transformation.expand(node) : node
    },
  }
}

/** Creates a `Transformation` that removes keys whose values equal their defaults
 *  during minification and restores them during expansion.
 *
 *  @param minifyKeyFn - A function that maps an original key name to its minified form. */
export function createDefaultValues(
  defaults: Record<string, MinifiedValue>,
  minifyKeyFn: (key: string) => string,
): Transformation {
  return {
    minify: (node: AnyNode) => {
      let changed = false
      const result = { ...node }
      for (const [key, defaultValue] of Object.entries(defaults)) {
        const minKey = minifyKeyFn(key)
        if (equal(result[minKey], defaultValue)) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete result[minKey]
          changed = true
        }
      }
      return changed ? result : node
    },
    expand: (node: AnyNode) => {
      let changed = false
      const newFields: AnyNode = {}
      for (const [key, defaultValue] of Object.entries(defaults)) {
        if (node[key] === undefined) {
          newFields[key] = defaultValue
          changed = true
        }
      }
      return changed ? { ...node, ...newFields } : node
    },
  }
}

/** Runs all transformations forward (minify direction) in order. */
export function applyTransformations(transformations: Transformation[], node: AnyNode): AnyNode {
  let result = node
  for (const transformation of transformations) {
    result = transformation.minify(result)
  }
  return result
}

/** Runs all transformations in reverse (expand direction). */
export function applyReverseTransformations(transformations: Transformation[], node: AnyNode): AnyNode {
  let result = node
  for (const transformation of [...transformations].reverse()) {
    result = transformation.expand(result)
  }
  return result
}

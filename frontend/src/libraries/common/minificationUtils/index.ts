import equal from 'fast-deep-equal'

import type { AnyNode, KeyMapping, MinifiedValue, Transformation } from './types'

import { applyExpandKey, applyMinifyKey, expandObjectKeys, minifyObjectKeys } from './keyMap'

export { applyMinifyKey, createKeyMapping } from './keyMap'
export type * from './types'

/** Creates a `Transformation` that only applies when the node's `type` field
 *  (at its original, expanded value) matches one of the given `types`.
 *
 *  @param typeKey - The key name used to look up the type in a *minified* node (e.g. `'t'`).
 *  @param typeUnmap - A map from minified type values back to their original names. */
export function forTypes(
  types: string[],
  transformation: Transformation,
): Transformation {
  return {
    minify: (node: AnyNode) => {
      return types.includes(node.type as string) ? transformation.minify(node) : node
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
export function defaultValues(
  defaults: Record<string, MinifiedValue>,
): Transformation {
  return {
    minify: (node: AnyNode) => {
      let changed = false
      const result = { ...node }
      for (const [key, defaultValue] of Object.entries(defaults)) {
        if (equal(result[key], defaultValue)) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete result[key]
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

export function keyMapper(mapping: KeyMapping): Transformation {
  return {
    minify: minifyObjectKeys.bind(null, mapping),
    expand: expandObjectKeys.bind(null, mapping),
  }
}

export function typeMapper(mapping: KeyMapping, key: string = 'type'): Transformation {
  return mapKey<string>(key, {
    minify: applyMinifyKey.bind(null, mapping),
    expand: applyExpandKey.bind(null, mapping),
  })
}

export function mapKey<T, M = T>(key: string, transformation: Transformation<T, M>): Transformation {
  return {
    minify: (node: AnyNode) => key in node
      ? ({ ...node, [key]: transformation.minify(node[key] as T) })
      : node,
    expand: (node: AnyNode) => key in node
      ? ({ ...node, [key]: transformation.expand(node[key] as M) })
      : node,
  }
}

/** Runs all transformations forward (minify direction) in order. */
export function applyTransformations(transformations: Transformation[], node: AnyNode): AnyNode {
  let result = { ...node }
  for (const transformation of transformations) {
    result = transformation.minify(result)
  }
  return result
}

/** Runs all transformations in reverse (expand direction). */
export function applyReverseTransformations(transformations: Transformation[], node: AnyNode): AnyNode {
  let result = { ...node }
  for (const transformation of [...transformations].reverse()) {
    result = transformation.expand(result)
  }
  return result
}

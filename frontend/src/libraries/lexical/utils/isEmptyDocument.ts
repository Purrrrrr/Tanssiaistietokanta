import type { MinifiedDocumentContent, MinifiedNode } from './minify'

export function isEmptyDocument(root: MinifiedDocumentContent | null | undefined, treshold = 10): boolean {
  if (!root) return true
  const { c: children } = root
  if (!Array.isArray(children)) return true
  if (children.length === 0) return true
  if (children.length === 1) {
    if (isEmptyNode(children[0], treshold)) return true
  }
  return false
}

function isEmptyNode(node: MinifiedNode, treshold = 10): boolean {
  if (!node) return true
  if (node.t === 'tx') {
    if (typeof node.x !== 'string') return true
    if (node.x.trim().length > treshold) return false
    return true
  }
  if (!Array.isArray(node.c)) return true

  return node.c.every(c => isEmptyNode(c, treshold))
}

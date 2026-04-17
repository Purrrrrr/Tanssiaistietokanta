import type { EditorState, LexicalEditor, LexicalNode, SerializedEditorState } from 'lexical'
import { $getRoot, $isElementNode } from 'lexical'

import type { AnyNode, MinifiedEditorState, MinifiedNode } from './types'

import randomId from 'utils/randomId'

import { FORMAT_VERSION, TYPE_MAP, TYPE_UNMAP } from './constants'
import { expandKey, minifyKey } from './keys'
import { runExpandTransformations, runMinifyTransformations } from './transformations'

/** Walks the live `EditorState` tree, embeds a stable `_id` on every node
 *  (generating new UUIDs for nodes not yet in `idMap`), and returns a fully
 *  minified representation. */
export function minifyLiveState(editorState: EditorState, idMap = new Map<string, string>()): MinifiedEditorState {
  return editorState.read(() => ({
    V: FORMAT_VERSION,
    ...minifyLiveNode($getRoot(), idMap),
  }))
}

/** Walks the live Lexical node tree, assigning new UUIDs to any node not yet in
 *  `idMap`, and returns a minified node with `_id` embedded. */
function minifyLiveNode(node: LexicalNode, idMap: Map<string, string>): MinifiedNode {
  const key = node.getKey()
  let id = idMap.entries().find(([_, key]) => key === node.getKey())?.[0]
  if (id == null) {
    id = randomId(8)
    idMap.set(key, id)
  }

  const { children: _ignored, type, ...serialized } = node.exportJSON() as AnyNode
  const minified: AnyNode = {
    _id: id,
    [minifyKey('type')]: typeof type === 'string' ? (TYPE_MAP[type] ?? type) : type,
  }
  for (const [key, value] of Object.entries(serialized)) {
    if (key === 'children') continue
    minified[minifyKey(key)] = value
  }

  if ($isElementNode(node)) {
    minified[minifyKey('children')] = node.getChildren().map(child => minifyLiveNode(child, idMap))
  }

  return runMinifyTransformations(minified) as MinifiedNode
}

/** Expands a minified editor state back to a full `SerializedEditorState`. */
export function expand({ V, ...state }: MinifiedEditorState): SerializedEditorState {
  if (V !== FORMAT_VERSION) {
    throw new Error(`Unsupported minified state version: ${V}`)
  }
  return {
    root: expandNode(state as AnyNode) as SerializedEditorState['root'],
  }
}

function expandNode(node: AnyNode): AnyNode {
  const result: AnyNode = {}
  for (const [key, value] of Object.entries(node)) {
    if (key === '_id') continue
    const origKey = expandKey(key)
    if (origKey === 'type' && typeof value === 'string') {
      result[origKey] = TYPE_UNMAP[value] ?? value
    } else if (origKey === 'children' && Array.isArray(value)) {
      result[origKey] = value.map(child => expandNode(child as AnyNode))
    } else {
      result[origKey] = value
    }
  }
  return runExpandTransformations(result)
}

export function expandIds(state: AnyNode, editor: LexicalEditor, idMap: Map<string, string>): void {
  idMap.clear()
  editor.read(() => {
    expandNodeIds({ ...state, _id: 'root' }, $getRoot(), idMap)
  })
}

function expandNodeIds(state: AnyNode, node: LexicalNode, idMap: Map<string, string>): void {
  const id = state._id
  // console.log(`expanding node with id ${id} for key ${node.getKey()}`)
  if (typeof id === 'string') {
    idMap.set(id, node.getKey())
  }
  if (!$isElementNode(node)) return

  const children = state[minifyKey('children')]
  if (!Array.isArray(children)) return

  node.getChildren().forEach((child, i) => {
    if (children[i]) {
      expandNodeIds(children[i], child, idMap)
    }
  })
}

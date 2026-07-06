import type { EditorState, LexicalEditor, LexicalNode, SerializedEditorState } from 'lexical'
import { $getRoot, $isElementNode } from 'lexical'

import type { AnyNode, MinifiedDocumentContent, MinifiedNode } from './types'

import randomId from 'utils/randomId'

import { FORMAT_VERSION, LEXICAL_KEY_MAPPING } from './constants'
import { applyMinifyKey } from './keyMap'
import { runExpandTransformations, runMinifyTransformations } from './minifyNodeJson'

/** Walks the live `EditorState` tree, embeds a stable `_id` on every node
 *  (generating new UUIDs for nodes not yet in `idMap`), and returns a fully
 *  minified representation. */
export function minifyLiveState(editorState: EditorState, idMap = new Map<string, string>()): MinifiedDocumentContent {
  return editorState.read(() => ({
    V: FORMAT_VERSION,
    ...runMinifyTransformations(nodeToJson($getRoot(), idMap)) as MinifiedNode,
  }))
}

/** Walks the live Lexical node tree, assigning new UUIDs to any node not yet in
 *  `idMap`, and returns a minified node with `_id` embedded. */
function nodeToJson(node: LexicalNode, idMap: Map<string, string>): AnyNode {
  return {
    ...node.exportJSON() as AnyNode,
    _id: getLiveId(node, idMap),
    children: $isElementNode(node)
      ? node.getChildren().map(child => nodeToJson(child, idMap))
      : undefined,
  }
}

function getLiveId(node: LexicalNode, idMap: Map<string, string>): string {
  const key = node.getKey()
  let id = idMap.entries().find(([_, key]) => key === node.getKey())?.[0]
  if (id == null) {
    // console.log(`assigning new id to node with key ${key} of type ${node.getType()}`)
    // If the node doesn't have an ID in the map yet, generate a new one and add it
    id = randomId(9)
    idMap.set(key, id)
  }
  return id
}

/** Expands a minified editor state back to a full `SerializedEditorState`. */
export function expand({ V, ...state }: MinifiedDocumentContent, expandIds?: boolean): SerializedEditorState {
  if (V !== FORMAT_VERSION) {
    throw new Error(`Unsupported minified state version: ${V}`)
  }
  const result = runExpandTransformations(state as AnyNode)

  if (!expandIds) {
    stripIds(result.root as AnyNode)
  }

  return result as unknown as SerializedEditorState
}

function stripIds(node: AnyNode) {
  delete node._id
  if (Array.isArray(node.children)) {
    node.children.forEach(stripIds)
  }
}

export function expandIds(state: AnyNode, editor: EditorState | LexicalEditor): Map<string, string> {
  const idMap = new Map<string, string>()
  editor.read(() => {
    expandNodeIds({ ...state, _id: 'root' }, $getRoot(), idMap)
  })
  return idMap
}

const childrenKey = applyMinifyKey(LEXICAL_KEY_MAPPING, 'children')

function expandNodeIds(state: AnyNode, node: LexicalNode, idMap: Map<string, string>): void {
  const id = state._id
  // console.log(`expanding node with id ${id} for key ${node.getKey()} of type ${node.getType()}`)
  if (typeof id === 'string') {
    idMap.set(id, node.getKey())
  }
  if (!$isElementNode(node)) return

  const children = state[childrenKey]
  if (!Array.isArray(children)) return

  node.getChildren().forEach((child, i) => {
    if (children[i]) {
      expandNodeIds(children[i], child, idMap)
    }
  })
}

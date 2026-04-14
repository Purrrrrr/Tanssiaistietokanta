import type { SerializedEditorState } from 'lexical'

const FORMAT_VERSION = 1

/** Maps original key names to their minified short codes. */
const KEY_MAP: Record<string, string> = {
  type: 't',
  version: 'v',
  children: 'c',
  altText: 'at',
  backgroundColor: 'bg',
  checked: 'ck',
  colSpan: 'cs',
  detail: 'e',
  direction: 'd',
  format: 'f',
  headerState: 'hs',
  indent: 'i',
  listType: 'lt',
  mode: 'm',
  rel: 'rl',
  rowSpan: 'rs',
  src: 'sr',
  start: 'st',
  style: 's',
  tag: 'g',
  target: 'tg',
  templateColumns: 'tc',
  text: 'x',
  textFormat: 'tf',
  textStyle: 'ts',
  title: 'ti',
  url: 'u',
  value: 'va',
  width: 'w',
}

/** Maps minified short codes back to original key names. */
const KEY_UNMAP: Record<string, string> = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k]),
)

/** Maps known node type strings to their minified short codes. */
const TYPE_MAP: Record<string, string> = {
  root: 'ro',
  autolink: 'al',
  'checklist-item': 'ci',
  heading: 'h',
  image: 'im',
  'layout-container': 'lc',
  'layout-item': 'lI',
  linebreak: 'lb',
  link: 'lk',
  listitem: 'li',
  list: 'l',
  paragraph: 'p',
  'qr-code': 'qr',
  quote: 'q',
  tablecell: 'tc',
  tablerow: 'tr',
  table: 'ta',
  text: 'tx',
}

/** Maps minified type short codes back to their original type strings. */
const TYPE_UNMAP: Record<string, string> = Object.fromEntries(
  Object.entries(TYPE_MAP).map(([k, v]) => [v, k]),
)

export interface MinifiedEditorState {
  /** Format version marker — presence distinguishes minified from original. */
  _v: number
  /** Minified root node. */
  r: unknown
}

type AnyNode = Record<string, unknown>

function minifyNode(node: AnyNode): AnyNode {
  const result: AnyNode = {}
  for (const [key, value] of Object.entries(node)) {
    if (!(key in KEY_MAP)) console.warn(`Unexpected key in node: ${key}`)
    const minKey = KEY_MAP[key] ??
      (key in KEY_UNMAP ? `_${key}` : key) // Avoid collisions with mapped keys
    if (key === 'type' && typeof value === 'string') {
      result[minKey] = TYPE_MAP[value] ?? value
    } else if (key === 'children' && Array.isArray(value)) {
      result[minKey] = value.map(child => minifyNode(child as AnyNode))
    } else {
      result[minKey] = value
    }
  }
  return result
}

function expandNode(node: AnyNode): AnyNode {
  const result: AnyNode = {}
  for (const [key, value] of Object.entries(node)) {
    const origKey = KEY_UNMAP[key] ??
      (key in KEY_MAP ? key.slice(1) : key) // Reverse of minify's collision avoidance
    if (origKey === 'type' && typeof value === 'string') {
      result[origKey] = TYPE_UNMAP[value] ?? value
    } else if (origKey === 'children' && Array.isArray(value)) {
      result[origKey] = value.map(child => expandNode(child as AnyNode))
    } else {
      result[origKey] = value
    }
  }
  return result
}

/** Minifies a Lexical `SerializedEditorState` to a compact representation. */
export function minify(state: SerializedEditorState): MinifiedEditorState {
  return {
    _v: FORMAT_VERSION,
    r: minifyNode(state.root as unknown as AnyNode),
  }
}

/** Expands a minified editor state back to a full `SerializedEditorState`. */
export function expand(state: MinifiedEditorState): SerializedEditorState {
  if (state._v !== FORMAT_VERSION) {
    throw new Error(`Unsupported minified state version: ${state._v}`)
  }
  return {
    root: expandNode(state.r as AnyNode) as SerializedEditorState['root'],
  }
}

/** Returns true if the value looks like a minified editor state. */
export function isMinified(state: unknown): state is MinifiedEditorState {
  return (
    typeof state === 'object' &&
    state !== null &&
    '_v' in state &&
    'r' in state
  )
}

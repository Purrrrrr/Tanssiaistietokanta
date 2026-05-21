import type { KeyMapping } from './types'

import { createKeyMapping } from './keyMap'

export const FORMAT_VERSION = 1

/** Maps original key names to their minified short codes. */
export const KEY_MAP: Record<string, string> = {
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
  size: 'sz',
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
  isUnlinked: 'ul',
  colWidths: 'cw',
  frozenColumnCount: 'fc',
  frozenRowCount: 'fr',
  rowStriping: 'r=',
  value: 'va',
  width: 'w',
  height: 'h',
  data: 'da',
}

export const LEXICAL_KEY_MAPPING: KeyMapping = createKeyMapping(KEY_MAP)
export const KEY_UNMAP: Record<string, string> = LEXICAL_KEY_MAPPING.unmap

if (process.env.NODE_ENV === 'development') {
  if ('V' in KEY_MAP) {
    console.error('KEY_MAP should not contain \'V\' as it is reserved for format versioning.')
  }
}

/** Maps known node type strings to their minified short codes. */
export const TYPE_MAP: Record<string, string> = {
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
  'fabric-diagram': 'fd',
}
export const TYPE_UNMAP: Record<string, string> = Object.fromEntries(
  Object.entries(TYPE_MAP).map(([k, v]) => [v, k]),
)

/** Maps Fabric.js canvas/object property names to their minified short codes.
 *  Covers: shared object properties, Text/IText, Path, Polygon, Group, and canvas root. */
export const FABRIC_KEY_MAP: Record<string, string> = {
  // Shared object properties
  _id: '_id',
  type: 't',
  version: 'v',
  originX: 'ox',
  originY: 'oy',
  left: 'l',
  top: 'tp',
  width: 'w',
  height: 'h',
  ry: 'ry',
  rx: 'rx',
  fill: 'fi',
  fillRule: 'fr',
  stroke: 'sk',
  strokeWidth: 'sw',
  strokeDashArray: 'sda',
  strokeLineCap: 'slc',
  strokeLineJoin: 'slj',
  strokeDashOffset: 'sdo',
  strokeMiterLimit: 'sml',
  strokeUniform: 'su',
  opacity: 'op',
  angle: 'a',
  flipX: 'fx',
  flipY: 'fy',
  visible: 'vi',
  // clipPath: 'cp',
  // hasBorders: 'hb',
  // perPixelTargetFind: 'ppt',
  // lockMovementX: 'lmx',
  // lockMovementY: 'lmy',
  // lockRotation: 'lr',
  // lockScalingX: 'lsx',
  // lockScalingY: 'lsy',
  // lockSkewingX: 'lkx',
  // lockSkewingY: 'lky',
  // lockScalingFlip: 'lsf',
  scaleX: 'sx',
  scaleY: 'sy',
  skewX: 'kx',
  skewY: 'ky',
  shadow: 'sh',
  paintFirst: 'pf',
  globalCompositeOperation: 'gco',
  backgroundColor: 'bgc',
  // selectionBackgroundColor: 'sbc',
  // // Circle
  radius: 'r',
  startAngle: 'sa',
  endAngle: 'ea',
  counterClockwise: 'ccw',
  // // Text / IText
  text: 'tx',
  fontFamily: 'ff',
  fontSize: 'fs',
  fontStyle: 'fst',
  fontWeight: 'fw',
  textAlign: 'ta',
  textBackgroundColor: 'tbc',
  lineHeight: 'lh',
  charSpacing: 'cs',
  direction: 'dir',
  path: 'p',
  pathStartOffset: 'pso',
  pathSide: 'psi',
  pathAlign: 'pal',
  underline: 'ul',
  overline: 'ov',
  linethrough: 'lt',
  minWidth: 'mw',
  splitByGrapheme: 'sbg',
  textDecorationThickness: 'tdt',
  styles: 'st',
  // // Path / Polygon
  points: 'pts',
  // // Group + canvas root
  objects: 'o',
  // subTargetCheck: 'stc',
  // interactive: 'ir',
  background: 'bg',
  // backgroundImage: 'bgi',
  // overlayColor: 'oc',
  // overlayImage: 'oi',
}

export const FABRIC_KEY_MAPPING: KeyMapping = createKeyMapping(FABRIC_KEY_MAP)

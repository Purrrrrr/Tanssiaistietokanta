export const FORMAT_VERSION = 1

const toUnmap = (map: Record<string, string>): Record<string, string> => {
  if (process.env.NODE_ENV === 'development') {
    const values = Object.values(map)
    const duplicates = values.filter((v, i) => values.indexOf(v) !== i)
    if (duplicates.length > 0) {
      throw new Error(`Duplicate values in lexical minification map: ${duplicates.join(', ')}`)
    }
  }
  return Object.fromEntries(
    Object.entries(map).map(([k, v]) => [v, k]),
  )
}

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
export const KEY_UNMAP: Record<string, string> = toUnmap(KEY_MAP)

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
}
export const TYPE_UNMAP: Record<string, string> = toUnmap(TYPE_MAP)

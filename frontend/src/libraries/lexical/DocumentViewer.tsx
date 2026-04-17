/**
 * Lightweight read-only renderer for Lexical editor documents.
 *
 * Walks the serialized Lexical JSON state tree and renders React elements
/* runtime packages.
 */
// Type-only import — stripped at compile time, zero runtime cost
import QRCode_import from 'react-qr-code'
import type { SerializedEditorState as LexicalSerializedEditorState } from 'lexical'
import { expand, MinifiedEditorState } from './utils/minify'

const QRCode = (QRCode_import as unknown as { default: typeof QRCode_import }).default

// ---------------------------------------------------------------------------
// Serialized node types (mirrors @lexical types but defined locally so we
// don't import the Lexical runtime)
// ---------------------------------------------------------------------------

interface SerializedBaseNode {
  type: string
  version: number
}

interface SerializedElementNode extends SerializedBaseNode {
  children: SerializedNode[]
  direction: 'ltr' | 'rtl' | null
  format: number | string
  indent: number
}

export interface SerializedEditorState {
  root: SerializedElementNode & { type: 'root' }
}

interface SerializedTextNode extends SerializedBaseNode {
  type: 'text'
  text: string
  /** Bit flags: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code, 32=subscript, 64=superscript */
  format: number
  detail: number
  mode: string
  style: string
}

interface SerializedParagraphNode extends SerializedElementNode {
  type: 'paragraph'
  textFormat: number
}

interface SerializedHeadingNode extends SerializedElementNode {
  type: 'heading'
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

interface SerializedQuoteNode extends SerializedElementNode {
  type: 'quote'
}

interface SerializedLinkNode extends SerializedElementNode {
  type: 'autolink' | 'link'
  url: string
  target?: string | null
  rel?: string | null
  title?: string | null
}

interface SerializedListNode extends SerializedElementNode {
  type: 'list'
  listType: 'bullet' | 'number' | 'check'
  start: number
  tag: 'ul' | 'ol'
}

interface SerializedListItemNode extends SerializedElementNode {
  type: 'listitem' | 'checklist-item'
  checked?: boolean
  value: number
}

interface SerializedTableNode extends SerializedElementNode {
  type: 'table'
}

interface SerializedTableRowNode extends SerializedElementNode {
  type: 'tablerow'
}

interface SerializedTableCellNode extends SerializedElementNode {
  type: 'tablecell'
  headerState: number
  colSpan?: number
  rowSpan?: number
  width?: number | null
}

interface SerializedImageNode extends SerializedBaseNode {
  type: 'image'
  src: string
  altText: string
  width?: number
}

interface SerializedLayoutContainerNode extends SerializedElementNode {
  type: 'layout-container'
  templateColumns: string
}

interface SerializedLayoutItemNode extends SerializedElementNode {
  type: 'layout-item'
}

interface SerializedQRCodeNode extends SerializedBaseNode {
  type: 'qr-code'
  value: string
}

type SerializedNode =
  | SerializedTextNode
  | SerializedParagraphNode
  | SerializedHeadingNode
  | SerializedQuoteNode
  | SerializedLinkNode
  | SerializedListNode
  | SerializedListItemNode
  | SerializedTableNode
  | SerializedTableRowNode
  | SerializedTableCellNode
  | SerializedImageNode
  | SerializedLayoutContainerNode
  | SerializedLayoutItemNode
  | SerializedQRCodeNode
  | (SerializedElementNode & { type: string })
  | (SerializedBaseNode & { type: string })

// ---------------------------------------------------------------------------
// Theme classes — must match the Editor config in index.tsx
// ---------------------------------------------------------------------------

const theme = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    strikethrough: 'line-through',
    underline: 'underline',
    underlineStrikethrough: '[text-decoration:underline_line-through]',
    code: 'font-mono',
    subscript: 'align-sub',
    superscript: 'align-super',
  },
  list: {
    listitemChecked: 'checked',
    listitemUnchecked: 'unchecked',
  },
  layoutContainer: 'grid',
  layoutItem: 'p-2 border-1 border-gray-200 rounded-md',
}

// ---------------------------------------------------------------------------
// Text format bit flags
// ---------------------------------------------------------------------------

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_STRIKETHROUGH = 4
const FORMAT_UNDERLINE = 8
const FORMAT_CODE = 16
const FORMAT_SUBSCRIPT = 32
const FORMAT_SUPERSCRIPT = 64

/** Returns a style object with textAlign when the element has a non-default alignment. */
function alignStyle(format: number | string): React.CSSProperties | undefined {
  if (!format || format === 'left' || format === 'start') return undefined
  return { textAlign: format as React.CSSProperties['textAlign'] }
}

// ---------------------------------------------------------------------------
// Node renderer
// ---------------------------------------------------------------------------

function renderNode(node: SerializedNode, index: number): React.ReactNode {
  switch (node.type) {
    case 'text':
      return renderText(node as SerializedTextNode, index)

    case 'paragraph': {
      const para = node as SerializedElementNode
      return (
        <p key={index} style={alignStyle(para.format)}>
          {renderChildren(para)}
        </p>
      )
    }

    case 'heading': {
      const heading = node as SerializedHeadingNode
      const Tag = heading.tag
      return <Tag key={index} style={alignStyle(heading.format)}>{renderChildren(heading)}</Tag>
    }

    case 'quote':
      return (
        <blockquote key={index} style={alignStyle((node as SerializedElementNode).format)}>
          {renderChildren(node as SerializedElementNode)}
        </blockquote>
      )

    case 'link':
    case 'autolink': {
      const link = node as SerializedLinkNode
      return (
        <a
          key={index}
          href={link.url}
          target={link.target ?? undefined}
          rel={link.rel ?? undefined}
          title={link.title ?? undefined}
        >
          {renderChildren(link)}
        </a>
      )
    }

    case 'list': {
      const list = node as SerializedListNode
      const Tag = list.listType === 'number' ? 'ol' : 'ul'
      return (
        <Tag key={index} style={alignStyle(list.format)} start={list.listType === 'number' ? list.start : undefined}>
          {renderChildren(list)}
        </Tag>
      )
    }

    case 'listitem':
    case 'checklist-item': {
      const item = node as SerializedListItemNode
      const isCheckItem = item.checked !== undefined
      const checkClass = isCheckItem
        ? (item.checked ? theme.list.listitemChecked : theme.list.listitemUnchecked)
        : undefined
      return (
        <li key={index} className={checkClass} style={alignStyle(item.format)} value={item.value}>
          {isCheckItem && (
            <input type="checkbox" checked={item.checked} readOnly tabIndex={-1} />
          )}
          {renderChildren(item)}
        </li>
      )
    }

    case 'table':
      return (
        <table key={index}>
          <tbody>{renderChildren(node as SerializedElementNode)}</tbody>
        </table>
      )

    case 'tablerow':
      return (
        <tr key={index}>
          {renderChildren(node as SerializedElementNode)}
        </tr>
      )

    case 'tablecell': {
      const cell = node as SerializedTableCellNode
      const Tag = cell.headerState ? 'th' : 'td'
      return (
        <Tag
          key={index}
          colSpan={cell.colSpan}
          rowSpan={cell.rowSpan}
          style={cell.width != null ? { width: cell.width } : undefined}
        >
          {renderChildren(cell)}
        </Tag>
      )
    }

    case 'image': {
      const img = node as SerializedImageNode
      return (
        <img
          key={index}
          src={img.src}
          alt={img.altText}
          width={img.width}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      )
    }

    case 'layout-container': {
      const layout = node as SerializedLayoutContainerNode
      return (
        <div
          key={index}
          className={theme.layoutContainer}
          style={{ gridTemplateColumns: layout.templateColumns }}
        >
          {renderChildren(layout)}
        </div>
      )
    }

    case 'layout-item':
      return (
        <div key={index} className={theme.layoutItem}>
          {renderChildren(node as SerializedElementNode)}
        </div>
      )

    case 'qr-code': {
      const qr = node as SerializedQRCodeNode
      return <QRCode key={index} value={qr.value || ' '} size={128} />
    }

    default:
      // Attempt to render children for unknown element nodes
      if ('children' in node) {
        return (
          <span key={index}>
            {renderChildren(node as SerializedElementNode)}
          </span>
        )
      }
      return null
  }
}

function renderChildren(node: SerializedElementNode): React.ReactNode {
  return node.children?.map((child, i) => renderNode(child as SerializedNode, i))
}

function renderText(node: SerializedTextNode, index: number): React.ReactNode {
  const { text, format } = node
  if (!text) return null

  const bold = !!(format & FORMAT_BOLD)
  const italic = !!(format & FORMAT_ITALIC)
  const strikethrough = !!(format & FORMAT_STRIKETHROUGH)
  const underline = !!(format & FORMAT_UNDERLINE)
  const code = !!(format & FORMAT_CODE)
  const subscript = !!(format & FORMAT_SUBSCRIPT)
  const superscript = !!(format & FORMAT_SUPERSCRIPT)

  if (code) {
    return <code key={index} className={theme.text.code}>{text}</code>
  }

  const underlineAndStrike = underline && strikethrough
  const classes = [
    bold && theme.text.bold,
    italic && theme.text.italic,
    underlineAndStrike && theme.text.underlineStrikethrough,
    !underlineAndStrike && strikethrough && theme.text.strikethrough,
    !underlineAndStrike && underline && theme.text.underline,
    subscript && theme.text.subscript,
    superscript && theme.text.superscript,
  ].filter(Boolean).join(' ')

  let content: React.ReactNode = text
  if (subscript) content = <sub>{content}</sub>
  if (superscript) content = <sup>{content}</sup>

  if (!classes && !subscript && !superscript) return text

  return (
    <span key={index} className={classes || undefined}>
      {content}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export interface DocumentViewerProps {
  document: MinifiedEditorState | null | undefined
  className?: string
}

export function DocumentViewer({ document: minified, className }: DocumentViewerProps) {
  const document = minified ? expand(minified) : null
  if (!document?.root) return null
  const root = document.root as unknown as SerializedElementNode

  return (
    <div className={['markdown-content', className].filter(Boolean).join(' ')}>
      {renderChildren(root)}
    </div>
  )
}

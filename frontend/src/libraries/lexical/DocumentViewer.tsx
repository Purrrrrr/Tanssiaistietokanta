/**
 * Lightweight read-only renderer for Lexical editor documents.
 *
 * Walks the serialized Lexical JSON state tree and renders React elements
/* runtime packages.
 */
import type { SerializedAutoLinkNode, SerializedLinkNode } from '@lexical/link'
import type { SerializedListItemNode, SerializedListNode } from '@lexical/list'
import type { SerializedHeadingNode, SerializedQuoteNode } from '@lexical/rich-text'
import type { SerializedTableCellNode, SerializedTableNode, SerializedTableRowNode } from '@lexical/table'
import classNames from 'classnames'
import type { SerializedElementNode, SerializedParagraphNode, SerializedTextNode } from 'lexical'

import { QRCode } from './plugins/components/QRCode'
import type { SerializedImageNode } from './plugins/nodes/ImageNode'
import type { SerializedLayoutContainerNode } from './plugins/nodes/LayoutContainerNode'
import type { SerializedLayoutItemNode } from './plugins/nodes/LayoutItemNode'
import type { SerializedQRCodeNode } from './plugins/nodes/QRCodeNode'
import { theme } from './theme'
import { expand, MinifiedDocumentContent } from './utils/minify'

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export interface DocumentViewerProps extends ViewOptions {
  document: MinifiedDocumentContent | null | undefined
  className?: string
}

export function DocumentViewer({ document: minified, className, skipHeadingLevels }: DocumentViewerProps) {
  const document = minified ? expand(minified) : null
  if (!document?.root) return null
  const root = document.root as unknown as SerializedElementNode

  return (
    <div className={classNames('lexical-content read-only', className ?? ' p-4 bg-white')}>
      {renderChildren(root, { skipHeadingLevels })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Serialized node types (mirrors @lexical types but defined locally so we
// don't import the Lexical runtime)
// ---------------------------------------------------------------------------

interface SerializedBaseNode {
  type: string
  version: number
}

type SerializedNode =
  | SerializedTextNode
  | SerializedParagraphNode
  | SerializedHeadingNode
  | SerializedQuoteNode
  | SerializedLinkNode
  | SerializedAutoLinkNode
  | SerializedListNode
  | SerializedListItemNode
  | SerializedTableNode
  | SerializedTableRowNode
  | SerializedTableCellNode
  | SerializedImageNode
  | SerializedLayoutContainerNode
  | SerializedLayoutItemNode
  | SerializedQRCodeNode
  | SerializedBaseNode
  | (SerializedElementNode & { type: string })

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

const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'] as const

/** Returns a style object with textAlign when the element has a non-default alignment. */
function alignStyle(format: number | string): React.CSSProperties | undefined {
  if (!format || format === 'left' || format === 'start') return undefined
  return { textAlign: format as React.CSSProperties['textAlign'] }
}

// ---------------------------------------------------------------------------
// Node renderer
// ---------------------------------------------------------------------------

function renderNode(node: SerializedNode, index: number, options: ViewOptions): React.ReactNode {
  switch (node.type) {
    case 'text':
      return renderText(node as SerializedTextNode, index, options)

    case 'paragraph': {
      const para = node as SerializedElementNode
      return (
        <p key={index} style={alignStyle(para.format)}>
          {renderChildren(para, options)}
        </p>
      )
    }

    case 'heading': {
      const heading = node as SerializedHeadingNode
      const headingLevel = parseInt(heading.tag.slice(1), 10) + (options.skipHeadingLevels ?? 0) - 1
      const Tag = headingTags[Math.min(6, headingLevel)]
      return <Tag key={index} style={alignStyle(heading.format)}>{renderChildren(heading, options)}</Tag>
    }

    case 'quote':
      return (
        <blockquote key={index} style={alignStyle((node as SerializedElementNode).format)}>
          {renderChildren(node as SerializedElementNode, options)}
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
          {renderChildren(link, options)}
        </a>
      )
    }

    case 'list': {
      const list = node as SerializedListNode
      const Tag = list.listType === 'number' ? 'ol' : 'ul'
      return (
        <Tag key={index} style={alignStyle(list.format)} start={list.listType === 'number' ? list.start : undefined}>
          {renderChildren(list, options)}
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
          {renderChildren(item, options)}
        </li>
      )
    }

    case 'table':
      return (
        <table key={index}>
          <tbody>{renderChildren(node as SerializedElementNode, options)}</tbody>
        </table>
      )

    case 'tablerow':
      return (
        <tr key={index}>
          {renderChildren(node as SerializedElementNode, options)}
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
          {renderChildren(cell, options)}
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
          {renderChildren(layout, options)}
        </div>
      )
    }

    case 'layout-item':
      return (
        <div key={index} className={theme.layoutItem}>
          {renderChildren(node as SerializedElementNode, options)}
        </div>
      )

    case 'qr-code': {
      const { value, title, size } = node as SerializedQRCodeNode
      return <QRCode key={index} value={value || ' '} title={title} size={size ?? 128} />
    }

    case 'linebreak':
      return <br />

    default:
      console.log(node.type)
      // Attempt to render children for unknown element nodes
      if ('children' in node) {
        return (
          <span key={index}>
            {renderChildren(node as SerializedElementNode, options)}
          </span>
        )
      }
      return null
  }
}

interface ViewOptions {
  skipHeadingLevels?: 0 | 1 | 2 | 3 | 4 | 5
}

function renderChildren(node: SerializedElementNode, options: ViewOptions): React.ReactNode {
  return node.children?.map((child, i) => renderNode(child as SerializedNode, i, options))
}

function renderText(node: SerializedTextNode, index: number, _options: ViewOptions): React.ReactNode {
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

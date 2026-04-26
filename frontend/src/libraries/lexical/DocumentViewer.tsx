/**
 * Lightweight read-only renderer for Lexical editor documents.
 *
 * Walks the serialized Lexical JSON state tree and renders React elements
 */
import type { SerializedAutoLinkNode, SerializedLinkNode } from '@lexical/link'
import type { SerializedListItemNode, SerializedListNode } from '@lexical/list'
import type { SerializedHeadingNode, SerializedQuoteNode } from '@lexical/rich-text'
import type { SerializedTableCellNode, SerializedTableNode, SerializedTableRowNode } from '@lexical/table'
import classNames from 'classnames'
import type { SerializedElementNode, SerializedParagraphNode, SerializedTextNode } from 'lexical'

import { useEditorTranslation } from './i18n'
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
  id?: string
  document: MinifiedDocumentContent | null | undefined
  className?: string
  placeholder?: React.ReactNode
}

export function DocumentViewer({ id, document: minified, className, placeholder, ...viewOptions }: DocumentViewerProps) {
  const document = minified ? expand(minified) : null
  const root = document?.root as unknown as SerializedElementNode ?? { type: 'root', children: [] }
  const { content, hasContent } = renderChildren(root, viewOptions)

  if (!hasContent && viewOptions.skipRenderOnEmpty) return null

  return (
    <div id={id} className={classNames('lexical-content', className ?? ' p-4 bg-white')}>
      {hasContent ? content : (placeholder ?? <Placeholder />)}
    </div>
  )
}

function Placeholder() {
  return (
    <div className="text-center text-gray-500">
      <p>{useEditorTranslation('emptyDocument')}</p>
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

interface ViewOptions {
  skipHeadingLevels?: 0 | 1 | 2 | 3 | 4 | 5
  skipRenderOnEmpty?: boolean
  customRenderers?: {
    link: NodeRenderer<SerializedLinkNode | SerializedAutoLinkNode>
  }
}

export type LinkNode = SerializedLinkNode | SerializedAutoLinkNode
export type NodeRenderer<NodeType> = (props: NodeRendererProps<NodeType>) => React.ReactNode
export interface NodeRendererProps<NodeType> { node: NodeType, children: React.ReactNode }

interface RenderResult {
  content: React.ReactNode
  hasContent: boolean
}

const content = (content: React.ReactNode): RenderResult => ({ content, hasContent: content !== null })
const empty = { content: null, hasContent: false }

function renderNode(node: SerializedNode, index: number, options: ViewOptions): RenderResult {
  switch (node.type) {
    case 'text': {
      const text = renderText(node as SerializedTextNode, index, options)
      return { content: text, hasContent: text != null }
    }
    case 'image': {
      const img = node as SerializedImageNode
      return content(
        <img
          key={index}
          src={img.src}
          alt={img.altText}
          width={img.width}
          style={{ maxWidth: '100%', height: 'auto' }}
        />,
      )
    }
    case 'qr-code': {
      const { value, title, size } = node as SerializedQRCodeNode
      return content(<QRCode key={index} value={value || ' '} title={title} size={size ?? 128} />)
    }

    case 'linebreak':
      return content(<br key={index} />)
  }

  const { content: children, hasContent } = renderChildren(node as SerializedElementNode, options)
  if (!hasContent) return empty

  switch (node.type) {
    case 'paragraph': {
      const para = node as SerializedElementNode
      return content(
        <p key={index} style={alignStyle(para.format)}>
          {children}
        </p>,
      )
    }

    case 'heading': {
      const heading = node as SerializedHeadingNode
      const headingLevel = parseInt(heading.tag.slice(1), 10) + (options.skipHeadingLevels ?? 0) - 1
      const Tag = headingTags[Math.min(6, headingLevel)]
      return content(<Tag key={index} style={alignStyle(heading.format)}>{children}</Tag>)
    }

    case 'quote':
      return content(
        <blockquote key={index} style={alignStyle((node as SerializedElementNode).format)}>
          {children}
        </blockquote>,
      )

    case 'link':
    case 'autolink': {
      const link = node as SerializedLinkNode
      if (options.customRenderers?.link) {
        return content(options.customRenderers.link({ node: link, children }))
      }
      return content(
        <a
          key={index}
          href={link.url}
          target={link.target ?? undefined}
          rel={link.rel ?? undefined}
          title={link.title ?? undefined}
        >
          {children}
        </a>,
      )
    }

    case 'list': {
      const list = node as SerializedListNode
      const Tag = list.listType === 'number' ? 'ol' : 'ul'
      return content(
        <Tag key={index} style={alignStyle(list.format)} start={list.listType === 'number' ? list.start : undefined}>
          {children}
        </Tag>,
      )
    }

    case 'listitem':
    case 'checklist-item': {
      const item = node as SerializedListItemNode
      const isCheckItem = item.checked !== undefined
      const checkClass = isCheckItem
        ? (item.checked ? theme.list.listitemChecked : theme.list.listitemUnchecked)
        : undefined
      return content(
        <li key={index} className={checkClass} style={alignStyle(item.format)} value={item.value}>
          {isCheckItem && (
            <input type="checkbox" checked={item.checked} readOnly tabIndex={-1} />
          )}
          {children}
        </li>,
      )
    }

    case 'table':
      return content(
        <table key={index}>
          <tbody>{children}</tbody>
        </table>,
      )

    case 'tablerow':
      return content(
        <tr key={index}>
          {children}
        </tr>,
      )

    case 'tablecell': {
      const cell = node as SerializedTableCellNode
      const Tag = cell.headerState ? 'th' : 'td'
      return content(
        <Tag
          key={index}
          colSpan={cell.colSpan}
          rowSpan={cell.rowSpan}
          style={cell.width != null ? { width: cell.width } : undefined}
        >
          {children}
        </Tag>,
      )
    }

    case 'layout-container': {
      const layout = node as SerializedLayoutContainerNode
      return content(
        <div
          key={index}
          className={theme.layoutContainer}
          style={{ gridTemplateColumns: layout.templateColumns }}
        >
          {children}
        </div>,
      )
    }

    case 'layout-item':
      return content(
        <div key={index} className={theme.layoutItem}>
          {children}
        </div>,
      )

    default:
      console.log(node.type)
      // Attempt to render children for unknown element nodes
      return content(
        <span key={index}>
          {children}
        </span>,
      )
  }
}

function renderChildren(node: SerializedElementNode, options: ViewOptions): RenderResult {
  const children = node.children?.map((child, i) => renderNode(child as SerializedNode, i, options))

  return {
    content: children.map(c => c.content),
    hasContent: children.some(c => c.hasContent),
  }
}

function renderText(node: SerializedTextNode, index: number, _options: ViewOptions): React.ReactNode {
  const { text, format } = node
  if (!text || text === '') null

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

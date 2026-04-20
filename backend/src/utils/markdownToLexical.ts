import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import type { Root, Content, BlockContent, PhrasingContent, ListItem, TableRow, TableCell } from 'mdast'

import randomIdWithLength from '../utils/random-id'

// ── Main converter ────────────────────────────────────────────────────────────

const processor = unified().use(remarkParse).use(remarkGfm)

export function convertMarkdownToLexical(markdown: string): object {
  if (!markdown?.trim()) {
    return { V: 1, t: 'ro', c: [paragraphNode([])] }
  }

  const tree = processor.parse(markdown) as Root
  const children: MinifiedNode[] = []

  for (const node of tree.children) {
    children.push(...convertBlock(node as BlockContent))
  }

  if (children.length === 0) {
    children.push(paragraphNode([]))
  }

  return { V: 1, t: 'ro', c: children, d: 'ltr' }
}

// ── Block content converter ───────────────────────────────────────────────────

function convertBlock(node: Content): MinifiedNode[] {
  switch (node.type) {
    case 'paragraph':
      return inlineToBlocks(node.children)

    case 'heading': {
      const tag = `h${Math.min(node.depth, 3)}`
      const children = convertInline(node.children)
      return [{ _id: randomId(), t: 'h', g: tag, c: children, d: 'ltr' }]
    }

    case 'list': {
      const listType = node.ordered ? 'number' : 'bullet'
      const startAt = node.ordered ? (node.start ?? 1) : 1
      const items = node.children.map((item, index) =>
        convertListItem(item, startAt + index),
      )
      const listNode: MinifiedNode = { _id: randomId(), t: 'l', lt: listType, c: items, d: 'ltr' }
      if (node.ordered && node.start != null && node.start !== 1) {
        listNode.st = node.start
      }
      return [listNode]
    }

    case 'blockquote': {
      const blocks: MinifiedNode[] = []
      for (const child of node.children) {
        blocks.push(...convertBlock(child))
      }
      return blocks
    }

    case 'code':
      return [paragraphNode(textNodes(node.value, FORMAT_CODE))]

    case 'html': {
      const match = node.value.match(QR_VALUE_REGEX)
      if (match) return [qrNode(match[1])]
      // Strip tags from other raw HTML and fall back to plain text
      const text = node.value.replace(/<[^>]+>/g, '').trim()
      return text ? [paragraphNode(textNodes(text, 0))] : []
    }

    case 'table': {
      const rows = node.children.map((row, i) => convertTableRow(row, i === 0))
      return [{ _id: randomId(), t: 'ta', c: rows }]
    }

    case 'thematicBreak':
      return [paragraphNode([])]

    default:
      return []
  }
}

function convertListItem(item: ListItem, value: number): MinifiedNode {
  const children: MinifiedNode[] = []
  for (const child of item.children) {
    if (child.type === 'paragraph') {
      // Simple list item: inline children directly (no wrapping paragraph)
      children.push(...convertInline(child.children))
    } else {
      // Nested list or other block content
      children.push(...convertBlock(child))
    }
  }
  const node: MinifiedNode = { _id: randomId(), t: 'li', va: value, c: children }
  if (children.length > 0) node.d = 'ltr'
  return node
}

function convertTableRow(row: TableRow, isHeader: boolean): MinifiedNode {
  const cells = row.children.map(cell => convertTableCell(cell, isHeader))
  return { _id: randomId(), t: 'tr', c: cells }
}

function convertTableCell(cell: TableCell, isHeader: boolean): MinifiedNode {
  const children = convertInline(cell.children)
  const node: MinifiedNode = {
    _id: randomId(),
    t: 'tc',
    hs: isHeader ? 1 : 0,
    cs: 1,
    c: children,
  }
  if (children.length > 0) node.d = 'ltr'
  return node
}

// ── Inline (phrasing) content converter ──────────────────────────────────────

function convertInline(nodes: PhrasingContent[], format = 0): MinifiedNode[] {
  const result: MinifiedNode[] = []
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        result.push(...textNodes(node.value, format))
        break
      case 'strong':
        result.push(...convertInline(node.children, format | FORMAT_BOLD))
        break
      case 'emphasis':
        result.push(...convertInline(node.children, format | FORMAT_ITALIC))
        break
      case 'delete':
        result.push(...convertInline(node.children, format | FORMAT_STRIKETHROUGH))
        break
      case 'inlineCode':
        result.push(...textNodes(node.value, format | FORMAT_CODE))
        break
      case 'link': {
        const children = convertInline(node.children, format)
        result.push({ _id: randomId(), t: 'lk', u: node.url, c: children })
        break
      }
      case 'image':
        // Images: fall back to alt text
        if (node.alt) result.push(...textNodes(node.alt, format))
        break
      case 'html': {
        // Inline HTML: handle only QR tags
        const match = node.value.match(QR_VALUE_REGEX)
        if (match) result.push(qrNode(match[1]))
        break
      }
      case 'break':
        result.push({ _id: randomId(), t: 'lb', v: 1 })
        break
    }
  }
  return result
}

/**
 * Convert inline phrasing content, then hoist any non-inline QR code nodes
 * out of the paragraph and return them as separate top-level block items.
 */
function inlineToBlocks(nodes: PhrasingContent[]): MinifiedNode[] {
  const inlineNodes = convertInline(nodes)
  const blocks: MinifiedNode[] = []
  let pendingText: MinifiedNode[] = []

  for (const child of inlineNodes) {
    if (child.t === 'qr') {
      if (pendingText.length > 0) {
        blocks.push(paragraphNode(pendingText))
        pendingText = []
      }
      blocks.push(child)
    } else {
      pendingText.push(child)
    }
  }

  // Always emit at least one paragraph (even empty), or flush remaining text
  blocks.push(paragraphNode(pendingText))
  return blocks
}

// ── Node constructors ─────────────────────────────────────────────────────────

/** Split a text value on hard newlines, interleaving linebreak nodes. */
function textNodes(value: string, format: number): MinifiedNode[] {
  const parts = value.split('\n')
  const result: MinifiedNode[] = []
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) {
      const node: MinifiedNode = { _id: randomId(), t: 'tx', x: parts[i] }
      if (format !== 0) node.f = format
      result.push(node)
    }
    if (i < parts.length - 1) {
      result.push({ _id: randomId(), t: 'lb', v: 1 })
    }
  }
  return result
}

function qrNode(value: string): MinifiedNode {
  return { _id: randomId(), t: 'qr', va: value, v: 1 }
}

function paragraphNode(children: MinifiedNode[]): MinifiedNode {
  const node: MinifiedNode = { _id: randomId(), t: 'p', c: children }
  if (children.length > 0) node.d = 'ltr'
  return node
}
// ── Helpers ──────────────────────────────────────────────────────────────────

const QR_VALUE_REGEX = /<QR\s[^>]*\bvalue="([^"]*)"[^>]*\/>/i

const randomId = () => randomIdWithLength(8)

type MinifiedNode = Record<string, unknown>

// Lexical text format flags (bitfield)
const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_STRIKETHROUGH = 8
const FORMAT_CODE = 16

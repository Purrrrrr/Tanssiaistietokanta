import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useCallback, useEffect } from 'react'
import { mergeRegister } from '@lexical/utils'
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import {
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical'

import { QRCode } from '../components/QRCode'

export type SerializedQRCodeNode = Spread<QRCodePayload, SerializedLexicalNode>

export interface QRCodePayload {
  value: string
  title: string
  size: number
}

function $convertQRCodeElement(domNode: HTMLElement): DOMConversionOutput | null {
  const value = domNode.getAttribute('data-qr-value')
  const size = parseInt(domNode.getAttribute('data-qr-size') ?? '0', 10)
  const title = domNode.innerText || ''
  if (value !== null) {
    return { node: $createQRCodeNode(value, title, size) }
  }
  return null
}

export class QRCodeNode extends DecoratorNode<React.ReactNode> {
  __value: string
  __title: string
  __size: number

  constructor(value: string, title: string, size: number, key?: NodeKey) {
    super(key)
    this.__value = value
    this.__title = title
    this.__size = size > 0 ? size : 128
  }

  static getType(): string {
    return 'qr-code'
  }

  static clone(node: QRCodeNode): QRCodeNode {
    return new QRCodeNode(node.__value, node.__title, node.__size, node.__key)
  }

  static importJSON(json: SerializedQRCodeNode): QRCodeNode {
    return $createQRCodeNode(json.value, json.title ?? '', json.size ?? 128)
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-qr-value')) return null
        return { conversion: $convertQRCodeElement, priority: 2 }
      },
    }
  }

  exportJSON(): SerializedQRCodeNode {
    return {
      ...super.exportJSON(),
      value: this.__value,
      title: this.__title,
      size: this.__size,
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span')
    element.setAttribute('data-qr-value', this.__value)
    element.setAttribute('data-qr-size', this.__size.toString())
    element.innerText = this.__title
    return { element }
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span')
    span.style.display = 'inline-block'
    return span
  }

  updateDOM(): boolean {
    return false
  }

  getValue(): string {
    return this.getLatest().__value
  }

  setValue(value: string): this {
    const self = this.getWritable()
    self.__value = value
    return self
  }

  getTitle(): string {
    return this.getLatest().__title
  }

  setTitle(title: string): this {
    const self = this.getWritable()
    self.__title = title
    return self
  }

  getSize(): number {
    return this.getLatest().__size
  }

  setSize(size: number): this {
    const self = this.getWritable()
    self.__size = size > 0 ? size : 128
    return self
  }

  isInline(): boolean {
    return false
  }

  decorate(): React.ReactNode {
    return <QRCodeComponent
      nodeKey={this.__key}
      value={this.__value}
      title={this.__title}
      size={this.__size}
    />
  }
}

function QRCodeComponent({ nodeKey, value, title, size }: { nodeKey: NodeKey, value: string, title: string, size: number }) {
  const [editor] = useLexicalComposerContext()
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)

  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected) {
        event.preventDefault()
        editor.update(() => {
          const node = $getNodeByKey(nodeKey)
          node?.remove()
        })
      }
      return false
    },
    [editor, isSelected, nodeKey],
  )

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (event) => {
          const target = event.target as HTMLElement
          if (target.closest(`[data-qr-node-key="${nodeKey}"]`)) {
            clearSelection()
            setSelected(true)
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
    )
  }, [editor, nodeKey, clearSelection, setSelected, onDelete])

  return <QRCode value={value} title={title} size={size} nodeKey={nodeKey} selected={isSelected} />
}

export function $createQRCodeNode(value: string, title: string, size: number = 128): QRCodeNode {
  return new QRCodeNode(value, title, size)
}

export function $isQRCodeNode(node: LexicalNode | null | undefined): node is QRCodeNode {
  return node instanceof QRCodeNode
}

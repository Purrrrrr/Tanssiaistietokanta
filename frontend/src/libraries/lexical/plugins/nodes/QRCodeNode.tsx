import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useCallback, useEffect } from 'react'
import QRCode_import from 'react-qr-code'
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

const QRCode = (QRCode_import as unknown as { default: typeof QRCode_import }).default

export type SerializedQRCodeNode = Spread<
  { value: string },
  SerializedLexicalNode
>

function $convertQRCodeElement(domNode: HTMLElement): DOMConversionOutput | null {
  const value = domNode.getAttribute('data-qr-value')
  if (value !== null) {
    return { node: $createQRCodeNode(value) }
  }
  return null
}

export class QRCodeNode extends DecoratorNode<React.ReactNode> {
  __value: string

  constructor(value: string, key?: NodeKey) {
    super(key)
    this.__value = value
  }

  static getType(): string {
    return 'qr-code'
  }

  static clone(node: QRCodeNode): QRCodeNode {
    return new QRCodeNode(node.__value, node.__key)
  }

  static importJSON(json: SerializedQRCodeNode): QRCodeNode {
    return $createQRCodeNode(json.value)
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
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span')
    element.setAttribute('data-qr-value', this.__value)
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

  isInline(): boolean {
    return false
  }

  decorate(): React.ReactNode {
    return <QRCodeComponent nodeKey={this.__key} value={this.__value} />
  }
}

function QRCodeComponent({ nodeKey, value }: { nodeKey: NodeKey, value: string }) {
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

  return (
    <span
      className="inline-block my-2"
      data-qr-node-key={nodeKey}
    >
      <QRCode value={value || ' '} size={128} />
    </span>
  )
}

export function $createQRCodeNode(value: string): QRCodeNode {
  return new QRCodeNode(value)
}

export function $isQRCodeNode(node: LexicalNode | null | undefined): node is QRCodeNode {
  return node instanceof QRCodeNode
}

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // Keep editValue in sync when node value changes externally
  useEffect(() => {
    setEditValue(value)
  }, [value])

  // Deselect on outside click
  useEffect(() => {
    if (!isSelected) setIsEditing(false)
  }, [isSelected])

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  function openEdit() {
    setIsEditing(true)
  }

  function applyEdit() {
    const trimmed = editValue.trim()
    if (!trimmed) return
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isQRCodeNode(node)) node.setValue(trimmed)
    })
    setIsEditing(false)
  }

  function removeNode() {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      node?.remove()
    })
  }

  return (
    <span
      className={`inline-block my-2 ${isSelected ? 'outline-2 outline-blue-500' : ''}`}
      data-qr-node-key={nodeKey}
    >
      <QRCode value={value || ' '} size={128} />
      {isSelected && !isEditing && (
        <span className="flex gap-1 mt-1">
          <button
            className="px-2 py-0.5 text-xs border-1 border-gray-400 rounded bg-white hover:bg-gray-50"
            onMouseDown={(e) => { e.preventDefault(); openEdit() }}
          >
            Edit
          </button>
          <button
            className="px-2 py-0.5 text-xs border-1 border-gray-400 rounded bg-white hover:bg-gray-50 text-red-600"
            onMouseDown={(e) => { e.preventDefault(); removeNode() }}
          >
            Remove
          </button>
        </span>
      )}
      {isEditing && (
        <span className="flex gap-1 mt-1 items-center">
          <input
            ref={inputRef}
            className="flex-1 px-2 py-0.5 text-xs border-1 border-gray-400 rounded"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyEdit()
              if (e.key === 'Escape') setIsEditing(false)
            }}
          />
          <button
            className="px-2 py-0.5 text-xs border-1 border-gray-400 rounded bg-white hover:bg-gray-50"
            onMouseDown={(e) => { e.preventDefault(); applyEdit() }}
          >
            OK
          </button>
          <button
            className="px-2 py-0.5 text-xs border-1 border-gray-400 rounded bg-white hover:bg-gray-50"
            onMouseDown={(e) => { e.preventDefault(); setIsEditing(false) }}
          >
            Cancel
          </button>
        </span>
      )}
    </span>
  )
}

export function $createQRCodeNode(value: string): QRCodeNode {
  return new QRCodeNode(value)
}

export function $isQRCodeNode(node: LexicalNode | null | undefined): node is QRCodeNode {
  return node instanceof QRCodeNode
}

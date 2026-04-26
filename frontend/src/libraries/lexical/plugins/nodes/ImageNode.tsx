import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useCallback, useEffect, useRef, useState } from 'react'
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

import { useEditorT } from 'libraries/lexical/i18n'

export type SerializedImageNode = Spread<
  { src: string, altText: string, width?: number },
  SerializedLexicalNode
>

function $convertImageElement(domNode: HTMLElement): DOMConversionOutput | null {
  const img = domNode as HTMLImageElement
  const src = img.getAttribute('src')
  if (!src) return null
  return {
    node: $createImageNode({
      src,
      altText: img.getAttribute('alt') ?? '',
      width: img.width || undefined,
    }),
  }
}

export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string
  __altText: string
  __width: number | undefined

  constructor(src: string, altText: string, width?: number, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__width = width
  }

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__width, node.__key)
  }

  static importJSON(json: SerializedImageNode): ImageNode {
    return $createImageNode({ src: json.src, altText: json.altText, width: json.width })
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (_domNode: HTMLElement) => ({
        conversion: $convertImageElement,
        priority: 0,
      }),
    }
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img')
    element.setAttribute('src', this.__src)
    element.setAttribute('alt', this.__altText)
    if (this.__width) element.setAttribute('width', String(this.__width))
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

  isInline(): boolean {
    return false
  }

  getSrc(): string {
    return this.getLatest().__src
  }

  getAltText(): string {
    return this.getLatest().__altText
  }

  getWidth(): number | undefined {
    return this.getLatest().__width
  }

  setSrc(src: string): this {
    const self = this.getWritable()
    self.__src = src
    return self
  }

  setAltText(altText: string): this {
    const self = this.getWritable()
    self.__altText = altText
    return self
  }

  setWidth(width: number | undefined): this {
    const self = this.getWritable()
    self.__width = width
    return self
  }

  decorate(): React.ReactNode {
    return (
      <ImageComponent
        nodeKey={this.__key}
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
      />
    )
  }
}

function ImageComponent({
  nodeKey,
  src,
  altText,
  width,
}: {
  nodeKey: NodeKey
  src: string
  altText: string
  width: number | undefined
}) {
  const t = useEditorT('image')
  const [editor] = useLexicalComposerContext()
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const [isEditing, setIsEditing] = useState(false)
  const [editAlt, setEditAlt] = useState(altText)
  const [editWidth, setEditWidth] = useState(width ? String(width) : '')
  const altInputRef = useRef<HTMLInputElement>(null)

  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected) {
        event.preventDefault()
        editor.update(() => {
          $getNodeByKey(nodeKey)?.remove()
        })
        return true
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
          if (target.closest(`[data-image-node-key="${nodeKey}"]`)) {
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

  // Keep edit values in sync with node changes
  useEffect(() => { setEditAlt(altText) }, [altText])
  useEffect(() => { setEditWidth(width ? String(width) : '') }, [width])

  // Close edit mode when deselected
  useEffect(() => {
    if (!isSelected) setIsEditing(false)
  }, [isSelected])

  useEffect(() => {
    if (isEditing) altInputRef.current?.focus()
  }, [isEditing])

  function applyEdit() {
    const parsedWidth = editWidth ? parseInt(editWidth, 10) : undefined
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isImageNode(node)) {
        node.setAltText(editAlt)
        node.setWidth(parsedWidth && parsedWidth > 0 ? parsedWidth : undefined)
      }
    })
    setIsEditing(false)
  }

  function removeNode() {
    editor.update(() => { $getNodeByKey(nodeKey)?.remove() })
  }

  return (
    <span
      className={`inline-block my-2 ${isSelected ? 'outline outline-2 outline-blue-500' : ''}`}
      data-image-node-key={nodeKey}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <img
        src={src}
        alt={altText}
        width={width}
        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
        draggable={false}
        onKeyDown={() => { /* handled by lexical commands */ }}
      />
      {isSelected && !isEditing && (
        <span className="flex gap-1 mt-1">
          <button
            className="py-0.5 px-2 text-xs bg-white rounded border-gray-400 hover:bg-gray-50 border-1"
            onMouseDown={(e) => { e.preventDefault(); setIsEditing(true) }}
          >
            {t('edit')}
          </button>
          <button
            className="py-0.5 px-2 text-xs text-red-600 bg-white rounded border-gray-400 hover:bg-gray-50 border-1"
            onMouseDown={(e) => { e.preventDefault(); removeNode() }}
          >
            {t('remove')}
          </button>
        </span>
      )}
      {isEditing && (
        <span className="flex flex-wrap gap-1 items-center mt-1">
          <label className="text-xs text-gray-600" htmlFor={`img-alt-${nodeKey}`}>{t('altText')}</label>
          <input
            id={`img-alt-${nodeKey}`}
            ref={altInputRef}
            className="flex-1 py-0.5 px-2 text-xs rounded border-gray-400 min-w-20 border-1"
            value={editAlt}
            onChange={(e) => setEditAlt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applyEdit(); if (e.key === 'Escape') setIsEditing(false) }}
          />
          <label className="text-xs text-gray-600" htmlFor={`img-width-${nodeKey}`}>{t('width')}</label>
          <input
            id={`img-width-${nodeKey}`}
            className="py-0.5 px-2 w-16 text-xs rounded border-gray-400 border-1"
            type="number"
            min="1"
            placeholder="auto"
            value={editWidth}
            onChange={(e) => setEditWidth(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applyEdit(); if (e.key === 'Escape') setIsEditing(false) }}
          />
          <button
            className="py-0.5 px-2 text-xs bg-white rounded border-gray-400 hover:bg-gray-50 border-1"
            onMouseDown={(e) => { e.preventDefault(); applyEdit() }}
          >
            {t('ok')}
          </button>
          <button
            className="py-0.5 px-2 text-xs bg-white rounded border-gray-400 hover:bg-gray-50 border-1"
            onMouseDown={(e) => { e.preventDefault(); setIsEditing(false) }}
          >
            {t('cancel')}
          </button>
        </span>
      )}
    </span>
  )
}

export interface InsertImagePayload {
  src: string
  altText?: string
  width?: number
}

export function $createImageNode({ src, altText = '', width }: InsertImagePayload): ImageNode {
  return new ImageNode(src, altText, width)
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}

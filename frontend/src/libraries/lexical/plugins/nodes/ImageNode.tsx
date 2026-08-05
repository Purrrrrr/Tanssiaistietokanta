import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useCallback, useEffect } from 'react'
import { mergeRegister } from '@lexical/utils'
import classNames from 'classnames'
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

import { NodeAlignment } from './types'

import { alignClassname } from 'libraries/lexical/utils/alignClassname'

export type SerializedImageNode = Spread<
  {
    src: string
    altText: string
    width?: number
    align: NodeAlignment
  },
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
  __align: NodeAlignment
  __width: number | undefined

  constructor(src: string, altText: string, align?: NodeAlignment, width?: number, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__align = align ?? 'left'
    this.__width = width
  }

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__align, node.__width, node.__key)
  }

  static importJSON(json: SerializedImageNode): ImageNode {
    return $createImageNode({
      src: json.src,
      altText: json.altText,
      align: json.align,
      width: json.width,
    })
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
      align: this.__align,
      width: this.__width,
    }
  }

  exportDOM(): DOMExportOutput {
    const image = document.createElement('img')
    image.setAttribute('src', this.__src)
    image.setAttribute('alt', this.__altText)
    if (this.__width) image.setAttribute('width', String(this.__width))
    const element = document.createElement('div')
    element.appendChild(image)
    element.className = alignClassname(this.__align)
    return { element }
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div')
    div.className = alignClassname(this.__align)
    return div
  }

  updateDOM(_prevNode: this, dom: HTMLElement): boolean {
    dom.className = alignClassname(this.__align)
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

  getAlign(): NodeAlignment {
    return this.getLatest().__align
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

  setAlign(align: NodeAlignment): this {
    const self = this.getWritable()
    self.__align = align
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
        align={this.__align}
        width={this.__width}
      />
    )
  }
}

function ImageComponent({
  nodeKey,
  src,
  altText,
  align,
  width,
}: {
  nodeKey: NodeKey
  src: string
  altText: string
  align: NodeAlignment
  width: number | undefined
}) {
  const [editor] = useLexicalComposerContext()
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)

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

  return (
  /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
    <img
      className={classNames(
        'my-2',
        isSelected && 'outline-2 outline-blue-500',
      )}
      src={src}
      alt={altText}
      width={width}
      draggable={false}
      data-image-node-key={nodeKey}
      onKeyDown={() => { /* handled by lexical commands */ }}
    />
  )
}

export interface InsertImagePayload {
  src: string
  altText?: string
  align?: NodeAlignment
  width?: number
}

export function $createImageNode({ src, altText = '', align, width }: InsertImagePayload): ImageNode {
  return new ImageNode(src, altText, align, width)
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}

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
    <span
      className={`inline-block my-2 ${isSelected ? 'outline-2 outline-blue-500' : ''}`}
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

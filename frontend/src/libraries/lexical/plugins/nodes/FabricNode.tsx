import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useCallback, useEffect, useRef } from 'react'
import { mergeRegister } from '@lexical/utils'
import type { DOMConversionMap,
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
  DecoratorNode, KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical'

import { FabricEditor } from '../components/fabric/FabricEditor'

export type SerializedFabricNode = Spread<
  { width: number, height: number, data: string },
  SerializedLexicalNode
>

function $convertFabricElement(domNode: HTMLElement): DOMConversionOutput | null {
  const width = parseInt(domNode.getAttribute('data-fabric-width') ?? '600', 10)
  const height = parseInt(domNode.getAttribute('data-fabric-height') ?? '400', 10)
  const data = domNode.getAttribute('data-fabric-data') ?? ''
  return { node: $createFabricNode(width, height, data) }
}

export class FabricNode extends DecoratorNode<React.ReactNode> {
  __width: number
  __height: number
  __data: string

  constructor(width: number, height: number, data: string, key?: NodeKey) {
    super(key)
    this.__width = width
    this.__height = height
    this.__data = data
  }

  static getType(): string {
    return 'fabric-diagram'
  }

  static clone(node: FabricNode): FabricNode {
    return new FabricNode(node.__width, node.__height, node.__data, node.__key)
  }

  static importJSON(json: SerializedFabricNode): FabricNode {
    return $createFabricNode(json.width, json.height, json.data)
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-fabric-diagram')) return null
        return { conversion: $convertFabricElement, priority: 2 }
      },
    }
  }

  exportJSON(): SerializedFabricNode {
    return {
      ...super.exportJSON(),
      width: this.__width,
      height: this.__height,
      data: this.__data,
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-fabric-diagram', 'true')
    element.setAttribute('data-fabric-width', String(this.__width))
    element.setAttribute('data-fabric-height', String(this.__height))
    element.setAttribute('data-fabric-data', this.__data)
    return { element }
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div')
    div.style.display = 'block'
    return div
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return false
  }

  getWidth(): number { return this.getLatest().__width }
  getHeight(): number { return this.getLatest().__height }
  getData(): string { return this.getLatest().__data }

  setDimensions(width: number, height: number): this {
    const self = this.getWritable()
    self.__width = width
    self.__height = height
    return self
  }

  setData(data: string): this {
    const self = this.getWritable()
    self.__data = data
    return self
  }

  decorate(): React.ReactNode {
    return (
      <FabricComponent
        nodeKey={this.__key}
        width={this.__width}
        height={this.__height}
        data={this.__data}
      />
    )
  }
}

// ─── React component ─────────────────────────────────────────────────────────

interface FabricComponentProps {
  nodeKey: NodeKey
  width: number
  height: number
  data: string
}

function FabricComponent({ nodeKey, width, height, data }: FabricComponentProps) {
  const [editor] = useLexicalComposerContext()
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const ref = useRef<{ deleteSelectedObjects: () => boolean }>(null)

  function saveCanvasData(json: string) {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isFabricNode(node)) node.setData(json)
    })
  }

  const onResize = (width: number, height: number) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isFabricNode(node)) node.setDimensions(width, height)
    })
  }

  const onDelete = useCallback((event: KeyboardEvent) => {
    if (!isSelected) return false
    event.preventDefault()
    if (ref.current?.deleteSelectedObjects()) {
      return true
    }
    editor.update(() => { $getNodeByKey(nodeKey)?.remove() })
    return true
  }, [editor, isSelected, nodeKey])

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (event) => {
          const target = event.target as HTMLElement
          if (target.closest(`[data-fabric-node-key="${nodeKey}"]`)) {
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

  function removeNode() {
    editor.update(() => { $getNodeByKey(nodeKey)?.remove() })
  }

  return <FabricEditor
    ref={ref}
    editable={editor.isEditable()}
    isSelected={isSelected}
    nodeKey={nodeKey}
    data={data}
    width={width}
    height={height}
    onChangeDimensions={onResize}
    onChangeData={saveCanvasData}
    onRemoveEditor={removeNode}
  />
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function $createFabricNode(width = 600, height = 400, data = ''): FabricNode {
  return new FabricNode(width, height, data)
}

export function $isFabricNode(node: LexicalNode | null | undefined): node is FabricNode {
  return node instanceof FabricNode
}

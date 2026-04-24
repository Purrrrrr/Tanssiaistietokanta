import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { $isListNode, INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListNode, REMOVE_LIST_COMMAND } from '@lexical/list'
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { mergeRegister } from '@lexical/utils'
import classNames from 'classnames'
import {
  $createParagraphNode,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  BLUR_COMMAND,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FOCUS_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical'

import RegularSelect from 'libraries/formsV2/components/inputs/selectors/RegularSelect'
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight,
  LayoutTwoColumns, Redo, Undo,
} from 'libraries/ui/icons'

import { INSERT_LAYOUT_COMMAND } from './plugins/LayoutPlugin'
import { CheckListIcon, OrderedListIcon, UnorderedListIcon } from './toolbar/icons'
import { ImageUploadConfig, useImageToolbar } from './toolbar/ImageToolbar'
import { useLinkToolbar } from './toolbar/LinkToolbar'
import { useQRCodeToolbar } from './toolbar/QRCodeToolbar'
import { useTableToolbar } from './toolbar/TableToolbar'
import { ToolbarButton } from './toolbar/ToolbarButton'

export type { ImageUploadConfig } from './toolbar/ImageToolbar'

type BlockType = 'paragraph' | HeadingTagType | 'bullet' | 'number' | 'check'

const HEADING_OPTIONS: BlockType[] = ['paragraph', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']

const HEADING_LABELS: Record<string, string> = {
  paragraph: 'Leipäteksti',
  h1: 'Otsikko 1',
  h2: 'Otsikko 2',
  h3: 'Otsikko 3',
  h4: 'Otsikko 4',
  h5: 'Otsikko 5',
  h6: 'Otsikko 6',
}

function H(type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', children: React.ReactNode) {
  const Tag = type
  return <div className="lexical-content"><Tag>{children}</Tag></div>
}

function Divider() {
  return <div className="self-stretch w-px bg-gray-400" />
}

interface ToolbarPluginProps {
  children: React.ReactNode
  imageUpload?: ImageUploadConfig
}

export default function ToolbarPlugin({ children, imageUpload }: ToolbarPluginProps) {
  const [editor] = useLexicalComposerContext()
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [blockType, setBlockType] = useState<BlockType>('paragraph')
  const focusedRef = useRef(false)
  const anchorRef = useRef<HTMLElement | null>(null)

  const tools = [
    useLinkToolbar(editor),
    useImageToolbar(editor, imageUpload),
    useQRCodeToolbar(editor),
    useTableToolbar(editor),
  ]

  function updateAnchor(newDom?: HTMLElement | null) {
    const dom = newDom === undefined ? anchorRef.current : newDom
    if (dom) {
      dom.style.anchorName = '--lexical-toolbar-anchor'
    }
    if (anchorRef.current !== dom) {
      if (anchorRef.current) {
        anchorRef.current.style.anchorName = null
      }
      anchorRef.current = dom
    }
  }

  const $updateToolbar = useEffectEvent(() => {
    const selection = $getSelection()
    tools.forEach(tool => tool.onUpdate?.(selection))
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))

      const anchorNode = selection.anchor.getNode()
      const element = anchorNode.getKey() === 'root'
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow()

      if ($isHeadingNode(element)) {
        setBlockType(element.getTag())
      } else if ($isListNode(element)) {
        const listNode = element as ListNode
        setBlockType(listNode.getListType())
      } else {
        setBlockType('paragraph')
      }

      const dom = editor.getElementByKey(anchorNode.getKey())
      updateAnchor(dom)
    } else if ($isNodeSelection(selection)) {
      const [node] = selection.getNodes()
      const dom = editor.getElementByKey(node.getKey())
      updateAnchor(dom)
    }
  })

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => { $updateToolbar() }, { editor })
      }),
      editor.registerCommand(
        BLUR_COMMAND,
        () => { focusedRef.current = false; return false },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        FOCUS_COMMAND,
        () => { focusedRef.current = true; return false },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => { $updateToolbar(); return false },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => { setCanUndo(payload); return false },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => { setCanRedo(payload); return false },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor])

  function applyHeading(type: BlockType | null | undefined) {
    if (!type) return
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      if (type === 'paragraph') {
        $setBlocksType(selection, () => $createParagraphNode())
      } else if (type.startsWith('h')) {
        $setBlocksType(selection, () => $createHeadingNode(type as HeadingTagType))
      }
    })
  }

  function toggleList(listType: 'bullet' | 'number' | 'check') {
    if (blockType === listType) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    } else {
      const command = listType === 'bullet'
        ? INSERT_UNORDERED_LIST_COMMAND
        : listType === 'number'
          ? INSERT_ORDERED_LIST_COMMAND
          : INSERT_CHECK_LIST_COMMAND
      editor.dispatchCommand(command, undefined)
    }
  }

  const headingValue: BlockType = HEADING_OPTIONS.includes(blockType) ? blockType : 'paragraph'

  return (
    <>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <div focusgroup="toolbar" className="flex flex-wrap gap-2 items-center p-1 border-b-1 border-stone-400">
        <ToolbarButton
          disabled={!canUndo}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          aria-label="Undo">
          <Undo />
        </ToolbarButton>
        <ToolbarButton
          disabled={!canRedo}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          aria-label="Redo">
          <Redo />
        </ToolbarButton>
        <Divider />
        <ToolbarButton active={blockType === 'h1'} onClick={() => applyHeading('h1')} aria-label={HEADING_LABELS.h1}>
          <span className="relative -left-1 text-xl size-4 leading-[16px]">H1</span>
        </ToolbarButton>
        <ToolbarButton active={blockType === 'h2'} onClick={() => applyHeading('h2')} aria-label={HEADING_LABELS.h2}>
          <span className="relative -left-1 text-base size-4 leading-[16px]">H2</span>
        </ToolbarButton>
        <RegularSelect<BlockType>
          id="heading-select"
          minimal
          value={headingValue}
          onChange={applyHeading}
          items={HEADING_OPTIONS}
          itemToString={item => HEADING_LABELS[item] ?? item}
          itemRenderer={item => item === 'paragraph'
            ? 'Paragraph'
            : H(item as any, HEADING_LABELS[item] ?? item)
          }
          aria-label="Block type"
          placeholder="Paragraph"
        />
        <Divider />
        <ToolbarButton
          onClick={() => toggleList('bullet')}
          active={blockType === 'bullet'}
          aria-label="Unordered list">
          <UnorderedListIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => toggleList('number')}
          active={blockType === 'number'}
          aria-label="Ordered list">
          <OrderedListIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => toggleList('check')}
          active={blockType === 'check'}
          aria-label="Checkbox list">
          <CheckListIcon />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          active={isBold}
          aria-label="Format Bold">
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          active={isItalic}
          aria-label="Format Italics">
          <span className="italic -skew-6">i</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          active={isUnderline}
          aria-label="Format Underline">
          <span className="underline decoration-2">U</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
          active={isStrikethrough}
          aria-label="Format Strikethrough">
          <span className="relative after:block after:h-[3px] after:absolute after:top-[10px] after:-left-0.5 after:w-3.5 after:bg-black">S</span>
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
          aria-label="Left Align">
          <AlignLeft />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
          aria-label="Center Align">
          <AlignCenter />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
          aria-label="Right Align">
          <AlignRight />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
          aria-label="Justify Align">
          <AlignJustify />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(INSERT_LAYOUT_COMMAND, '1fr 1fr')}
          active={isItalic}
          aria-label="Format Subscript">
          <LayoutTwoColumns />
        </ToolbarButton>
        <Divider />
        {tools.map(tool => tool.button)}
      </div>
      {children}
      <div
        className={classNames(
          '[position-anchor:--lexical-toolbar-anchor] absolute mt-3 top-[anchor(bottom,-1000px)] left-[anchor(left)] bg-white border-1 border-gray-400 rounded-md z-10 shadow-md empty:hidden',
        )}
      >
        {tools.map((tool, index) => tool.floatingEditor && <div key={index}>{tool.floatingEditor}</div>)}
      </div>
    </>
  )
}

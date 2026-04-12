/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useCallback, useEffect, useRef, useState } from 'react'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $isListNode, INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListNode, REMOVE_LIST_COMMAND } from '@lexical/list'
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical'

import RegularSelect from 'libraries/formsV2/components/inputs/selectors/RegularSelect'
import { Button, ButtonProps } from 'libraries/ui'
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight,
  Bold, Italic, Link, Redo, Strikethrough, Underline,
  Undo,
} from 'libraries/ui/icons'

import { INSERT_LAYOUT_COMMAND } from './plugins/LayoutPlugin'

import '../ui/Markdown.css'

type BlockType = 'paragraph' | HeadingTagType | 'bullet' | 'number' | 'check'

const HEADING_OPTIONS: BlockType[] = ['paragraph', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']

const HEADING_LABELS: Record<string, string> = {
  paragraph: 'Paragraph',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
}

function H(type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', children: React.ReactNode) {
  const Tag = type
  return <div className="markdown-content"><Tag>{children}</Tag></div>
}

function Divider() {
  return <div className="border-l-1 border-black" />
}

/*
-Images
-Tables
-QR codes
*/


export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const toolbarRef = useRef(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [blockType, setBlockType] = useState<BlockType>('paragraph')
  const [isLink, setIsLink] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [isLinkEditMode, setIsLinkEditMode] = useState(false)
  const [editingLinkUrl, setEditingLinkUrl] = useState('')

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
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

      // Detect link in selection
      const node = anchorNode
      const parent = node.getParent()
      if ($isLinkNode(parent)) {
        setIsLink(true)
        setLinkUrl(parent.getURL())
      } else if ($isLinkNode(node)) {
        setIsLink(true)
        setLinkUrl((node as Parameters<typeof $isLinkNode>[0] & { getURL(): string }).getURL())
      } else {
        setIsLink(false)
        setLinkUrl('')
      }
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(
          () => {
            $updateToolbar()
          },
          { editor },
        )
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor, $updateToolbar])

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

  function openLinkEditor() {
    setEditingLinkUrl(linkUrl)
    setIsLinkEditMode(true)
  }

  function applyLink() {
    const url = editingLinkUrl.trim()
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url || null)
    setIsLinkEditMode(false)
  }

  function removeLink() {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    setIsLinkEditMode(false)
  }

  const headingValue: BlockType = HEADING_OPTIONS.includes(blockType) ? blockType : 'paragraph'

  return (
    <div ref={toolbarRef}>
      <div className="flex flex-wrap gap-2 p-1">
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
        <RegularSelect<BlockType>
          id="heading-select"
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
          <Bold />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          active={isItalic}
          aria-label="Format Italics">
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          active={isUnderline}
          aria-label="Format Underline">
          <Underline />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
          active={isStrikethrough}
          aria-label="Format Strikethrough">
          <Strikethrough />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={openLinkEditor}
          active={isLink}
          aria-label="Insert or edit link">
          <Link />
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
          L
        </ToolbarButton>
      </div>
      {isLinkEditMode && (
        <div className="flex gap-2 items-center px-2 py-1 border-t-1 border-black">
          <input
            className="flex-1 px-2 py-0.5 border-1 border-gray-400 rounded text-sm"
            type="url"
            placeholder="https://…"
            value={editingLinkUrl}
            onChange={(e) => setEditingLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyLink()
              if (e.key === 'Escape') setIsLinkEditMode(false)
            }}
            autoFocus
          />
          <Button minimal onClick={applyLink} aria-label="Apply link">OK</Button>
          {isLink && <Button minimal onClick={removeLink} aria-label="Remove link">Remove</Button>}
          <Button minimal onClick={() => setIsLinkEditMode(false)} aria-label="Cancel">Cancel</Button>
        </div>
      )}
    </div>
  )
}

function ToolbarButton({ ...props }: ButtonProps) {
  return <Button minimal {...props} className="align-sub" />
}

function UnorderedListIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <circle cx="2" cy="4" r="1.5" />
      <rect x="5" y="3" width="10" height="2" rx="1" />
      <circle cx="2" cy="8" r="1.5" />
      <rect x="5" y="7" width="10" height="2" rx="1" />
      <circle cx="2" cy="12" r="1.5" />
      <rect x="5" y="11" width="10" height="2" rx="1" />
    </svg>
  )
}

function OrderedListIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <text x="0" y="5" fontSize="5" fontFamily="monospace">1.</text>
      <rect x="5" y="3" width="10" height="2" rx="1" />
      <text x="0" y="9" fontSize="5" fontFamily="monospace">2.</text>
      <rect x="5" y="7" width="10" height="2" rx="1" />
      <text x="0" y="13" fontSize="5" fontFamily="monospace">3.</text>
      <rect x="5" y="11" width="10" height="2" rx="1" />
    </svg>
  )
}

function CheckListIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <rect x="0.5" y="2.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <polyline points="1,4 2,5 3.5,3" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="5" y="3" width="10" height="2" rx="1" />
      <rect x="0.5" y="6.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="5" y="7" width="10" height="2" rx="1" />
      <rect x="0.5" y="10.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="5" y="11" width="10" height="2" rx="1" />
    </svg>
  )
}

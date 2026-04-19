import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useCallback, useEffect, useRef, useState } from 'react'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $isListNode, INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListNode, REMOVE_LIST_COMMAND } from '@lexical/list'
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { mergeRegister } from '@lexical/utils'
import classNames from 'classnames'
import {
  $addUpdateTag,
  $createParagraphNode,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  BaseSelection,
  BLUR_COMMAND,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FOCUS_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  SKIP_DOM_SELECTION_TAG,
  UNDO_COMMAND,
} from 'lexical'

import type { FileOwner, FileOwningId } from 'types/files'

import { doUpload } from 'services/files'

import RegularSelect from 'libraries/formsV2/components/inputs/selectors/RegularSelect'
import { Button, ButtonProps } from 'libraries/ui'
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight,
  LayoutTwoColumns, Link, Redo, Undo,
} from 'libraries/ui/icons'

import { CheckListIcon, ImageIcon, OrderedListIcon, QRCodeIcon, TableIcon, UnorderedListIcon } from './icons'
import { INSERT_IMAGE_COMMAND } from './plugins/ImagePlugin'
import { INSERT_LAYOUT_COMMAND } from './plugins/LayoutPlugin'
import { $isQRCodeNode, QRCodeNode } from './plugins/nodes/QRCodeNode'
import { INSERT_QR_CODE_COMMAND } from './plugins/QRCodePlugin'
import { INSERT_TABLE_COMMAND } from './plugins/TablePlugin'

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
  return <div className="markdown-content"><Tag>{children}</Tag></div>
}

function Divider() {
  return <div className="bg-gray-400 w-px self-stretch" />
}

export interface ImageUploadConfig {
  owner: FileOwner
  owningId: FileOwningId
  path?: string
}

export default function ToolbarPlugin({ imageUpload }: { imageUpload?: ImageUploadConfig } = {}) {
  const [editor] = useLexicalComposerContext()
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [blockType, setBlockType] = useState<BlockType>('paragraph')
  const [isLink, setIsLink] = useState(false)
  const [isTableInsertMode, setIsTableInsertMode] = useState(false)
  const [tableRows, setTableRows] = useState('3')
  const [tableCols, setTableCols] = useState('3')
  const [isImageInsertMode, setIsImageInsertMode] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const focusedRef = useRef(false)
  const anchorRef = useRef<HTMLElement | null>(null)

  const [url, setUrl] = useState<string | null>(null)
  const [qrValue, setQRValue] = useState<string | null>(null)
  const [qrNode, setQRNode] = useState<QRCodeNode | null>(null)

  function updateAnchor(newDom?: HTMLElement | null) {
    const dom = newDom === undefined ? anchorRef.current : newDom
    if (dom) {
      // TODO fix types
      (dom.style as any).anchorName = '--lexical-toolbar-anchor'
    }
    if (anchorRef.current !== dom) {
      if (anchorRef.current) {
        (anchorRef.current.style as any).anchorName = null
      }
      anchorRef.current = dom
    }
  }

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    setUrl(getLinkUrl(selection))
    setQRValue(getQRCodeValue(selection))
    setQRNode(getQRCodeNode(selection))
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
      } else if ($isLinkNode(node)) {
        setIsLink(true)
      } else {
        setIsLink(false)
      }

      const dom = editor.getElementByKey(node.getKey())
      updateAnchor(dom)
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
        BLUR_COMMAND,
        () => {
          focusedRef.current = false
          // updateAnchor(null)
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          focusedRef.current = true
          // updateAnchor()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
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
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://')
    }
  }

  function insertTable() {
    const rows = Math.max(1, parseInt(tableRows, 10) || 1).toString()
    const columns = Math.max(1, parseInt(tableCols, 10) || 1).toString()
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      rows,
      columns,
      includeHeaders: { rows: true, columns: false },
    })
    setIsTableInsertMode(false)
  }

  function insertImageFromUrl() {
    const src = imageUrl.trim()
    if (!src) return
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src, altText: imageAlt.trim() })
    setImageUrl('')
    setImageAlt('')
    setIsImageInsertMode(false)
  }

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !imageUpload) return
    setIsUploading(true)
    try {
      const uploaded = await doUpload({
        owner: imageUpload.owner,
        owningId: imageUpload.owningId,
        path: imageUpload.path,
        file,
        autoRename: true,
      })
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src: `/api/files/${uploaded._id}?download=true`,
        altText: file.name.replace(/\.[^.]+$/, ''),
      })
      setIsImageInsertMode(false)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const headingValue: BlockType = HEADING_OPTIONS.includes(blockType) ? blockType : 'paragraph'

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 p-1">
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
          <span className="text-xl relative -left-1 size-4 leading-[16px]">H1</span>
        </ToolbarButton>
        <ToolbarButton active={blockType === 'h2'} onClick={() => applyHeading('h2')} aria-label={HEADING_LABELS.h2}>
          <span className="text-base relative -left-1 size-4 leading-[16px]">H2</span>
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
          <LayoutTwoColumns />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(INSERT_QR_CODE_COMMAND, '')}
          aria-label="Insert QR code">
          <QRCodeIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => { setIsTableInsertMode(true); setIsImageInsertMode(false) }}
          active={isTableInsertMode}
          aria-label="Insert table">
          <TableIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => { setIsImageInsertMode(true); setIsTableInsertMode(false) }}
          active={isImageInsertMode}
          aria-label="Insert image">
          <ImageIcon />
        </ToolbarButton>
      </div>

      {isTableInsertMode && (
        <div className="flex gap-2 items-center px-2 py-1 border-t-1 border-black">
          <label htmlFor="table-rows-input" className="text-sm">Rows</label>
          <input
            id="table-rows-input"
            className="w-12 px-2 py-0.5 border-1 border-gray-400 rounded text-sm"
            type="number"
            min="1"
            max="50"
            value={tableRows}
            onChange={(e) => setTableRows(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') insertTable(); if (e.key === 'Escape') setIsTableInsertMode(false) }}
          />
          <label htmlFor="table-cols-input" className="text-sm">Cols</label>
          <input
            id="table-cols-input"
            className="w-12 px-2 py-0.5 border-1 border-gray-400 rounded text-sm"
            type="number"
            min="1"
            max="50"
            value={tableCols}
            onChange={(e) => setTableCols(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') insertTable(); if (e.key === 'Escape') setIsTableInsertMode(false) }}
          />
          <Button minimal onClick={insertTable} aria-label="Insert table">Insert</Button>
          <Button minimal onClick={() => setIsTableInsertMode(false)} aria-label="Cancel">Cancel</Button>
        </div>
      )}
      {isImageInsertMode && (
        <div className="flex flex-wrap gap-2 items-center px-2 py-1 border-t-1 border-black">
          <input
            className="flex-1 min-w-40 px-2 py-0.5 border-1 border-gray-400 rounded text-sm"
            type="url"
            placeholder="Image URL (https://…)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') insertImageFromUrl(); if (e.key === 'Escape') setIsImageInsertMode(false) }}
          />
          <input
            className="w-32 px-2 py-0.5 border-1 border-gray-400 rounded text-sm"
            type="text"
            placeholder="Alt text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') insertImageFromUrl(); if (e.key === 'Escape') setIsImageInsertMode(false) }}
          />
          <Button minimal onClick={insertImageFromUrl} aria-label="Insert image from URL">Insert URL</Button>
          {imageUpload && (
            <>
              <span className="text-sm text-gray-500">or</span>
              <label className="px-2 py-0.5 text-xs border-1 border-gray-400 rounded bg-white hover:bg-gray-50 cursor-pointer">
                {isUploading ? 'Uploading…' : 'Upload file'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={isUploading}
                  onChange={handleImageFileChange}
                />
              </label>
            </>
          )}
          <Button minimal onClick={() => setIsImageInsertMode(false)} aria-label="Cancel">Cancel</Button>
        </div>
      )}
      <div
        className={classNames(
          '[position-anchor:--lexical-toolbar-anchor] absolute mt-2 top-[anchor(bottom,-1000px)] left-[anchor(left)] bg-white border-1 border-gray-400 rounded-md z-10 shadow-md empty:hidden',
        )}
      >
        <LinkEditor editor={editor} url={url} />
        <QRCodeEditor editor={editor} node={qrNode} value={qrValue} />
      </div>
    </>
  )
}

interface LinkEditorProps {
  editor: LexicalEditor
  url: string | null
}

function LinkEditor({ editor, url }: LinkEditorProps) {
  if (url === null) {
    return null
  }

  function applyLink(value: string) {
    const url = value.trim()
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url || null)
    editor.update(() => {
      $addUpdateTag(SKIP_DOM_SELECTION_TAG)
    })
  }

  return <div className="flex gap-2 items-center px-2 py-1">
    <input
      className="flex-1 px-2 py-0.5 border-1 border-gray-400 rounded text-sm"
      type="url"
      placeholder="https://…"
      value={url}
      onChange={(e) => applyLink(e.target.value)}
    />
    <Button minimal onClick={() => applyLink('')} aria-label="Remove link">Remove link</Button>
  </div>
}

function getLinkUrl(selection: BaseSelection | null): string | null {
  if (!$isRangeSelection(selection)) return null
  const anchorNode = selection.anchor.getNode()
  const parent = anchorNode.getParent()
  if ($isLinkNode(parent)) {
    return parent.getURL()
  } else if ($isLinkNode(anchorNode)) {
    return (anchorNode as Parameters<typeof $isLinkNode>[0] & { getURL(): string }).getURL()
  }
  return null
}

interface QRCodeEditorProps {
  editor: LexicalEditor
  node: QRCodeNode | null
  value: string | null
}

function QRCodeEditor({ editor, node, value }: QRCodeEditorProps) {
  if (node === null) {
    return null
  }

  function applyQRCode(value: string) {
    const trimmed = value.trim()
    editor.update(() => {
      if ($isQRCodeNode(node)) node.setValue(trimmed)
      $addUpdateTag(SKIP_DOM_SELECTION_TAG)
    })
  }

  function removeQRCode() {
    editor.update(() => {
      node?.remove()
    })
  }

  return <div className="flex gap-2 items-center px-2 py-1">
    <input
      className="flex-1 px-2 py-0.5 border-1 border-gray-400 rounded text-sm"
      type="text"
      placeholder="Enter URL or text for QR code…"
      value={value ?? ''}
      onChange={(e) => applyQRCode(e.target.value)}
    />
    <Button minimal onClick={removeQRCode} aria-label="Remove QR code">Remove QR code</Button>
  </div>
}

function getQRCodeValue(selection: BaseSelection | null): string | null {
  if ($isNodeSelection(selection)) {
    const node = selection.getNodes()[0]
    if (node.getType() === 'qr-code') {
      return (node as unknown as QRCodeNode).getValue()
    }
  }
  return null
}

function getQRCodeNode(selection: BaseSelection | null): QRCodeNode | null {
  if ($isNodeSelection(selection)) {
    const node = selection.getNodes()[0]
    if ($isQRCodeNode(node)) {
      return node
    }
  }
  return null
}

function ToolbarButton({ ...props }: ButtonProps) {
  return <Button minimal {...props} paddingClass="" className="align-sub size-[30px] grid items-center justify-center [font-size:18px]" />
}

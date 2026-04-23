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

import type { FileOwner, FileOwningId } from 'types/files'

import { doUpload } from 'services/files'

import RegularSelect from 'libraries/formsV2/components/inputs/selectors/RegularSelect'
import { Button } from 'libraries/ui'
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight,
  LayoutTwoColumns, Redo, Undo,
} from 'libraries/ui/icons'

import { INSERT_IMAGE_COMMAND } from './plugins/ImagePlugin'
import { INSERT_LAYOUT_COMMAND } from './plugins/LayoutPlugin'
import { INSERT_TABLE_COMMAND } from './plugins/TablePlugin'
import { CheckListIcon, ImageIcon, OrderedListIcon, TableIcon, UnorderedListIcon } from './toolbar/icons'
import { useLinkToolbar } from './toolbar/LinkToolbar'
import { useQRCodeToolbar } from './toolbar/QRCodeToolbar'
import { ToolbarButton } from './toolbar/ToolbarButton'

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

  const hookData = [
    useLinkToolbar(editor),
    useQRCodeToolbar(editor),
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
    hookData.forEach(hook => hook.onUpdate?.(selection))
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
      <div className="flex flex-wrap gap-2 items-center p-1 border-b-1 border-stone-400">
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
        {hookData.map(hook => hook.button)}
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
        <div className="flex gap-2 items-center py-1 px-2 border-black border-t-1">
          <label htmlFor="table-rows-input" className="text-sm">Rows</label>
          <input
            id="table-rows-input"
            className="py-0.5 px-2 w-12 text-sm rounded border-gray-400 border-1"
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
            className="py-0.5 px-2 w-12 text-sm rounded border-gray-400 border-1"
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
        <div className="flex flex-wrap gap-2 items-center py-1 px-2 border-black border-t-1">
          <input
            className="flex-1 py-0.5 px-2 text-sm rounded border-gray-400 min-w-40 border-1"
            type="url"
            placeholder="Image URL (https://…)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') insertImageFromUrl(); if (e.key === 'Escape') setIsImageInsertMode(false) }}
          />
          <input
            className="py-0.5 px-2 w-32 text-sm rounded border-gray-400 border-1"
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
              <label className="py-0.5 px-2 text-xs bg-white rounded border-gray-400 cursor-pointer hover:bg-gray-50 border-1">
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
        {hookData.map((hook, index) => hook.editor && <div key={index}>{hook.editor}</div>)}
      </div>
    </>
  )
}

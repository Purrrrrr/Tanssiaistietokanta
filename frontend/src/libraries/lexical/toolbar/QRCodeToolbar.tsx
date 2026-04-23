import { useState } from 'react'
import {
  $addUpdateTag,
  $isNodeSelection,
  BaseSelection,
  LexicalEditor,
  SKIP_DOM_SELECTION_TAG,
} from 'lexical'

import { ToolbarHookReturn } from './types'

import { Button } from 'libraries/ui'

import { $isQRCodeNode, QRCodeNode, QRCodePayload } from '../plugins/nodes/QRCodeNode'
import { INSERT_QR_CODE_COMMAND } from '../plugins/QRCodePlugin'
import { QRCodeIcon } from './icons'
import { ToolbarButton } from './ToolbarButton'
import { ToolbarTitle } from './ToolbarTitle'

export function useQRCodeToolbar(editor: LexicalEditor): ToolbarHookReturn {
  const [qrValue, setQRValue] = useState<QRCodePayload | null>(null)
  const [qrNode, setQRNode] = useState<QRCodeNode | null>(null)
  return {
    button: (
      <ToolbarButton
        onClick={() => editor.dispatchCommand(INSERT_QR_CODE_COMMAND, { value: '', title: '', size: 128 })}
        aria-label="Insert QR code">
        <QRCodeIcon />
      </ToolbarButton>
    ),
    onUpdate: (selection) => {
      setQRValue(getQRCodeValue(selection))
      setQRNode(getQRCodeNode(selection))
    },
    floatingEditor: <QRCodeEditor editor={editor} node={qrNode} data={qrValue} />,
  }
}

function getQRCodeValue(selection: BaseSelection | null): QRCodePayload | null {
  if ($isNodeSelection(selection)) {
    const node = selection.getNodes()[0]
    if (node.getType() === 'qr-code') {
      const qrNode = node as unknown as QRCodeNode
      return {
        value: qrNode.getValue(),
        title: qrNode.getTitle(),
        size: qrNode.getSize(),
      }
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

interface QRCodeEditorProps {
  editor: LexicalEditor
  node: QRCodeNode | null
  data: QRCodePayload | null
}

function QRCodeEditor({ editor, node, data }: QRCodeEditorProps) {
  if (node === null || data === null) {
    return null
  }
  const { value, title, size } = data

  function updateQRCodePayload(payload: Partial<QRCodePayload>) {
    editor.update(() => {
      if ($isQRCodeNode(node)) {
        if (payload.value !== undefined) node.setValue(payload.value.trim())
        if (payload.title !== undefined) node.setTitle(payload.title.trim())
        if (payload.size !== undefined) node.setSize(payload.size > 0 ? payload.size : 128)
      }
      $addUpdateTag(SKIP_DOM_SELECTION_TAG)
    })
  }

  function removeQRCode() {
    editor.update(() => {
      node?.remove()
    })
  }

  return <div className="flex gap-2 items-center py-1 px-2">
    <ToolbarTitle text="QR code" />
    <input
      className="flex-1 py-0.5 px-2 text-sm rounded border-gray-400 border-1"
      type="text"
      placeholder="Enter URL or text for QR code…"
      value={value ?? ''}
      onChange={(e) => updateQRCodePayload({ value: e.target.value })}
    />
    <input
      className="flex-1 py-0.5 px-2 text-sm rounded border-gray-400 border-1"
      type="text"
      placeholder="Enter title for QR code (optional)…"
      value={title ?? ''}
      onChange={(e) => updateQRCodePayload({ title: e.target.value })}
    />
    <input
      className="flex-1 py-0.5 px-2 text-sm rounded border-gray-400 border-1"
      type="number"
      placeholder="Enter title for QR code (optional)…"
      value={size ?? '128'}
      onChange={(e) => updateQRCodePayload({ size: parseInt(e.target.value, 10) })}
    />
    <Button minimal onClick={removeQRCode} aria-label="Remove QR code">Remove QR code</Button>
  </div>
}

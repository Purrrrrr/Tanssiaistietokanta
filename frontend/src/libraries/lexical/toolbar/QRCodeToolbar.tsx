import { useState } from 'react'
import {
  $addUpdateTag,
  $isNodeSelection,
  BaseSelection,
  LexicalEditor,
  SKIP_DOM_SELECTION_TAG,
} from 'lexical'

import { ToolbarHookReturn } from './types'

import { useEditorT, useEditorTranslation } from '../i18n'
import { $isQRCodeNode, QRCodeNode, QRCodePayload } from '../plugins/nodes/QRCodeNode'
import { INSERT_QR_CODE_COMMAND } from '../plugins/QRCodePlugin'
import { QRCodeIcon } from './icons'
import { ToolbarButton, ToolbarInput, ToolbarRow } from './widgets'

export function useQRCodeToolbar(editor: LexicalEditor): ToolbarHookReturn {
  const [qrValue, setQRValue] = useState<QRCodePayload | null>(null)
  const [qrNode, setQRNode] = useState<QRCodeNode | null>(null)
  return {
    button: (
      <ToolbarButton
        key="insertQRCode"
        onClick={() => editor.dispatchCommand(INSERT_QR_CODE_COMMAND, { value: '', title: '', size: 128 })}
        tooltip={useEditorTranslation('qrCode.insertQRCode')}
        icon={<QRCodeIcon />}
      />
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
    if (node?.getType() === 'qr-code') {
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
  const t = useEditorT('qrCode')
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

  return <ToolbarRow title={t('QRCode')}>
    <ToolbarInput label={t('url')} type="url" value={value ?? ''} onChange={value => updateQRCodePayload({ value })} />
    <ToolbarInput label={t('title')} value={title ?? ''} onChange={title => updateQRCodePayload({ title })} />
    <ToolbarInput label={t('size')} value={size ?? '128'} onChange={size => updateQRCodePayload({ size: parseInt(size, 10) })} />
    <ToolbarButton color="danger" onClick={removeQRCode} text={t('remove')} />
  </ToolbarRow>
}

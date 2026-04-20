import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import type { LexicalCommand } from 'lexical'
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'

import { $createQRCodeNode, QRCodeNode, QRCodePayload } from './nodes/QRCodeNode'

export const INSERT_QR_CODE_COMMAND: LexicalCommand<QRCodePayload> =
  createCommand<QRCodePayload>('INSERT_QR_CODE_COMMAND')

export function QRCodePlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([QRCodeNode])) {
      throw new Error('QRCodePlugin: QRCodeNode not registered on editor')
    }

    return editor.registerCommand(
      INSERT_QR_CODE_COMMAND,
      ({ value, title, size }) => {
        editor.update(() => {
          $insertNodeToNearestRoot($createQRCodeNode(value, title, size))
        })
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}

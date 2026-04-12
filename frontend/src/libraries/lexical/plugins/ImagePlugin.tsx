import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import type { LexicalCommand } from 'lexical'
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'

import { $createImageNode, ImageNode, InsertImagePayload } from './nodes/ImageNode'

export { type InsertImagePayload } from './nodes/ImageNode'

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand<InsertImagePayload>('INSERT_IMAGE_COMMAND')

export function ImagePlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagePlugin: ImageNode not registered on editor')
    }

    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        editor.update(() => {
          $insertNodeToNearestRoot($createImageNode(payload))
        })
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}

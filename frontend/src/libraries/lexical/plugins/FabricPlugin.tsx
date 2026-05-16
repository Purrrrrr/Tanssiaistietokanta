import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import type { LexicalCommand } from 'lexical'
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'

import { $createFabricNode, FabricNode } from './nodes/FabricNode'

export const INSERT_FABRIC_COMMAND: LexicalCommand<{ width?: number, height?: number }> =
  createCommand('INSERT_FABRIC_COMMAND')

export function FabricPlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([FabricNode])) {
      throw new Error('FabricPlugin: FabricNode not registered on editor')
    }

    return editor.registerCommand(
      INSERT_FABRIC_COMMAND,
      (payload) => {
        const width = payload?.width ?? 600
        const height = payload?.height ?? 400
        editor.update(() => {
          $insertNodeToNearestRoot($createFabricNode(width, height, ''))
        })
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}

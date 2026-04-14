import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect, useRef } from 'react'
import equal from 'fast-deep-equal'
import type { SerializedEditorState } from 'lexical'

/** Tag applied to setEditorState calls from external value syncs.
 *  The OnChangePlugin callback uses this to suppress echo-back to callers. */
export const EXTERNAL_UPDATE_TAG = 'external-update'

interface Props {
  value?: SerializedEditorState | null
}

/**
 * Watches `value` for referential changes and applies the new state to the
 * editor, tagged so that the onChange callback can skip echo-back.
 *
 * Initial content is handled by `initialConfig.editorState` in the composer;
 * this plugin only handles *subsequent* changes.
 */
export function SyncValuePlugin({ value }: Props) {
  const [editor] = useLexicalComposerContext()
  const lastApplied = useRef<SerializedEditorState | null | undefined>(undefined)

  useEffect(() => {
    // Skip null/undefined and values we already applied (guards against
    // re-renders where the prop identity didn't change).
    if (value == null) return
    if (equal(value, lastApplied.current)) return
    const editorValue = editor.getEditorState().toJSON()
    if (equal(value, editorValue)) return

    lastApplied.current = value
    const nextState = editor.parseEditorState(value)
    editor.setEditorState(nextState, { tag: EXTERNAL_UPDATE_TAG })
  }, [editor, value])

  return null
}

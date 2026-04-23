import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useEffect, useRef } from 'react'
import equal from 'fast-deep-equal'

import type { MinifiedDocumentContent } from '../utils/minify'
import { expand, expandIds, minifyLiveState } from '../utils/minify'

/** Tag applied to setEditorState calls from external value syncs.
 *  The OnChangePlugin callback uses this to suppress echo-back to callers. */
const EXTERNAL_UPDATE_TAG = 'external-update'

interface Props {
  value?: MinifiedDocumentContent | null
  onChange?: (state: MinifiedDocumentContent) => void
}

/**
 * Watches `value` for referential changes and applies the new state to the
 * editor, tagged so that the onChange callback can skip echo-back.
 *
 * Initial content is handled by `initialConfig.editorState` in the composer;
 * this plugin only sets the state for *subsequent* changes, but always rebuilds
 * the nodeIdMap (including on first render) so IDs are correctly tracked.
 */
export function SyncValuePlugin({ value, onChange }: Props) {
  const nodeIdMapRef = useRef(new Map<string, string>())
  const [editor] = useLexicalComposerContext()
  const lastApplied = useRef<MinifiedDocumentContent | null | undefined>(undefined)
  const isFirst = useRef(true)

  useEffect(() => {
    if (nodeIdMapRef.current == null) {
      throw new Error('SyncValuePlugin: nodeIdMapRef is null')
    }
    // console.log('SyncValuePlugin: checking for value changes', { value, lastApplied: lastApplied.current, isFirst: isFirst.current })
    if (isFirst.current && value != null) {
      lastApplied.current = value
      isFirst.current = false
      return
    }

    if (value == null) return
    if (value === lastApplied.current) return
    if (equal(value, lastApplied.current)) return

    const expanded = expand(value)
    // console.log('SyncValuePlugin: expanded value', { expanded })
    const currentJson = editor.getEditorState().toJSON()
    if (equal(expanded, currentJson)) return
    lastApplied.current = value

    const nextState = editor.parseEditorState(expanded)
    editor.setEditorState(nextState, { tag: EXTERNAL_UPDATE_TAG })
  }, [editor, value])
  useEffect(() => {
    if (value == null) return
    expandIds(value, editor, nodeIdMapRef.current)
  }, [editor, value])

  return <OnChangePlugin onChange={(editorState, _editor, tags) => {
    if (tags.has(EXTERNAL_UPDATE_TAG)) return
    onChange?.(minifyLiveState(editorState, nodeIdMapRef.current))
  }} />
}

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useEffect, useRef } from 'react'
import equal from 'fast-deep-equal'
import { $createRangeSelection, $getSelection, $isRangeSelection, EditorState, LexicalEditor } from 'lexical'

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
  // Map from minified ids to live node keys
  const nodeIdMapRef = useRef(new Map<string, string>())
  const [editor] = useLexicalComposerContext()
  const lastApplied = useRef<MinifiedDocumentContent | null | undefined>(undefined)

  useEffect(() => {
    if (value == null) return
    console.log('SyncValuePlugin applying new value', value)
    if (lastApplied.current === undefined) {
      lastApplied.current = value
      nodeIdMapRef.current = expandIds(value, editor.getEditorState())
      return
    }
    const nextState = getNextState(editor, value, lastApplied.current)
    if (!nextState) {
      nodeIdMapRef.current = expandIds(value, editor.getEditorState())
      return
    }

    lastApplied.current = value

    // Fix selection to match the old selection as closely as possible, so that the editor doesn't lose focus or move the cursor unexpectedly when the content changes externally.
    const currentSelection = getSelectionToRestore(editor.getEditorState(), nodeIdMapRef.current)
    const nextIdMap = expandIds(value, nextState)
    editor.setEditorState(
      restoreSelection(nextState, currentSelection, nextIdMap),
      { tag: EXTERNAL_UPDATE_TAG },
    )
    nodeIdMapRef.current = nextIdMap
  }, [editor, value])

  return <OnChangePlugin onChange={(editorState, _editor, tags) => {
    if (tags.has(EXTERNAL_UPDATE_TAG)) return
    onChange?.(minifyLiveState(editorState, nodeIdMapRef.current))
  }} />
}

function getSelectionToRestore(editorState: EditorState, idMap: Map<string, string>) {
  return editorState.read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorKey = findValueKey(idMap, selection.anchor.key)
      const focusKey = findValueKey(idMap, selection.focus.key)
      if (anchorKey == null || focusKey == null) return null

      // console.log('current selection', { anchorKey, focusKey, selection })
      return {
        type: 'range',
        anchor: {
          key: anchorKey,
          offset: selection.anchor.offset,
          type: selection.anchor.type,
        },
        focus: {
          key: focusKey,
          offset: selection.focus.offset,
          type: selection.focus.type,
        },
        format: selection.format,
        style: selection.style,
      }
    }
    return null
  })
}

function restoreSelection(
  editorState: EditorState,
  selection: ReturnType<typeof getSelectionToRestore>,
  idMap: Map<string, string>,
): EditorState {
  if (!selection) return editorState
  return editorState.read(() => {
    const anchorKey = idMap.get(selection.anchor.key)
    const focusKey = idMap.get(selection.focus.key)
    if (anchorKey == null || focusKey == null) return editorState

    const restoredSelection = $createRangeSelection()
    restoredSelection.anchor.set(anchorKey, selection.anchor.offset, selection.anchor.type)
    restoredSelection.focus.set(focusKey, selection.focus.offset, selection.focus.type)
    restoredSelection.format = selection.format
    restoredSelection.style = selection.style
    restoredSelection.dirty = true
    // console.log(selection, selection)
    return editorState.clone(restoredSelection)
  })
}

function findValueKey(idMap: Map<string, string>, key: string): string | undefined {
  for (const [valueKey, liveKey] of idMap.entries()) {
    if (liveKey === key) {
      return valueKey
    }
  }
  return undefined
}

function getNextState(
  editor: LexicalEditor,
  value: MinifiedDocumentContent | null | undefined,
  lastApplied: MinifiedDocumentContent | null | undefined,
): EditorState | undefined {
  if (value == null) return
  if (value === lastApplied) return
  if (equal(value, lastApplied)) return

  const expanded = expand(value)
  const currentJson = editor.getEditorState().toJSON()
  if (equal(expanded, currentJson)) return

  return editor.parseEditorState(expanded)
}

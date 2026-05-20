import { useState } from 'react'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import {
  $addUpdateTag,
  $isRangeSelection,
  BaseSelection,
  LexicalEditor,
  SKIP_DOM_SELECTION_TAG,
} from 'lexical'

import { ToolbarHookReturn } from './types'

import { Link } from 'libraries/ui/icons'

import { useEditorT } from '../i18n'
import { ToolbarButton, ToolbarRow } from './widgets'

export function useLinkToolbar(editor: LexicalEditor): ToolbarHookReturn {
  const t = useEditorT('link')
  const [isLink, setIsLink] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  function openLinkEditor() {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://')
    }
  }

  return {
    onUpdate: (selection) => {
      setUrl(getLinkUrl(selection))
      if ($isRangeSelection(selection)) {
        // Detect link in selection
        const anchorNode = selection.anchor.getNode()
        const parent = anchorNode.getParent()
        if ($isLinkNode(parent)) {
          setIsLink(true)
        } else if ($isLinkNode(anchorNode)) {
          setIsLink(true)
        } else {
          setIsLink(false)
        }
      }
    },
    button: (
      <ToolbarButton
        key="insertLink"
        onClick={openLinkEditor}
        active={isLink}
        tooltip={t('insertLink')}
        icon={<Link />}
      />
    ),
    floatingEditor: <LinkEditor editor={editor} url={url} />,
  }
}

interface LinkEditorProps {
  editor: LexicalEditor
  url: string | null
}

function LinkEditor({ editor, url }: LinkEditorProps) {
  const t = useEditorT('link')
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

  return <ToolbarRow title={t('linkOptions')}>
    <label htmlFor="link-url">{t('url')}</label>
    <input
      id="link-url"
      className="flex-1 py-0.5 px-2 text-sm rounded border-gray-400 border-1"
      type="url"
      placeholder="https://…"
      value={url}
      onChange={(e) => applyLink(e.target.value)}
    />
    <ToolbarButton onClick={() => applyLink('')} text={t('remove')} />
  </ToolbarRow>
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

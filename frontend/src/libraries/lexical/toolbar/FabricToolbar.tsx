import { LexicalEditor } from 'lexical'

import { ToolbarHookReturn } from './types'

import { useEditorT } from '../i18n'
import { INSERT_FABRIC_COMMAND } from '../plugins/FabricPlugin'
import { ToolbarButton } from './widgets'

function DiagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="9" height="9" rx="1" />
      <ellipse cx="18" cy="6.5" rx="5" ry="5" />
      <polygon points="11,12 18,21 4,21" />
    </svg>
  )
}

export function useFabricToolbar(editor: LexicalEditor): ToolbarHookReturn {
  const t = useEditorT('diagram')

  return {
    button: (
      <ToolbarButton
        key="insertDiagram"
        onClick={() => editor.dispatchCommand(INSERT_FABRIC_COMMAND, {})}
        tooltip={t('insertDiagram')}
        icon={<DiagramIcon />}
      />
    ),
  }
}

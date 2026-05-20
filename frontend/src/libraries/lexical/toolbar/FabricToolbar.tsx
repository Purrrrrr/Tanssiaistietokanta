import { LexicalEditor } from 'lexical'

import { ToolbarHookReturn } from './types'

import { useEditorT } from '../i18n'
import { INSERT_FABRIC_COMMAND } from '../plugins/FabricPlugin'
import { ToolbarButton } from './widgets'

function DiagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <ellipse cx="18" cy="6.5" rx="3" ry="3.5" />
      <polygon points="12,17 15,22 9,22" />
      <line x1="10" y1="6.5" x2="15" y2="6.5" />
      <line x1="14" y1="10" x2="12" y2="15" />
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

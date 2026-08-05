import { NodeAlignment } from '../../plugins/nodes/types'

import { useEditorT } from 'libraries/lexical/i18n'
import { ToolbarButton } from 'libraries/lexical/toolbar/widgets/ToolbarButton'
import { MenuButton } from 'libraries/ui'
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight,
} from 'libraries/ui/icons'

import { ImageFloatLeftIcon, ImageFloatRightIcon } from '../icons'

const alignments: NodeAlignment[] = ['left', 'center', 'right', 'fullWidth', 'floatLeft', 'floatRight']

export function AlignSelector({ align, onChange }: { align: NodeAlignment, onChange: (align: NodeAlignment) => void }) {
  const t = useEditorT('alignSelector')
  return <MenuButton buttonRenderer={props =>
    <ToolbarButton
      {...props}
      tooltip={t('align')}
      icon={<AlignIcon align={align} />}
    />

  }>
    {alignments.map(a =>
      <ToolbarButton
        key={a}
        onMouseDown={() => onChange(a)}
        tooltip={t(a)}
        icon={<AlignIcon align={a} />}
      />,
    )}
  </MenuButton>
}

function AlignIcon({ align }: { align: NodeAlignment }) {
  switch (align) {
    case 'left':
      return <AlignLeft />
    case 'center':
      return <AlignCenter />
    case 'right':
      return <AlignRight />
    case 'fullWidth':
      return <AlignJustify />
    case 'floatLeft':
      return <ImageFloatLeftIcon />
    case 'floatRight':
      return <ImageFloatRightIcon />
  }
}

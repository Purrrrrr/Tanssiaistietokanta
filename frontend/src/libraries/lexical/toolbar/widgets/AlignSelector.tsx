import { NodeAlignment } from '../../plugins/nodes/types'

import { useEditorT } from '@/libraries/lexical/i18n'
import { ToolbarButton } from '@/libraries/lexical/toolbar/widgets/ToolbarButton'
import { Icon, MenuButton } from '@/libraries/ui'

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
    <div>
      {alignments.map(a =>
        <ToolbarButton
          key={a}
          onMouseDown={() => onChange(a)}
          tooltip={t(a)}
          icon={<AlignIcon align={a} />}
        />,
      )}
    </div>
  </MenuButton>
}

function AlignIcon({ align }: { align: NodeAlignment }) {
  switch (align) {
    case 'left':
      return <Icon icon="alignLeft" />
    case 'center':
      return <Icon icon="alignCenter" />
    case 'right':
      return <Icon icon="alignRight" />
    case 'fullWidth':
      return <Icon icon="alignJustify" />
    case 'floatLeft':
      return <ImageFloatLeftIcon />
    case 'floatRight':
      return <ImageFloatRightIcon />
  }
}

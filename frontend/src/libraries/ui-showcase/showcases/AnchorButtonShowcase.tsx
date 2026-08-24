import { booleanProp, showcase } from '../types'

import { AnchorButton } from 'libraries/ui'
import { Trash } from 'libraries/ui/icons'

import { colors } from '../utils'
import { titleCase } from '../utils/titleCase'

export const anchorButtonShowcase = showcase({
  title: 'AnchorButton',
  props: {
    disabled: booleanProp(),
    minimal: booleanProp(),
    active: booleanProp(),
    icon: booleanProp({ default: true }),
  },
  render: ({ disabled, icon, minimal, active }) =>
    <div className="flex flex-wrap gap-2">
      {colors.map(color =>
        <AnchorButton key={color} href="#" color={color} minimal={minimal} icon={icon ? <Trash /> : undefined} active={active} aria-disabled={disabled}>{titleCase(color)}</AnchorButton>,
      )}
    </div>,
})

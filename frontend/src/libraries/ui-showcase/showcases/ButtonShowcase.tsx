import { booleanProp, showcase } from '../types'

import { Button } from 'libraries/ui'
import { Trash } from 'libraries/ui/icons'

import { colors } from '../utils'
import { titleCase } from '../utils/titleCase'

export const buttonShowcase = showcase({
  title: 'Button',
  props: {
    disabled: booleanProp(),
    minimal: booleanProp(),
    tooltip: booleanProp({ default: true }),
    icon: booleanProp({ default: true }),
  },
  render: ({ disabled, icon, minimal, tooltip }) =>
    <div className="flex gap-2">
      {colors.map(color =>
        <Button
          key={color}
          color={color}
          minimal={minimal}
          icon={icon ? <Trash /> : undefined}
          tooltip={tooltip ? 'A long tooltip' : undefined}
          disabled={disabled}>
          {titleCase(color)}
        </Button>,
      )}
    </div>,
})

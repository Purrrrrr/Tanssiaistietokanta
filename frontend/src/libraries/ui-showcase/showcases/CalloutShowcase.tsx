import { booleanProp, showcase } from '../types'

import { Callout } from 'libraries/ui'

import { colors } from '../utils'
import { titleCase } from '../utils/titleCase'

export const calloutShowcase = showcase({
  title: 'Callout',
  props: {
    title: booleanProp({ default: true }),
  },
  render: ({ title }) =>
    <div className="flex flex-col gap-2">
      {colors.map(color =>
        <Callout key={color} color={color} title={title ? titleCase(color) : undefined}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Callout>,
      )}
    </div>,
})

import { booleanProp, showcase } from '../types'

import { ColoredTag, TAG_COLOR_COUNT } from 'components/widgets/ColoredTag'

import { range } from '../utils'

export const coloredTagShowcase = showcase({
  title: 'Colored tag',
  props: {
    small: booleanProp(),
    tag: booleanProp(),
  },
  render: ({ small, tag }) => range(TAG_COLOR_COUNT).map(color =>
    <ColoredTag small={small} tag={tag ? String(color) : undefined} key={color} title={`Tag color ${color}`} color={color} />,
  ),
})

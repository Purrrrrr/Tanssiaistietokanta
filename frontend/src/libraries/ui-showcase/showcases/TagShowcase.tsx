import { booleanProp, numberProp, selectorProp, showcase } from '../types'

import { ItemList2 } from 'libraries/ui/ItemList2'
import { Tag } from 'libraries/ui/Tag'
import { defaultScheme, lightRainbow, rainbow } from 'libraries/ui/tagColorSchemes'

import { range } from '../utils'

const tagSchemes = ['lightRainbow', 'rainbow', 'default'] as const
export function TagShowcase({ small, tag, colors, nrColors, contrastDebug }: {
  small: boolean
  tag: boolean
  colors: (typeof tagSchemes)[number]
  nrColors: number
  contrastDebug?: boolean
}) {
  const schemes = {
    default: defaultScheme,
    lightRainbow: lightRainbow(nrColors),
    rainbow: rainbow(nrColors),
  }
  const colorScheme = schemes[colors]
  const indexes = range(colorScheme.colorCount)

  return <div>
    <p>Tags presented in a list to show the color scheme. Sort by random number for a more realistic distribution of values.</p>
    <ItemList2
      items={indexes.map(color => ({ _id: color }))}
      emptyText="No colors"
      columns={[
        {
          key: '_id',
          width: 'max-content',
          label: 'Color number',
          wrapLabeled: true,
        }, {
          key: 'Random number',
          width: 'max-content',
          label: 'Random number',
          wrapLabeled: true,
          sortableContent: () => Math.random().toFixed(3),
        }, {
          key: 'tag',
          label: 'Tag',
          sortBy: '_id',
          content: item =>
            <Tag
              debugContrast={contrastDebug}
              small={small}
              colorScheme={colorScheme}
              tag={tag ? String(item._id) : undefined}
              title="Some tag content"
              color={item._id} />,
        },
      ]}
    />
  </div>
}

TagShowcase.showCase = showcase({
  title: 'Colored tag 2',
  props: {
    small: booleanProp(),
    tag: booleanProp(),
    contrastDebug: booleanProp(),
    colors: selectorProp(tagSchemes),
    nrColors: numberProp({ default: 22, min: 1, max: 100 }),
  },
  render: props => <TagShowcase {...props} />,
})

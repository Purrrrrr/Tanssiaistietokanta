import { useMemo } from 'react'

import { booleanProp, numberProp, selectorProp, showcase } from '../types'

import { useMultipleSelection } from 'libraries/common/selection/useMultipleSelection'
import { ItemList } from 'libraries/ui'
import { Tag } from 'libraries/ui/Tag'
import { ColorScheme, defaultScheme, lightRainbow, rainbow, tailwindLight } from 'libraries/ui/tagColorSchemes'

import { range } from '../utils'

const tagSchemes = ['lightRainbow', 'rainbow', 'tailwindLight', 'default'] as const

export function TagShowcase({ selectable, small, tag, randomSorting, colors, nrColors, hueCorrection, contrastDebug }: {
  selectable: boolean
  small: boolean
  tag: boolean
  randomSorting: boolean
  colors: (typeof tagSchemes)[number]
  nrColors: number
  hueCorrection: number
  contrastDebug?: boolean
}) {
  const schemes = {
    default: defaultScheme,
    lightRainbow: lightRainbow(nrColors, hueCorrection),
    rainbow: rainbow(nrColors, hueCorrection),
    tailwindLight: tailwindLight,
  } satisfies Record<(typeof tagSchemes)[number], ColorScheme>
  const colorScheme = schemes[colors]
  const items = useMemo(() => {
    const indexes = range(colorScheme.colorCount)
    // eslint-disable-next-line react-hooks/purity
    return indexes.map(color => ({ _id: color, randomValue: Math.random().toFixed(3) }))
  }, [colorScheme.colorCount])
  const selection = useMultipleSelection(items)

  return <div>
    <p>Tags presented in a list to show the color scheme. Sort by random number for a more realistic distribution of values.</p>
    <ItemList
      selection={selectable ? selection : undefined}
      items={items}
      emptyText="No colors"
      columns={[
        {
          key: 'randomValue',
          width: 'max-content',
          label: 'Random number',
          wrapLabeled: true,
          enabled: randomSorting,
        }, {
          key: '_id',
          width: 'max-content',
          label: 'Color number',
          wrapLabeled: true,
        }, {
          key: 'tag',
          label: 'Tag',
          sortBy: '_id',
          content: item =>
            <Tag
              selected={selectable ? selection.selected.includes(item) : undefined}
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
    selectable: booleanProp(),
    small: booleanProp(),
    tag: booleanProp(),
    randomSorting: booleanProp(),
    contrastDebug: booleanProp(),
    colors: selectorProp(tagSchemes),
    nrColors: numberProp({ default: 22, min: 1, max: 100 }),
    hueCorrection: numberProp({ default: 0.03, step: 0.01 }),
  },
  render: props => <TagShowcase {...props} />,
})

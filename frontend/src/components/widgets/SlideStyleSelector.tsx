import { useId } from 'react'

import { SlideStyle, useEventSlideStyles } from 'services/events'

import { Select } from 'libraries/formsV2/components/inputs'
import { Button } from 'libraries/ui'
import { DoubleCaretVertical, Style } from 'libraries/ui/icons'
import { useT } from 'i18n'

interface SlideStyleSelectorProps {
  value: string | null | undefined
  onChange: (style: string | null) => unknown
  text: string
  inheritsStyles?: boolean
  inheritedStyleId?: string | null
  inheritedStyleName?: string
}

export function SlideStyleSelector({
  value, onChange, text, inheritsStyles = false, inheritedStyleId = undefined, inheritedStyleName = undefined,
}: SlideStyleSelectorProps) {
  const id = useId()
  const t = useT('common')
  const { styles, defaultStyle } = useEventSlideStyles({
    useStyleInheritance: inheritsStyles,
    inheritedStyleId,
    inheritedStyleName,
  })
  const style = styles.find(s => s.id === (value ?? null)) ?? defaultStyle
  return <Select<SlideStyle>
    filterable
    filterPlaceholder={t('search')}
    id={id}
    value={style}
    items={styles}
    itemToString={style => style.name}
    onChange={style => onChange(style.id)}
    itemIcon={style => style && <SlideStyleBox value={style} size={50} aspectRatio={16 / 9} />}
    buttonRenderer={(style, props) =>
      <Button
        {...props}
        icon={<SlideStyleBox value={style} />}
        rightIcon={<DoubleCaretVertical />}
      >
        {text}
      </Button>
    }
  />
}

function SlideStyleBox({ value: { styleName, color }, size = 20, aspectRatio = 1 }) {
  return <span
    style={{ height: size, width: size * aspectRatio, lineHeight: `${size - 4}px`, borderColor: color }}
    className={`slide-style-${styleName} text-center border inline-block`}>
    <Style size={12} color={color} />
  </span>
}

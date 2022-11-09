import React  from 'react'

import {defaultSlideStyle, SlideStyle, useEventSlideStyles} from 'services/events'

import {Selector} from 'libraries/forms'
import {Icon, MenuItem} from 'libraries/ui'

interface SlideStyleSelectorProps {
  value: string | null | undefined
  onChange: (style: string | null) => unknown
  text: string
  inheritsStyles?: boolean
  inheritedStyleId?: string | null
  inheritedStyleName?: string
}

export function SlideStyleSelector({
  value, onChange, text, inheritsStyles = false, inheritedStyleId = undefined, inheritedStyleName = undefined
} : SlideStyleSelectorProps) {
  const styles = useEventSlideStyles({
    useStyleInheritance: inheritsStyles,
    inheritedStyleId,
    inheritedStyleName,
  })
  const style = styles.find(s => s.id === (value ?? null)) ?? defaultSlideStyle
  return <Selector<SlideStyle>
    selectedItem={style}
    filterable
    items={styles}
    getItemText={item => <><SlideStyleBox value={item} size={50} aspectRatio={16/9} /> {item.name}</>}
    itemPredicate={(search, item) => item.name.toLowerCase().includes(search.toLowerCase())}
    itemRenderer={(text, item, {handleClick, index, modifiers: {active}}) =>
      <MenuItem key={item.id} roleStructure="listoption" text={text} onClick={handleClick} active={active} />
    }
    onSelect={(style) => onChange(style.id)}
    text={text}
    buttonProps={{icon: <SlideStyleBox value={style} />}}
  />
}

function SlideStyleBox({value: {styleName, color}, size = 20, aspectRatio = 1}) {
  return <span style={{height: size, width: size*aspectRatio, lineHeight: `${size - 4}px`, textAlign: 'center', border: `1px solid ${color}`, display: 'inline-block' }} className={`slide-style-${styleName}`}>
    <Icon icon="style" iconSize={12} color={color} />
  </span>
}

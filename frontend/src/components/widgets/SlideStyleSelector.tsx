import React  from 'react'
import {useEventSlideStyles, SlideStyle} from 'services/events'

import {Button, Icon, Select, MenuItem} from 'libraries/ui'
import {asFormControl} from 'libraries/forms2'

const StyleSelect = asFormControl(Select.ofType<SlideStyle>())

interface SlideStyleSelectorProps {
  value: string | null
  onSelect: (style: SlideStyle) => any
  text: string
  inheritsStyles?: boolean
  inheritedStyleId?: string | null
  inheritedStyleName?: string
}

export function SlideStyleSelector({
  value, onSelect, text, inheritsStyles = false, inheritedStyleId = undefined, inheritedStyleName = undefined
} : SlideStyleSelectorProps) {
  const styles = useEventSlideStyles({
    useStyleInheritance: inheritsStyles,
    inheritedStyleId,
    inheritedStyleName,
  })
  const style = styles.find(s => s.id === value) ?? styles.find(s => s.default === true)!
  return <StyleSelect
    key={value}
    {...{initialActiveItem: style}} /* initialActiveItem is not included in Select prop type but works */
    filterable={false}
    items={styles}
    itemRenderer={(item, {handleClick, index, modifiers: {active}}) => 
      <MenuItem key={item.id} roleStructure="listoption" icon={<SlideStyleBox value={item} />} text={item.name} onClick={handleClick} active={active} />
    }
    onItemSelect={onSelect}
  >
    <Button icon={<SlideStyleBox value={style} />} text={text} rightIcon="double-caret-vertical" />
  </StyleSelect>
}

function SlideStyleBox({value: {background, color}}) {
  return <span style={{height: 20, width: 20, lineHeight: '16px', textAlign: 'center', border: `1px solid ${color}`, display: 'inline-block', background }}>
    <Icon icon="style" iconSize={12} color={color} />
  </span>
}

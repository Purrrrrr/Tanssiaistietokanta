import { useId } from 'react'

import { useTranslation } from './i18n'

export interface SelectionBoxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  onChangeMultiple?: (checked: boolean) => void
}

export function SelectionBox({ checked, onChange, onChangeMultiple }: SelectionBoxProps) {
  const id = useId()

  // The label is used to make the checkbox easier to click, and the onClick handler is used to detect shift-clicks for multiple selection.
  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
  return <label
    htmlFor={id}
    className="rounded-sm p-2 -mx-1 -my-2 hover:bg-stone-800/10 [:has(:checked)]:hover:bg-sky-600/20 hover:*:not-checked:opacity-90 text-center"
    onClick={(e) => {
      if (isMultipleSelectionEvent(e.nativeEvent) && onChangeMultiple && e.target instanceof HTMLLabelElement) {
        e.preventDefault()
        onChangeMultiple(!checked)
      }
    }}
  >
    <span className="sr-only">{useTranslation('selectRow')}</span>
    <input
      className="accent-sky-700"
      id={id}
      type="checkbox"
      checked={checked}
      onChange={e => {
        if (isMultipleSelectionEvent(e.nativeEvent) && onChangeMultiple) {
          console.log('input click')
          onChangeMultiple(e.target.checked)
        } else {
          onChange(e.target.checked)
        }
      }}
    />
  </label>
}

const isMultipleSelectionEvent = (e: Event) => 'shiftKey' in e && e.shiftKey

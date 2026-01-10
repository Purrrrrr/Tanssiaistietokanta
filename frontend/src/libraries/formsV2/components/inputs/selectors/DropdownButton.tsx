import { type ReactNode } from 'react'
import { DoubleCaretVertical } from 'libraries/ui/icons'

import { DropdownButtonDownshiftProps, SelectorProps } from './types'

import { Button } from 'libraries/ui'

import { useFormTranslation } from '../../../localization'

export function DropdownButton<T>(
  props: { selectorProps: SelectorProps<T>, buttonProps: DropdownButtonDownshiftProps },
): ReactNode {
  const { buttonProps, selectorProps } = props
  const {
    'aria-label': label, readOnly,
    itemIcon, itemToString = String,
    value, buttonRenderer, placeholder,
  } = selectorProps
  const ariaLabel = useDropdownButtonLabel(itemToString(value), label)

  if (buttonRenderer) {
    return buttonRenderer(value, {
      disabled: readOnly,
      'aria-label': ariaLabel,
      ...buttonProps,
    })
  }

  return <Button
    {...buttonProps}
    active={buttonProps['aria-expanded']}
    aria-label={ariaLabel}
    disabled={readOnly}
    rightIcon={<DoubleCaretVertical />}
  >
    {itemIcon?.(value)}
    {itemToString(value) || placeholder}
  </Button>
}

function useDropdownButtonLabel(chosenValue: string, ariaLabel?: string) {
  const value = useFormTranslation('selector.value')
  const choose = useFormTranslation('selector.choose', { fieldName: ariaLabel ?? value })
  const chosen = useFormTranslation('selector.chosen', { value: chosenValue ?? '' })

  return `${choose}. ${chosenValue && chosen}`
}

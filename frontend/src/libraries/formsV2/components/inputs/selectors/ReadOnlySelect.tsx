import { SelectorProps } from './types'

import { DropdownContainer } from 'libraries/ui'

import { DropdownButton } from './DropdownButton'

export function ReadOnlySelect<T>({ containerClassname, ...props }: SelectorProps<T>) {
  return <DropdownContainer className={containerClassname}>
    <DropdownButton selectorProps={props} />
  </DropdownContainer>
}

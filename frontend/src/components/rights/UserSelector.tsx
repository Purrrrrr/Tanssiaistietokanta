import { useId } from 'react'

import { UserListItem as User } from 'types'

import { useUsers } from 'services/users'

import { FieldComponentProps } from 'libraries/forms'
import { AutocompleteInput } from 'libraries/formsV2/components/inputs'

export interface UserSelectorProps extends FieldComponentProps<User | null> {
  className?: string
  placeholder?: string
  excludeFromSearch?: Pick<User, '_id'>[]
  noResultsText?: string
}

export function UserSelector({
  id, value, onChange, readOnly, placeholder, className, excludeFromSearch, noResultsText,
}: UserSelectorProps) {
  const [users] = useUsers()
  const computedId = useId()

  const items = excludeFromSearch
    ? users.filter(user => !excludeFromSearch.some(excluded => excluded._id === user._id))
    : users

  return <AutocompleteInput<User | null>
    containerClassname={className}
    id={id ?? computedId}
    value={value ?? null}
    onChange={onChange}
    readOnly={readOnly}
    placeholder={placeholder}
    items={items}
    noResultsText={noResultsText}
    itemToString={user => user?.name ?? ''}
  />
}

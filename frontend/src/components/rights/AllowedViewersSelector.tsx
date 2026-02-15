import { useUsers } from 'services/users'

import { FieldComponentProps } from 'libraries/forms'
import { AutocompleteMultipleInput } from 'libraries/formsV2/components/inputs/selectors'
import { useT } from 'i18n'

export const AllowEveryone = 'everyone'
export const AllowLoggedIn = 'group:user'
export const allowUser = (userId: string) => `user:${userId}`

export default function AllowedViewersSelector({ value, ...props }: FieldComponentProps<string[]>) {
  const t = useT('domain.allowedViewers')
  const [users] = useUsers()
  const options = [
    { label: t('everyone'), value: AllowEveryone },
    { label: t('loggedIn'), value: AllowLoggedIn },
    ...users.map(u => ({ label: u.name, value: allowUser(u._id) })),
  ]
  return <AutocompleteMultipleInput<{ label: string, value: string }>
    id="test"
    items={options}
    value={value ? value.map(item => options.find(option => option.value == item) ?? { value: item, label: item }) : []}
    itemToString={option => option.label}
    onChange={changed => props.onChange(changed.map(item => item.value))}
    placeholder={t('add')}
    noResultsText={t('noUsers')}
  />
}

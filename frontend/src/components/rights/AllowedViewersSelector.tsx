import { FieldComponentProps, RadioGroup } from 'libraries/forms'
import { useT } from 'i18n'

export const AllowEveryone = 'everyone'
export const AllowLoggedIn = 'logged-in'
export const allowUser = (userId: string) => `user:${userId}`

export default function AllowedViewersSelector(props: FieldComponentProps<string[]>) {
  const t = useT('domain.allowedViewers')
  const value = props.value?.includes(AllowEveryone)
    ? AllowEveryone
    : AllowLoggedIn
  return <RadioGroup<string>
    {...props}
    value={value}
    onChange={val => props.onChange([val])}
    options={[
      { label: t('everyone'), value: AllowEveryone },
      { label: t('loggedIn'), value: AllowLoggedIn },
    ]}
  />
}

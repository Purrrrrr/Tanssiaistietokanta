import { GrantRole } from 'types/gql/graphql'

import { FieldComponentProps } from 'libraries/forms'
import { Select } from 'libraries/formsV2/components/inputs'
import { useT } from 'i18n'

export function EventRoleSelector({ value, ...props }: FieldComponentProps<GrantRole>) {
  const t = useT('components.grantEditor.roles')

  return (
    <Select<GrantRole>
      value={value ?? GrantRole.Viewer}
      items={[
        GrantRole.Organizer, GrantRole.Teacher, GrantRole.Viewer,
      ]}
      itemToString={t}
      {...props}
    />
  )
}

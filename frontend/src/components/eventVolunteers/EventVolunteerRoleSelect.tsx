import { EventRole } from 'types'

import { useEventRoles } from 'services/eventRoles'

import { FieldComponentProps } from 'libraries/forms'
import { Select } from 'libraries/formsV2/components/inputs'
import { useTranslation } from 'i18n'

export type EventRoleSelectorProps = FieldComponentProps<string | undefined>

export function EventVolunteerRoleSelector({
  value, onChange, ...rest
}: EventRoleSelectorProps) {
  const [roles] = useEventRoles()
  const allRoles = useTranslation('pages.events.volunteersPage.allRoles')

  return <Select<EventRole | null>
    {...rest}
    value={roles.find(role => role._id === value) ?? null}
    items={[null, ...roles]}
    onChange={role => onChange(role?._id ?? undefined)}
    itemToString={role => role?.name ?? allRoles}
  />
}

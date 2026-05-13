import { EventVolunteerRegistrationStatus } from 'types'

import { Select } from 'libraries/formsV2/components/inputs/selectors'
import { useT, useTranslation } from 'i18n'

const statuses: EventVolunteerRegistrationStatus[] = ['None', 'RegisteredToEventSystem', 'AcceptedRegistration', 'InformedToOrganizers']

export function RegistrationStatusSelector({ id, value, onChange, disabled }: {
  id: string
  value?: EventVolunteerRegistrationStatus
  onChange: (registrationStatus: EventVolunteerRegistrationStatus) => void
  disabled?: boolean
}) {
  const t = useT('domain.EventVolunteerAssignmentRegistrationStatus')
  const choose = useTranslation('components.volunteerAssignmentEditor.chooseStatus')
  return <Select<EventVolunteerRegistrationStatus | null>
    minimal
    id={id}
    readOnly={disabled}
    value={value ?? null}
    onChange={status => status && onChange(status)}
    items={value ? statuses : [null, ...statuses]}
    itemToString={status => status ? t(status) : choose}
  />
}

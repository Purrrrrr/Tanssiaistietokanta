import { EventVolunteerStatus } from 'types'

import { FieldComponentProps, RadioGroup } from 'libraries/forms'
import { useT } from 'i18n'

export function VolunteerStatusSelector(props: FieldComponentProps<EventVolunteerStatus>) {
  const t = useT('domain.eventVolunteer.EventVolunteerStatus')
  return (
    <RadioGroup<EventVolunteerStatus>
      options={['Interested', 'Accepted', 'CanWorkAsBackup', 'Rejected', 'Cancelled']}
      optionToString={t}
      {...props}
    />
  )
}

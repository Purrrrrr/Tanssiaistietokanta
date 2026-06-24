import { EventVolunteerStatus } from 'types'

import { FieldComponentProps, RadioGroup } from 'libraries/forms'
import { useT } from 'i18n'

import { statusIcons } from './VolunteerStatusSelector'

export function VolunteerStatusRadioGroup(props: FieldComponentProps<EventVolunteerStatus>) {
  const t = useT('domain.eventVolunteer.EventVolunteerStatus')
  return (
    <RadioGroup<EventVolunteerStatus>
      options={['Interested', 'Accepted', 'CanWorkAsBackup', 'Rejected', 'Cancelled']}
      optionIcon={status => statusIcons[status]}
      optionToString={t}
      {...props}
    />
  )
}

import { EventVolunteerStatus } from 'types'

import { FieldComponentProps, RadioGroup } from 'libraries/forms'
import { useT } from 'i18n'

export function VolunteerStatusSelector(props: FieldComponentProps<EventVolunteerStatus>) {
  const t = useT('domain.eventVolunteer.EventVolunteerStatus')
  return (
    <RadioGroup<EventVolunteerStatus>
      options={Object.values(EventVolunteerStatus)}
      optionToString={t}
      {...props}
    />
  )
}

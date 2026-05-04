import { EventVolunteer, EventVolunteerStatus } from 'types'

import { usePatchEventVolunteer } from 'services/eventVolunteers'

import { Select } from 'libraries/formsV2/components/inputs'
import { useT, useTranslation } from 'i18n'

interface VolunteerStatusBulkSelectorProps {
  id: string
  eventVolunteers: EventVolunteer[]
}

const items: (EventVolunteerStatus | null)[] = [
  null, 'Interested', 'Accepted', 'CanWorkAsBackup', 'Rejected', 'Cancelled',
]

export function VolunteerStatusBulkSelector({ id, eventVolunteers }: VolunteerStatusBulkSelectorProps) {
  const t = useT('domain.eventVolunteer.EventVolunteerStatus')
  const choose = useTranslation('common.choose')
  const [patchVolunteer] = usePatchEventVolunteer({ refetchQueries: ['getEventVolunteers'] })
  const commonValue = eventVolunteers.every(ev => ev.status === eventVolunteers[0].status) ? eventVolunteers[0].status : null

  return (
    <Select<EventVolunteerStatus | null>
      id={id}
      items={items}
      itemToString={value => value ? t(value) : choose}
      value={commonValue}
      onChange={status => {
        if (!status) return
        Promise.all(eventVolunteers.map(ev => patchVolunteer({
          id: ev._id,
          eventVolunteer: { status },
        })))
      }}
    />
  )
}

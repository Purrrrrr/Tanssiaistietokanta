import { EventVolunteer, EventVolunteerStatus } from 'types'

import { usePatchEventVolunteer } from 'services/eventVolunteers'

import { Select } from 'libraries/formsV2/components/inputs'
import { BlockedPerson, Cross, Envelope, Pin, Search } from 'libraries/ui/icons'
import { useT, useTranslation } from 'i18n'

interface VolunteerStatusSelectorProps {
  id: string
  eventVolunteers: EventVolunteer[]
  iconOnly?: boolean
}

export const statusIcons: Record<EventVolunteerStatus, React.ReactNode> = {
  Interested: <Search className="text-blue-500" />,
  Accepted: <Pin className="text-green-600" />,
  CanWorkAsBackup: <Envelope className="text-stone-500" />,
  Rejected: <BlockedPerson className="text-red-800" />,
  Cancelled: <Cross className="text-yellow-600" />,
}

const items: EventVolunteerStatus[] = [
  'Interested', 'Accepted', 'CanWorkAsBackup', 'Rejected', 'Cancelled',
]

export function VolunteerStatusSelector({ id, eventVolunteers, iconOnly }: VolunteerStatusSelectorProps) {
  const t = useT('domain.eventVolunteer.EventVolunteerStatus')
  const choose = useTranslation('common.choose')
  const [patchVolunteer] = usePatchEventVolunteer({ refetchQueries: ['getEventVolunteers'] })
  const commonValue = eventVolunteers.every(ev => ev.status === eventVolunteers[0].status) ? eventVolunteers[0].status : null

  return (
    <Select<EventVolunteerStatus | null>
      id={id}
      items={items}
      placeholder={iconOnly ? undefined : choose}
      itemToString={value => value ? t(value) : choose}
      minimal={iconOnly}
      itemIcon={status => status ? statusIcons[status] : null}
      value={commonValue}
      selectedItemRenderer={iconOnly ? () => null : undefined}
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

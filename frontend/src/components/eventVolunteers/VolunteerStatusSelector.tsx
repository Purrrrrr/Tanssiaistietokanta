import { EventVolunteer, EventVolunteerStatus } from '@/types'

import { usePatchEventVolunteer } from '@/services/eventVolunteers'

import { Select } from '@/libraries/formsV2/components/inputs'
import { Icon, type IconContent } from '@/libraries/ui'
import { useT, useTranslation } from '@/i18n'

interface VolunteerStatusSelectorProps {
  id: string
  eventVolunteers: EventVolunteer[]
  iconOnly?: boolean
}

export const statusIcons: Record<EventVolunteerStatus, IconContent> = {
  Interested: <Icon icon="search" className="text-blue-500" />,
  Accepted: <Icon icon="pin" className="text-green-600" />,
  CanWorkAsBackup: <Icon icon="envelope" className="text-stone-500" />,
  Rejected: <Icon icon="blockedPerson" className="text-red-800" />,
  Cancelled: <Icon icon="cross" className="text-yellow-600" />,
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

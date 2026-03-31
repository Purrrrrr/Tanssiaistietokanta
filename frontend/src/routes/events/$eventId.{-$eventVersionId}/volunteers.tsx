import { createFileRoute } from '@tanstack/react-router'

import { useEventVolunteers } from 'services/eventVolunteers'

import { H2 } from 'libraries/ui'
import { ItemList } from 'libraries/ui/ItemList'
import { DeleteEventVolunteerButton } from 'components/eventVolunteers/DeleteEventVolunteerButton'
import { EventVolunteerForm } from 'components/eventVolunteers/EventVolunteerForm'
import { useT } from 'i18n'

import { useCurrentEvent } from './-context'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/volunteers',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const event = useCurrentEvent()
  const t = useT('pages.events.volunteersPage')

  const [eventVolunteers] = useEventVolunteers({ eventId: event._id })

  return <>
    <H2>{t('title')}</H2>
    <ItemList
      items={eventVolunteers ?? []}
      emptyText={t('noVolunteers')}
      columns="grid-cols-[1fr_1fr_1fr_1fr_max-content]"
    >
      <ItemList.Header>
        <span>{t('columns.name')}</span>
        <span>{t('columns.interestedIn')}</span>
        <span>{t('columns.wishes')}</span>
        <span>{t('columns.notes')}</span>
        <span />
      </ItemList.Header>
      {(eventVolunteers ?? []).map(ev =>
        <ItemList.Row key={ev._id}>
          <span>{ev.volunteer.name}</span>
          <span>{ev.interestedIn.join(', ')}</span>
          <span>{ev.wishes}</span>
          <span>{ev.notes}</span>
          <DeleteEventVolunteerButton minimal eventVolunteerId={ev._id} />
        </ItemList.Row>,
      )}
    </ItemList>
    <EventVolunteerForm eventId={event._id} />
  </>
}

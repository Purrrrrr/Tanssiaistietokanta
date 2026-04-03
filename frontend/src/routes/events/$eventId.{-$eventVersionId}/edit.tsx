import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'

import { Event } from 'types'

import { useDeleteEvent, usePatchEvent } from 'services/events'

import { DateField, DateRangeField, formFor, patchStrategy, SyncStatus, useAutosavingState } from 'libraries/forms'
import { H2 } from 'libraries/ui'
import { JSONPatch } from 'components/event/EventProgramForm/patchStrategy'
import { EventGrantsEditor } from 'components/rights/EventGrantsEditor'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

import { useCurrentEvent } from './-context'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/edit',
)({
  component: RouteComponent,
  staticData: {
    requireRights: ({ eventId }) => ({
      rights: 'events:read',
      entityId: eventId,
    }),
  },
})

const {
  Input,
  Form,
} = formFor<Event>()

function RouteComponent() {
  const event = useCurrentEvent()
  const t = useT('routes.events.event.edit')
  const label = useT('domain.event')
  const navigate = Route.useNavigate()
  const [deleteEvent] = useDeleteEvent({
    refetchQueries: ['getEvents'],
    onCompleted: () => navigate({ to: '/' }),
  })

  const [patchEvent] = usePatchEvent()
  const patch = useCallback(
    (eventPatch: JSONPatch) => patchEvent({ id: event._id, event: eventPatch }),
    [event._id, patchEvent],
  )
  const { state, formProps } = useAutosavingState<Event, JSONPatch>(event, patch, patchStrategy.jsonPatch)

  return <Form {...formProps}>
    <SyncStatus state={state} floatRight />
    <H2>{t('title')}</H2>
    <div className="flex flex-wrap gap-6">
      <Input label={label('name')} path="name" required containerClassName="w-100" />
      <DateRangeField<Event>
        id="eventDate"
        label={label('eventDate')}
        beginPath="beginDate"
        endPath="endDate"
        required
      />
      <DateField<Event>
        label={(label('ballDateTime'))}
        path="program.dateTime"
        showTime
        minDate={formProps.value.beginDate}
        maxDate={formProps.value.endDate}
      />
    </div>
    <EventGrantsEditor eventId={event._id} />
    <DeleteButton
      requireRight="events:delete"
      entityId={event._id}
      onDelete={() => deleteEvent({ id: event._id })}
      text={t('deleteEvent')}
      confirmText={t('eventDeleteConfirmation', { eventName: event.name })}
    />
  </Form>
}

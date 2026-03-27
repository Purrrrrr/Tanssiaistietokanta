import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { EventInput } from 'types'
import { GrantRole, ViewAccess } from 'types/gql/graphql'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateEvent } from 'services/events'
import { useCurrentUser } from 'services/users'

import { DateRangeField, formFor, SubmitButton } from 'libraries/forms'
import { PageTitle } from 'components/PageTitle'
import { EventGrantsEditor } from 'components/rights/EventGrantsEditor'
import { useT } from 'i18n'
import { guid } from 'utils/guid'

const {
  Form,
  Input,
} = formFor<EventInput>()

export const Route = createFileRoute('/events/new')({
  component: CreateEventForm,
  staticData: {
    requireRights: 'events:create',
    breadcrumb: 'pages.events.createEvent.newEventBreadcrumb',
  },
})

function CreateEventForm() {
  const t = useT('pages.events.createEvent')
  const navigate = Route.useNavigate()
  const currentUser = useCurrentUser()
  const [createEvent] = useCreateEvent({
    onCompleted: (data) => navigate({ to: '/events/$eventId/{-$eventVersionId}', params: { eventId: data.createEvent._id } }),
    refetchQueries: ['getEvents'],
  })

  const initialGrants = currentUser
    ? [{ _id: guid(), principal: `user:${currentUser._id}`, role: GrantRole.Organizer }]
    : []

  const [event, setEvent] = useState<EventInput>({
    name: '',
    beginDate: '',
    endDate: '',
    accessControl: { viewAccess: ViewAccess.Public, grants: initialGrants },
  })

  return <>
    <PageTitle>{t('newEvent')}</PageTitle>
    <Form labelStyle="above" value={event} onChange={setEvent} onSubmit={() => addGlobalLoadingAnimation(createEvent({ event }))} errorDisplay="onSubmit">
      <div className="flex gap-3">
        <Input label={t('name')} path="name" required containerClassName="w-60" />
        <DateRangeField<EventInput>
          id="eventDate"
          label={t('eventDate')}
          beginPath="beginDate"
          endPath="endDate"
          required
        />
      </div>
      <EventGrantsEditor />
      <SubmitButton text={t('create')} />
    </Form>
  </>
}

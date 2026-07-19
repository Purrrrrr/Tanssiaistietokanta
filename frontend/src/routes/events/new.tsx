import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { Ballroom, EventInput } from 'types'
import { EventGrantRole, ViewAccess } from 'types/gql/graphql'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateEvent } from 'services/events'
import { useCurrentUser } from 'services/users'

import { DateRangeField, formFor, SubmitButton } from 'libraries/forms'
import { BallroomSelect } from 'components/ballroom/BallroomSelect'
import { EventRegistrationSystemSelector } from 'components/event/EventRegistrationSystemSelector'
import { Page } from 'components/Page'
import { EventGrantsEditor } from 'components/rights/EventGrantsEditor'
import { useT } from 'i18n'
import randomId from 'utils/randomId'

interface FormData extends EventInput {
  ballroom: Ballroom | null
}

const {
  Form,
  Input,
  Field,
} = formFor<FormData>()

export const Route = createFileRoute('/events/new')({
  component: CreateEventForm,
  staticData: {
    requireRights: 'events:create',
    breadcrumb: 'routes.events.new.newEventBreadcrumb',
  },
})

function CreateEventForm() {
  const t = useT('routes.events.new')
  const label = useT('domain.event')
  const navigate = Route.useNavigate()
  const currentUser = useCurrentUser()
  const [createEvent] = useCreateEvent({
    onCompleted: (data) => navigate({ to: '/events/$eventId/{-$eventVersionId}', params: { eventId: data.createEvent._id } }),
    refetchQueries: ['getEvents'],
  })

  const initialGrants = currentUser
    ? [{ _id: randomId(), principal: `user:${currentUser._id}`, role: EventGrantRole.Organizer }]
    : []

  const [event, setEvent] = useState<FormData>({
    name: '',
    beginDate: '',
    endDate: '',
    accessControl: { viewAccess: ViewAccess.Public, grants: initialGrants },
    eventRegistrationSystem: 'None',
    ballroom: null,
  })

  return <Page title={t('newEvent')}>
    <Form
      labelStyle="above"
      value={event}
      onChange={setEvent}
      onSubmit={() => {
        const { ballroom, ...eventWithoutBallroom } = event
        addGlobalLoadingAnimation(createEvent({
          event: {
            ...eventWithoutBallroom,
            ballroomId: ballroom?._id ?? null,
          },
        }))
      }}
      errorDisplay="onSubmit">
      <div className="flex gap-3">
        <Input label={label('name')} path="name" required containerClassName="w-60" />
        <DateRangeField<EventInput>
          id="eventDate"
          label={label('eventDate')}
          beginPath="beginDate"
          endPath="endDate"
          required
        />
      </div>
      <Field
        label={label('ballroom')}
        path="ballroom"
        component={BallroomSelect}
      />
      <Field
        label={label('eventRegistrationSystem')}
        path="eventRegistrationSystem"
        component={EventRegistrationSystemSelector}
      />
      <EventGrantsEditor />
      <SubmitButton text={t('create')} />
    </Form>
  </Page>
}

import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { EventInput } from 'types'
import { GrantRole, ViewAccess } from 'types/gql/graphql'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateEvent } from 'services/events'
import { useCurrentUser } from 'services/users'

import { DateRangeField, formFor, SubmitButton } from 'libraries/forms'
import { Breadcrumb } from 'libraries/ui'
import { PageTitle } from 'components/PageTitle'
import { EventGrantsEditor } from 'components/rights/EventGrantsEditor'
import { RequirePermissions } from 'components/rights/RequirePermissions'
import { useT } from 'i18n'
import { guid } from 'utils/guid'

const {
  Form,
  Input,
} = formFor<EventInput>()

export const Route = createFileRoute('/events/new')({
  component: CreateEventForm,
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
    <Breadcrumb to={Route.to} text={t('newEventBreadcrumb')} />
    <PageTitle>{t('newEvent')}</PageTitle>
    <RequirePermissions requireRight="events:create" fallback="loginPage">
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
          <EventGrantsEditor />
        </div>
        <SubmitButton text={t('create')} />
      </Form>
    </RequirePermissions>
  </>
}

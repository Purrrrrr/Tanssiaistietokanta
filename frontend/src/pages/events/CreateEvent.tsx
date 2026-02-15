import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { EventInput } from 'types'
import { GrantRole, ViewAccess } from 'types/gql/graphql'

import { useCreateEvent } from 'services/events'
import { useCurrentUser } from 'services/users'

import { DateRangeField, formFor, SubmitButton } from 'libraries/forms'
import { Breadcrumb } from 'libraries/ui'
import { useGlobalLoadingAnimation } from 'components/LoadingState'
import { PageTitle } from 'components/PageTitle'
import { EventGrantsEditor } from 'components/rights/EventGrantsEditor'
import { RequirePermissions } from 'components/rights/RequirePermissions'
import { useT } from 'i18n'
import { guid } from 'utils/guid'

const {
  Form,
  Input,
} = formFor<EventInput>()

export default function CreateEventForm() {
  const t = useT('pages.events.createEvent')
  const navigate = useNavigate()
  const addLoadingAnimation = useGlobalLoadingAnimation()
  const currentUser = useCurrentUser()
  const [createEvent] = useCreateEvent({
    onCompleted: (data) => navigate('/events/' + data.createEvent._id),
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
    <Breadcrumb text={t('newEventBreadcrumb')} />
    <PageTitle>{t('newEvent')}</PageTitle>
    <RequirePermissions requireRight="events:create" fallback="loginPage">
      <Form labelStyle="above" value={event} onChange={setEvent} onSubmit={() => addLoadingAnimation(createEvent({ event }))} errorDisplay="onSubmit">
        <div className="flexz gap-3">
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

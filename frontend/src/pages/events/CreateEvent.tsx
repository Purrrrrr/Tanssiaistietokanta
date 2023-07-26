import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'

import {useCreateEvent} from 'services/events'
import {AdminOnly} from 'services/users'

import {formFor, SubmitButton} from 'libraries/forms'
import {Breadcrumb} from 'libraries/ui'
import {useGlobalLoadingAnimation} from 'components/LoadingState'
import {PageTitle} from 'components/PageTitle'
import {makeTranslate} from 'utils/translate'

const t = makeTranslate({
  newEventBreadcrumb: 'Uusi tapahtuma',
  newEvent: 'Luo uusi tapahtuma',
  create: 'Luo',
  name: 'Nimi',
})

const {
  Form,
  Input,
} = formFor<{name: string}>()

export default function CreateEventForm() {
  const navigate = useNavigate()
  const addLoadingAnimation = useGlobalLoadingAnimation()
  const [createEvent] = useCreateEvent({
    onCompleted: (data) => navigate('/events/'+data.createEvent._id),
    refetchQueries: ['getEvents']
  })
  const [event, setEvent] = useState({name: ''})

  return <AdminOnly>
    <Breadcrumb text={t`newEventBreadcrumb`} />
    <PageTitle>{t`newEvent`}</PageTitle>
    <Form value={event} onChange={setEvent} onSubmit={() => addLoadingAnimation(createEvent({event}))}>
      <div>
        <Input label={t`name`} path="name" required />
      </div>
      <SubmitButton text={t`create`} />
    </Form>
  </AdminOnly>
}

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
  beginDate: 'Tapahtuman alkaa',
  endDate: 'Tapahtuma loppuu',
})

const {
  Form,
  Input,
} = formFor<{name: string, beginDate: string, endDate: string}>()

export default function CreateEventForm() {
  const navigate = useNavigate()
  const addLoadingAnimation = useGlobalLoadingAnimation()
  const [createEvent] = useCreateEvent({
    onCompleted: (data) => navigate('/events/'+data.createEvent._id),
    refetchQueries: ['getEvents']
  })
  const [event, setEvent] = useState({name: '', beginDate: '', endDate: ''})

  return <AdminOnly>
    <Breadcrumb text={t`newEventBreadcrumb`} />
    <PageTitle>{t`newEvent`}</PageTitle>
    <Form value={event} onChange={setEvent} onSubmit={() => addLoadingAnimation(createEvent({event}))}>
      <div>
        <Input label={t`name`} path="name" required />
        <Input label={t`beginDate`} path="beginDate" required />
        <Input label={t`endDate`} path="endDate" required />
      </div>
      <SubmitButton text={t`create`} />
    </Form>
  </AdminOnly>
}

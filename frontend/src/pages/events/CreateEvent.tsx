import {useState} from 'react'
import {useNavigate} from 'react-router-dom'

import {useCreateEvent} from 'services/events'
import {AdminOnly} from 'services/users'

import {DateRangeField, formFor, SubmitButton} from 'libraries/forms'
import {Breadcrumb} from 'libraries/ui'
import {useGlobalLoadingAnimation} from 'components/LoadingState'
import {PageTitle} from 'components/PageTitle'
import {useT} from 'i18n'

interface EventForm {
  name: string
  beginDate: string
  endDate: string
}

const {
  Form,
  Input,
} = formFor<EventForm>()

export default function CreateEventForm() {
  const t = useT('pages.events.createEvent')
  const navigate = useNavigate()
  const addLoadingAnimation = useGlobalLoadingAnimation()
  const [createEvent] = useCreateEvent({
    onCompleted: (data) => navigate('/events/'+data.createEvent._id),
    refetchQueries: ['getEvents']
  })
  const [event, setEvent] = useState({name: '', beginDate: '', endDate: ''})

  return <AdminOnly>
    <Breadcrumb text={t('newEventBreadcrumb')} />
    <PageTitle>{t('newEvent')}</PageTitle>
    <Form labelStyle="beside" value={event} onChange={setEvent} onSubmit={() => addLoadingAnimation(createEvent({event}))}>
      <div className="flex gap-6">
        <Input label={t('name')} path="name" required containerClassName="w-100"/>
        <DateRangeField<EventForm>
          id="eventDate"
          label={t('eventDate')}
          beginPath="beginDate"
          endPath="endDate"
          required
        />
      </div>
      <SubmitButton text={t('create')} />
    </Form>
  </AdminOnly>
}

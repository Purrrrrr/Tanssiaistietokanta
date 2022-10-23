import React from 'react'
import {useNavigate} from 'react-router-dom'

import {AdminOnly} from 'services/users'
import {useCreateWorkshop} from 'services/workshops'

import {Breadcrumb} from 'libraries/ui'
import {PageTitle} from 'components/PageTitle'
import {WorkshopEditor} from 'components/WorkshopEditor'
import {makeTranslate} from 'utils/translate'

const t = makeTranslate({
  create: 'Tallenna',
  newWorkshop: 'Uusi työpaja',
})

export default function CreateWorkshopForm({event}) {
  const navigate = useNavigate()
  const workshop = {
    _id: '',
    name: '',
    dances: []
  }
  const [createWorkshop] = useCreateWorkshop({
    onCompleted: () => navigate('/events/'+event._id),
    refetchQueries: ['getEvent']
  })

  return <AdminOnly>
    <Breadcrumb text={t`newWorkshop`} />
    <PageTitle>{t`newWorkshop`}</PageTitle>
    <WorkshopEditor
      eventId={event._id}
      workshop={workshop}
      onSubmit={(workshop) => createWorkshop({eventId: event._id, workshop})}
      submitText={t`create`}
    />
  </AdminOnly>
}

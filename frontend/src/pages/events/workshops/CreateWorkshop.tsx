import {useCreateWorkshop} from 'services/workshops'
import React from 'react'

import {AdminOnly} from 'services/users'
import {Breadcrumb} from 'libraries/ui'
import {PageTitle} from 'components/PageTitle'
import {WorkshopEditor} from 'components/WorkshopEditor'
import {makeTranslate} from 'utils/translate'
import {useNavigate} from 'react-router-dom'

const t = makeTranslate({
  create: 'Tallenna',
  newWorkshop: 'Uusi työpaja',
})

export default function CreateWorkshopForm({event}) {
  const navigate = useNavigate()
  const workshop = {
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
    <WorkshopEditor eventId={event._id} workshop={workshop} onSubmit={(workshop) => createWorkshop(event._id, workshop)} submitText={t`create`} />
  </AdminOnly>
}

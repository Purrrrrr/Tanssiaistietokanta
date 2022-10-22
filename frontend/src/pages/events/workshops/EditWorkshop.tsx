import {useWorkshop, useModifyWorkshop } from 'services/workshops'
import {Workshop} from 'types'
import React  from 'react'
import {useParams} from 'react-router-dom'

import {AdminOnly} from 'services/users'
import {Breadcrumb} from 'libraries/ui'
import {PageTitle} from 'components/PageTitle'
import {WorkshopEditor} from 'components/WorkshopEditor'
import {LoadingState} from 'components/LoadingState'
import {makeTranslate} from 'utils/translate'
import {useNavigate} from 'react-router-dom'

const t = makeTranslate({
  save: 'Tallenna',
})

export default function EditWorkshopPage({event}) {
  const {workshopId} = useParams()
  const [workshop, loadingState] = useWorkshop(workshopId)

  return <AdminOnly>
    <Breadcrumb text={workshop ? workshop.name : '...'} />
    {workshop ?
      <WorkshopForm workshop={workshop} /> :
      <LoadingState {...loadingState} />
    }
  </AdminOnly>
}


function WorkshopForm({workshop}: {workshop: Workshop}) {
  const navigate = useNavigate()
  const [modifyWorkshop] = useModifyWorkshop({
    onCompleted: () => navigate('/events/'+workshop.eventId),
    refetchQueries: ['getEvent']
  })

  return <>
    <PageTitle>{workshop.name}</PageTitle>
    <WorkshopEditor eventId={workshop.eventId} workshop={workshop} onSubmit={(data) => modifyWorkshop({id: workshop._id, workshop: data})} submitText={t`save`} />
  </>
}

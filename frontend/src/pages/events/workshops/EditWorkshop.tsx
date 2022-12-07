import React  from 'react'
import {useParams} from 'react-router-dom'

import {AdminOnly} from 'services/users'
import {useWorkshop } from 'services/workshops'

import {Breadcrumb} from 'libraries/ui'
import {LoadingState} from 'components/LoadingState'
import {PageTitle} from 'components/PageTitle'
import {WorkshopEditor} from 'components/WorkshopEditor'

import {Workshop} from 'types'

export default function EditWorkshopPage() {
  const {workshopId} = useParams<'workshopId'>()
  const [workshop, loadingState] = useWorkshop(workshopId ?? '')

  return <AdminOnly>
    <Breadcrumb text={workshop ? workshop.name : '...'} />
    {workshop ?
      <WorkshopForm workshop={workshop} /> :
      <LoadingState {...loadingState} />
    }
  </AdminOnly>
}


function WorkshopForm({workshop}: {workshop: Workshop}) {
  return <>
    <PageTitle>{workshop.name}</PageTitle>
    <WorkshopEditor workshop={workshop} />
  </>
}

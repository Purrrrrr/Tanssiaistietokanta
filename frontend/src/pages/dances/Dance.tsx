import React from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'

import { useDance } from 'services/dances'

import {Breadcrumb, Icon} from 'libraries/ui'
import {LoadingState} from 'components/LoadingState'
import {PageTitle} from 'components/PageTitle'

import {DanceEditor} from './DanceEditor'

export default function DancePage() {
  const navigate = useNavigate()
  const {danceId} = useParams()
  const result = useDance({id: danceId ?? ''})

  if (!result.data?.dance) return <LoadingState {...result} />

  const {dance} = result.data

  return <>
    <Breadcrumb text={dance.name} />
    <PageTitle noRender>{dance.name}</PageTitle>
    <p style={{margin: '10px 0'}}>
      <Link to=".."><Icon icon="arrow-left"/>Takaisin tanssilistaan</Link>
    </p>
    <DanceEditor titleComponent={'h1'} dance={dance} onDelete={() => { navigate('..')}}  />
  </>
}

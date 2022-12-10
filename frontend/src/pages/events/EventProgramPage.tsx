import React from 'react'
import {Link} from 'react-router-dom'

import {AdminOnly} from 'services/users'

import {Breadcrumb, Icon} from 'libraries/ui'
import {EventProgramEditor} from 'components/EventProgramEditor'
import {PageTitle} from 'components/PageTitle'

import {Event} from 'types'

export default function EventProgramEditorPage({event}: {event: Event}) {
  return <AdminOnly fallback="you need to be admin">
    <Breadcrumb text="Tanssiaisohjelma" />
    <p style={{margin: '10px 0'}}>
      <Link to=".."><Icon icon="arrow-left"/>Takaisin tapahtuman tietoihin</Link>
    </p>
    <PageTitle>Muokkaa tanssiaisohjelmaa</PageTitle>
    <EventProgramEditor eventId={event._id} program={event.program} />
  </AdminOnly>
}

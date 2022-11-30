import React from 'react'
import {useNavigate} from 'react-router-dom'
import * as L from 'partial.lenses'

import {useModifyEventProgram} from 'services/events'
import {AdminOnly} from 'services/users'

import {Breadcrumb} from 'libraries/ui'
import {EventProgramEditor} from 'components/EventProgramEditor'
import {EventProgramRow, EventProgramSettings} from 'components/EventProgramEditor/types'
import {PageTitle} from 'components/PageTitle'
import {removeTypenames} from 'utils/removeTypenames'

import {Event} from 'types'

export default function EventProgramEditorPage({event}: {event: Event}) {
  const navigate = useNavigate()
  const [modifyEventProgram] = useModifyEventProgram({
    onCompleted: () => navigate('/events/'+event._id)
  })

  return <AdminOnly fallback="you need to be admin">
    <Breadcrumb text="Tanssiaisohjelma" />
    <PageTitle>Muokkaa tanssiaisohjelmaa</PageTitle>
    <EventProgramEditor
      program={event.program}
      onSubmit={(program) => modifyEventProgram({id: event._id, program: toProgramInput(program)})}
    />
  </AdminOnly>
}

function toProgramInput({introductions, danceSets, ...rest} : EventProgramSettings) {
  return removeTypenames({
    introductions: L.modify(
      ['program', L.elems], toProgramItemInput, introductions
    ),
    danceSets: L.modify(
      [L.elems, 'program', L.elems], toProgramItemInput, danceSets
    ),
    ...rest,
  })
}

function toProgramItemInput({_id, slideStyleId, item: {__typename, ...item}} : EventProgramRow) {
  const commonProps = {_id, slideStyleId, type: __typename}
  switch(__typename) {
    case 'Dance':
      return {
        ...commonProps,
        dance: item._id
      }
    case 'RequestedDance':
      return commonProps
    case 'EventProgram':
      return {
        ...commonProps,
        eventProgram: item,
      }
    default:
      throw new Error('Unexpected program item type '+__typename)
  }
}

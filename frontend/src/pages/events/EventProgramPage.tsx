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
      program={toEventProgramSettings(event.program)}
      onSubmit={(program) => modifyEventProgram({id: event._id, program: toProgramInput(program)})}
    />
  </AdminOnly>
}

function toEventProgramSettings(
  program : Event['program'],
): EventProgramSettings {
  const {introductions = [], danceSets = [], slideStyleId = null} = program ?? {}
  return {
    introductions: { program: introductions, intervalMusicDuration: 0 },
    danceSets,
    slideStyleId
  }
}

function toProgramInput({introductions, danceSets, slideStyleId} : EventProgramSettings) {
  return removeTypenames({
    introductions: introductions.program.map(toProgramItemInput),
    danceSets: L.modify(
      [L.elems, 'program', L.elems], toProgramItemInput, danceSets
    ),
    slideStyleId,
  })
}

function toProgramItemInput({_id, slideStyleId, item: {__typename, ...item}} : EventProgramRow) {
  const commonProps = {_id, slideStyleId, type: __typename}
  switch(__typename) {
    case 'Dance':
      return {
        ...commonProps,
        dance: { danceId: item._id}
      }
    case 'RequestedDance':
      return {
        ...commonProps,
        requestedDance: {}
      }
    case 'EventProgram':
    {
      const {_id: eventProgramId, ...eventProgram} = item
      return {
        ...commonProps,
        eventProgram: { eventProgramId, eventProgram }
      }
    }
    default:
      throw new Error('Unexpected program item type '+__typename)
  }
}

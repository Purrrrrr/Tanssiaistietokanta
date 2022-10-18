import * as L from 'partial.lenses'

import React from 'react'

import {EventProgramSettings, DanceSet, EventProgramRow} from 'components/EventProgramEditor/types'

import {AdminOnly} from 'services/users'
import {Breadcrumb} from 'libraries/ui'
import {EventProgramEditor} from 'components/EventProgramEditor'
import {PageTitle} from 'components/PageTitle'
import {useNavigate} from 'react-router-dom'
import {removeTypenames} from 'utils/removeTypenames'
import {useModifyEventProgram} from 'services/events'

export default function EventProgramEditorPage({event}) {
  const navigate = useNavigate()
  const [modifyEventProgram] = useModifyEventProgram({
    onCompleted: () => navigate('/events/'+event._id)
  })

  return <AdminOnly fallback="you need to be admin">
    <Breadcrumb text="Tanssiaisohjelma" />
    <PageTitle>Muokkaa tanssiaisohjelmaa</PageTitle>
    <EventProgramEditor
      program={toEventProgramSettings(event.program ?? { introductions: [], danceSets: [], slideStyleId: null})}
      onSubmit={(program) => modifyEventProgram(event._id, toProgramInput(program))}
    />
  </AdminOnly>
}

function toEventProgramSettings(
  {introductions, danceSets, slideStyleId} : {introductions: EventProgramRow[], danceSets: DanceSet[], slideStyleId: string | null},
): EventProgramSettings {
  return {
    introductions: { program: introductions, isIntroductionsSection: true, intervalMusicDuration: 0 },
    danceSets: (danceSets).map(set => ({...set, isIntroductionsSection: false})),
    slideStyleId
  } 
}

function toProgramInput({introductions, danceSets, slideStyleId} : EventProgramSettings) {
  return removeTypenames({
    introductions: introductions.program.map(toIntroductionInput),
    danceSets: L.modify(
      [L.elems, 'program', L.elems], toProgramItemInput, danceSets
    ).map(({isIntroductionsSection, ...d}) => d),
    slideStyleId,
  })
}

function toIntroductionInput({ _id, item: { _id: eventProgramId, ...rest}, slideStyleId}: EventProgramRow) {
  return { _id, eventProgramId, eventProgram: rest, slideStyleId }
}

function toProgramItemInput({_id, slideStyleId, item: {__typename, _id: itemId, ...rest}} : EventProgramRow) {
  switch(__typename) {
    case 'Dance':
    case 'RequestedDance':
      if (!itemId) return {type: 'REQUESTED_DANCE', slideStyleId, _id}
      return {
        _id,
        type: 'DANCE',
        danceId: itemId,
        slideStyleId,
      }
    case 'EventProgram':
      return {
        _id,
        type: 'EVENT_PROGRAM',
        eventProgramId: itemId,
        eventProgram: rest,
        slideStyleId,
      }
    default:
      throw new Error('Unexpected program item type '+__typename)
  }
}

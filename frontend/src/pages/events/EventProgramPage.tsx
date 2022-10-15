import * as L from 'partial.lenses';

import React from 'react';

import {EventProgramSettings, DanceSet, EventProgram, EventProgramItem} from "components/EventProgramEditor/types";

import {AdminOnly} from 'services/users';
import {Breadcrumb} from "libraries/ui";
import {EventProgramEditor} from "components/EventProgramEditor";
import {PageTitle} from "components/PageTitle";
import {useNavigate} from "react-router-dom"
import {removeTypenames} from 'utils/removeTypenames';
import {useModifyEventProgram} from 'services/events';

export default function EventProgramEditorPage({event}) {
  const navigate = useNavigate();
  const [modifyEventProgram] = useModifyEventProgram({
    onCompleted: () => navigate('/events/'+event._id)
  });

  return <AdminOnly fallback="you need to be admin">
    <Breadcrumb text="Tanssiaisohjelma" />
    <PageTitle>Muokkaa tanssiaisohjelmaa</PageTitle>
    <EventProgramEditor
      program={toEventProgramSettings(event.program ?? { introductions: [], danceSets: [], slideStyleId: null})}
      onSubmit={(program) => modifyEventProgram(event._id, toProgramInput(program))}
    />
  </AdminOnly>;
}

function toEventProgramSettings(
  {introductions, danceSets, slideStyleId} : {introductions: EventProgram[], danceSets: DanceSet[], slideStyleId: string | null},
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
  });
}

function toIntroductionInput({ _id, slideStyleId, ...rest}: EventProgram) {
  return { eventProgramId: _id, eventProgram: rest, slideStyleId }
}

function toProgramItemInput({__typename, _id, slideStyleId, ...rest} : EventProgramItem) {
  switch(__typename) {
    case 'DanceProgram':
    case 'RequestedDance':
      if (!_id) return {type: 'REQUESTED_DANCE', slideStyleId};
      return {
        type: 'DANCE',
        danceId: _id,
        slideStyleId,
      };
    case 'EventProgram':
      return {
        type: 'EVENT_PROGRAM',
        eventProgramId: _id,
        eventProgram: rest,
        slideStyleId,
      };
    default:
      throw new Error('Unexpected program item type '+__typename);
  }
}

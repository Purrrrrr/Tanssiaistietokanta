import * as L from 'partial.lenses';

import React, {useState} from 'react';

import {AdminOnly} from 'services/users';
import {Breadcrumb} from "components/Breadcrumbs";
import {EventProgramEditor} from "components/EventProgramEditor";
import {NavigateButton} from "components/widgets/NavigateButton";
import {PageTitle} from "components/PageTitle";
import {Form, SubmitButton} from "libraries/forms";
import {useNavigate} from "react-router-dom"
import {removeTypenames} from 'utils/removeTypenames';
import {useModifyEventProgram} from 'services/events';

export default function EventProgramEditorPage({event}) {
  const navigate = useNavigate();
  const [program, setProgram] = useState(event.program);
  const [modifyEventProgram] = useModifyEventProgram({
    onCompleted: () => navigate('/events/'+event._id)
  });

  return <AdminOnly fallback="you need to be admin">
    <Breadcrumb text="Tanssiaisohjelma" />
    <PageTitle>Muokkaa tanssiaisohjelmaa</PageTitle>
    <Form onSubmit={
      () => modifyEventProgram(event._id, toProgramInput(program ?? {}))}
    >
      <EventProgramEditor program={program} onChange={setProgram}/>
      <hr />
      <SubmitButton text="Tallenna muutokset" />
      <NavigateButton href='..' text="Peruuta" />
    </Form>
  </AdminOnly>;
}

function toProgramInput({introductions = [], danceSets = []}) {
  return removeTypenames({
    introductions: introductions.map(toIntroductionInput),
    danceSets: L.modify(
      [L.elems, 'program', L.elems], toProgramItemInput, danceSets
    )
  });
}

function toIntroductionInput({ _id, ...rest}) {
  return { eventProgramId: _id, eventProgram: rest }
}

function toProgramItemInput({__typename, _id, ...rest}) {
  switch(__typename) {
    case 'Dance':
    case 'RequestedDance':
      if (!_id) return {type: 'REQUESTED_DANCE'};
      return {
        type: 'DANCE',
        danceId: _id
      };
    case 'EventProgram':
      return {
        type: 'EVENT_PROGRAM',
        eventProgramId: _id,
        eventProgram: rest
      };
    default:
      throw new Error('Unexpected program item type '+__typename);
  }
}

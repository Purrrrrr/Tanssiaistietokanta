import * as L from 'partial.lenses';

import React, {useState} from 'react';

import {AdminOnly} from 'services/users';
import {Breadcrumb} from "components/Breadcrumbs";
import {EventProgramEditor} from "components/EventProgramEditor";
import {NavigateButton} from "components/widgets/NavigateButton";
import {Form, SubmitButton} from "libraries/forms";
import {navigate} from "@reach/router"
import {removeTypenames} from 'utils/removeTypenames';
import {useModifyEventProgram} from 'services/events';

export default function EventProgramEditorPage({event, uri}) {
  const [program, setProgram] = useState(event.program);
  const [modifyEventProgram] = useModifyEventProgram({
    onCompleted: () => navigate('/events/'+event._id)
  });

  return <AdminOnly fallback="you need to be admin">
    <Breadcrumb text="Tanssiaisohjelma" href={uri} />
    <Form onSubmit={
      () => modifyEventProgram(event._id, toProgramInput(program ?? {}))}
    >
      <h1>Muokkaa tanssiaisohjelmaa</h1>
      <EventProgramEditor program={program} onChange={setProgram}/>
      <hr />
      <SubmitButton text="Tallenna muutokset" />
      <NavigateButton href='..' text="Peruuta" />
    </Form>
  </AdminOnly>;
}

function toProgramInput({introductions = [], danceSets = []}) {
  return removeTypenames({
    introductions,
    danceSets: L.modify(
      [L.elems, 'program', L.elems], toProgramItemInput, danceSets
    )
  });
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
    case 'OtherProgram':
      return {
        type: 'OTHER_PROGRAM',
        otherProgram: rest
      };
    default:
      throw new Error('Unexpected program item type '+__typename);
  }
}

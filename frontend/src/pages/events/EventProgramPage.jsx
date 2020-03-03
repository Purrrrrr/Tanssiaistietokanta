import * as L from 'partial.lenses';

import {Button, Intent} from "@blueprintjs/core";
import React, {useState} from 'react';

import {AdminOnly} from 'services/users';
import {Breadcrumb} from "components/Breadcrumbs";
import {EventProgramEditor} from "components/EventProgramEditor";
import {NavigateButton} from "components/widgets/NavigateButton";
import {useValidationResult} from "libraries/forms";
import {navigate} from "@reach/router"
import {removeTypenames} from 'utils/removeTypenames';
import {useModifyEventProgram} from 'services/events';

export default function EventEditorPage({event, uri}) {
  const [program, setProgram] = useState(event.program);
  const [modifyEventProgram] = useModifyEventProgram();
  const {hasErrors, ValidationContainer} = useValidationResult();

  return <AdminOnly fallback="you need to be admin">
    <Breadcrumb text="Tanssiaisohjelma" href={uri} />
    <ValidationContainer>
      <h1>Muokkaa tanssiaisohjelmaa</h1>
      <EventProgramEditor program={program} onChange={setProgram}/>
      <hr />
      <Button disabled={hasErrors} intent={Intent.PRIMARY} text="Tallenna muutokset"
        onClick={() => modifyEventProgram(event._id, toProgramInput(program ?? {})).then((ok) => ok && navigate('/events/'+event._id))}  />
      <NavigateButton href='..' text="Peruuta" />
    </ValidationContainer>
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

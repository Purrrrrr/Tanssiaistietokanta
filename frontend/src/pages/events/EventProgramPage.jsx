import React, {useState} from 'react';
import {navigate} from "@reach/router"
import {Button, Intent} from "@blueprintjs/core";
import {Breadcrumb} from "components/Breadcrumbs";

import {NavigateButton} from "components/widgets/NavigateButton";
import {EventProgramEditor} from "components/EventProgramEditor";
import {useModifyEventProgram} from 'services/events';
import {AdminOnly} from 'services/users';

export default function EventEditorPage({event, uri}) {
  const [program, setProgram] = useState(event.program);
  const [modifyEventProgram] = useModifyEventProgram();

  return <AdminOnly fallback="you need to be admin">
    <Breadcrumb text="Tanssiaisohjelma" href={uri} />
    <h1>Muokkaa tanssiaisohjelmaa</h1>
    <EventProgramEditor program={program} onChange={setProgram}/>
    <hr />
    <Button intent={Intent.PRIMARY} text="Tallenna muutokset"
      onClick={() => modifyEventProgram(event._id, toProgramInput(program ?? {})).then((ok) => ok && navigate('/events/'+event._id))}  />
    <NavigateButton href='..' text="Peruuta" />
  </AdminOnly>;
}

function toProgramInput({introductions = [], danceSets = []}) {
  return {
    introductions: introductions.map(({__typename, ...intro}) => intro),
    danceSets: danceSets.map(toDanceSetInput),
  }
}

function toDanceSetInput({__typename, program, ...rest}) {
  return {
    program: program.map(toProgramItemInput),
    ...rest
  };
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

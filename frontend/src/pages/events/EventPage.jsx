import {Intent} from "@blueprintjs/core";
import {Link} from "@reach/router"
import React from 'react';

import {NavigateButton} from "components/widgets/NavigateButton";
import {DeleteButton} from "components/widgets/DeleteButton";
import {makeTranslate} from 'utils/translate';
import {useDeleteWorkshop} from "services/workshops";

const t = makeTranslate({
  ballProgram: 'Tanssiaisohjelma',
  noProgram: 'Ei ohjelmaa',
  editProgram: 'Muokkaa ohjelmaa',
  addProgram: 'Luo ohjelma',
  workshops: 'Työpajat',
  danceMasterCheatList: 'Tanssiaisjuontajan lunttilappu',
  printBallDanceList: 'Tulosta settilista',
  ballProgramSlideshow: 'Tanssiaisten diashow',
  createWorkshop: 'Uusi työpaja',
  danceCheatlist: 'Osaan tanssin -lunttilappu',
  requestedDance: 'Toivetanssi',
});

export default function EventPage({event}) {
  return <>
    <h1>{event.name}</h1>
    <t.h2>ballProgram</t.h2>
    <EventProgram program={event.program} />
    <t.h2>workshops</t.h2>
    <EventWorkshops workshops={event.workshops} eventId={event._id} />
  </>
}

function EventProgram({program}) {
  if (!program || program.danceSets.length === 0) {
    return <>
      <t.p>noProgram</t.p>
      <NavigateButton adminOnly intent={Intent.PRIMARY} href="program" text={t`addProgram`} />
    </>;
  }

  return <>
    {program.danceSets.map((danceSet, index) =>
      <p key={index} >
        <strong>{danceSet.name}</strong>:{' '}
        {danceSet.program.map(item => item.name ?? t`requestedDance`).join(', ')}
      </p>
    )}
    <NavigateButton adminOnly intent={Intent.PRIMARY} href="program" text={t`editProgram`} />
    <NavigateButton href="print/dancemasters-cheatlist" target="_blank"
      text={t`danceMasterCheatList`} />
    <NavigateButton href="print/ball-dancelist" target="_blank"
      text={t`printBallDanceList`} />
    <NavigateButton href="ball-program?hideUI" target="_blank"
      text={t`ballProgramSlideshow`} />
  </>;
}

function EventWorkshops({workshops, eventId}) {
  const [deleteWorkshop] = useDeleteWorkshop({refetchQueries: ['getEvent']});

  return <>
    <ul>
      {workshops.map(workshop =>
        <li key={workshop._id}>
          <Link to={'workshops/'+workshop._id} >{workshop.name}</Link>
          <DeleteButton onDelete={() => deleteWorkshop(workshop._id)}
            style={{float: "right"}} text="Poista"
            confirmText={"Haluatko varmasti poistaa työpajan "+workshop.name+"?"}
          />
        </li>
      )}
    </ul>
    <NavigateButton adminOnly intent={Intent.PRIMARY} href="workshops/create"
      text={t`createWorkshop`} />
    <NavigateButton href="print/dance-cheatlist" target="_blank"
      text={t`danceCheatlist`} />
  </>;
}

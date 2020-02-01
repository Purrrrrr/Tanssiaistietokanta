import React from 'react';
import {Link} from "@reach/router"
import {Intent} from "@blueprintjs/core";

import {NavigateButton} from "components/widgets/NavigateButton";
import {makeTranslate} from 'utils/translate';

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
    <EventWorkshops workshops={event.workshops} />
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

function EventWorkshops({workshops}) {
  return <>
    <ul>
      {workshops.map(workshop =>
        <li key={workshop._id}>
          <Link to={'workshops/'+workshop._id} >{workshop.name}</Link>
        </li>
      )}
    </ul>
    <NavigateButton adminOnly intent={Intent.PRIMARY} href="workshops/create"
      text={t`createWorkshop`} />
    <NavigateButton href="print/dance-cheatlist" target="_blank"
      text={t`danceCheatlist`} />
  </>;
}

import React from 'react';
import {Link} from "@reach/router"
import {Intent} from "@blueprintjs/core";

import {NavigateButton} from "components/widgets/NavigateButton";
import {AdminOnly} from 'services/users';

export default function EventPage({event}) {

  return <>
    <h1>{event.name}</h1>
    {/* Intentionally use event._id here since target="_blank" makes
      use of actual browser links and those have different link mechanics */}
    <h2>Tanssiaisohjelma</h2>
    <ul>
      {event.program.map((item, index) =>
        <li key={index}>{item.type === 'HEADER' ? <strong>{item.name}</strong> : item.name}</li>
      )}
    </ul>
    <AdminOnly>
      <NavigateButton intent={Intent.PRIMARY} href="edit" text="Muokkaa ohjelmaa" />
    </AdminOnly>
    <NavigateButton href={event._id+"/print/dancemasters-cheatlist"} target="_blank"
      text="Tanssiaisjuontajan lunttilappu" />
    <NavigateButton href={event._id+"/print/ball-dancelist"} target="_blank"
      text="Tulosta settilista" />
    <NavigateButton href={event._id+"/ball-program?hideUI"} target="_blank"
      text="Tanssiaisten diashow" />
    <h2>Työpajat</h2>
    <ul>
      {event.workshops.map(workshop =>
        <li key={workshop._id}>
          <Link to={'workshops/'+workshop._id} >{workshop.name}</Link>
        </li>
      )}
    </ul>
    <AdminOnly>
      <NavigateButton intent={Intent.PRIMARY} href="workshops/create" text="Uusi työpaja" />
    </AdminOnly>
    <NavigateButton href={event._id+"/print/dance-cheatlist"} target="_blank"
      text="Osaan tanssin -lunttilappu" />
  </>
}

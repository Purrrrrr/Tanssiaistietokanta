import React, {useState} from 'react';
import {Button} from "@blueprintjs/core";
import {Link} from "@reach/router"

import {EventEditor} from "components/EventEditor";
import {NavigateButton} from "components/widgets/NavigateButton";
import {useModifyEvent} from 'services/events';
import {AdminOnly} from 'services/users';

export default function EventEditorPage({event}) {
  const [currentEvent, setCurrentEvent] = useState(event);
  const [modifyEvent] = useModifyEvent();

  return <AdminOnly fallback="you need to be admin">
    <h1>{event.name}</h1>
    {/* Intentionally use event._id here since target="_blank" makes
      use of actual browser links and those have different link mechanics */}
    <NavigateButton href={event._id+"/print/ball-dancelist"} target="_blank"
      text="Tanssiaisten settilista" />
    <NavigateButton href={event._id+"/print/dancemasters-cheatlist"} target="_blank"
      text="Tanssiaisjuontajan lunttilappu" />
    <NavigateButton href={event._id+"/print/dance-cheatlist"} target="_blank"
      text="Osaan tanssin -lunttilappu" />
    <NavigateButton href={event._id+"/ball-program?hideUI"} target="_blank"
      text="Tanssiaisten diashow" />
    <EventEditor event={currentEvent} onChange={setCurrentEvent}/>
    <Button text="Tallenna muutokset" onClick={() => modifyEvent(currentEvent)} />
    <h2>Työpajat</h2>
		{event.workshops.map(workshop =>
			<li key={workshop._id}>
				<Link to={'workshops/'+workshop._id} >{workshop.name}</Link>
			</li>
		)}
    <NavigateButton href={"workshops/create"} text="Uusi työpaja" />
  </AdminOnly>;
}

import React, {useState} from 'react';
import {Button} from "@blueprintjs/core";
import {Router, Link} from "@reach/router"

import CreateWorkshopForm from './workshops/CreateWorkshop';
import {useEvent} from 'services/events';
import {Breadcrumb} from "components/Breadcrumbs";
import {EventEditor} from "components/EventEditor";
import {NavigateButton} from "components/widgets/NavigateButton";
import {useModifyEvent} from 'services/events';
import {AdminOnly} from 'services/users';

export default function({eventId, uri}) {
  const [event] = useEvent(eventId);

  return event && <>
    <Breadcrumb text={event.name} href={uri} />
    <Router>
      <EventEditorPage path="/" event={event} />
      <CreateWorkshopForm path="workshops/create" event={event} />
    </Router>
  </>;
}

function EventEditorPage(props) {
  const [event, setEvent] = useState(props.event);
  const [modifyEvent] = useModifyEvent();

  return <AdminOnly fallback="you need to be admin">
    <h1>{props.event.name}</h1>
    {/* Intentionally use event._id here since target="_blank" makes 
      use of actual browser links and those have different link mechanics */}
    <NavigateButton href={event._id+"/print/ball-dancelist"} target="_blank"
      text="Tanssiaisten settilista" />
    <NavigateButton href={event._id+"/print/dancemasters-cheatlist"} target="_blank"
      text="Tanssiaisjuontajan lunttilappu" />
    <NavigateButton href={event._id+"/print/dance-cheatlist"} target="_blank"
      text="Osaan tanssin -lunttilappu" />
    <NavigateButton href={event._id+"/ball-program"} target="_blank"
      text="Tanssiaisten diashow" />
    <EventEditor event={event} onChange={setEvent}/>
    <Button text="Tallenna muutokset" onClick={() => modifyEvent(event)} />
    <h2>Työpajat</h2>
		{props.event.workshops.map(workshop =>
			<li key={workshop._id}>
				<Link to={'workshops/'+workshop._id} >{workshop.name}</Link>
			</li>
		)}
    <NavigateButton href={"workshops/create"} text="Uusi työpaja" />
  </AdminOnly>;
}

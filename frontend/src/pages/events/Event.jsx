import React, {useState} from 'react';
import {AnchorButton, Button} from "@blueprintjs/core";
import {Router, Link} from "@reach/router"

import CreateWorkshopForm from './workshops/CreateWorkshop';
import {useEvent} from 'services/events';
import {Breadcrumb} from "components/Breadcrumbs";
import {EventEditor} from "components/EventEditor";
import {useModifyEvent} from 'services/events';
import {showDefaultErrorToast} from "utils/toaster"
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
  const [modifyEvent] = useModifyEvent({onError: showDefaultErrorToast});
  
  return <AdminOnly fallback="you need to be admin">
    <h1>{props.event.name}</h1>
    <EventEditor event={event} onChange={setEvent}/>
    <Button text="Tallenna muutokset" onClick={() => modifyEvent(event)} />
    <h2>Työpajat</h2>
		{event.workshops.map(workshop =>
			<li>
				<Link key={workshop._id} to={'workshops/'+workshop._id} >{workshop.name}</Link>
			</li>
		)}
    <AnchorButton href={event._id+"/workshops/create"} text="Uusi työpaja" />
    <h3>Tulosta</h3>
    <AnchorButton href={event._id+"/print/ball-dancelist"} target="_blank"
      text="Tanssiaisten settilista" />
  </AdminOnly>;
}

import React, {useState} from 'react';
import {AnchorButton, Button} from "@blueprintjs/core";

import {useEvent} from 'services/events';
import {Breadcrumb} from "components/Breadcrumbs";
import {EventEditor} from "components/EventEditor";
import {useModifyEvent} from 'services/events';
import {showDefaultErrorToast} from "utils/toaster"

export default function({eventId, uri}) {
  const [event] = useEvent(eventId);

  return event && <>
    <Breadcrumb text={event.name} href={uri} />
    <EventEditorPage path="/" event={event} />
  </>;
}

function EventEditorPage(props) {
  const [event, setEvent] = useState(props.event);
  const [modifyEvent] = useModifyEvent({onError: showDefaultErrorToast});
  
  return <>
    <h1>{props.event.name}</h1>
    <EventEditor event={event} onChange={setEvent}/>
    <Button text="Tallenna muutokset" onClick={() => modifyEvent(event)} />
    <h3>Tulosta</h3>
    <AnchorButton href={event._id+"/print/ball-dancelist"} target="_blank"
      text="Tanssiaisten settilista" />
  </>;
}

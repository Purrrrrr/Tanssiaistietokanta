import React, {useState, useEffect} from 'react';
import {Button} from "@blueprintjs/core";
import {useEvent} from 'services/events';
import {Breadcrumb} from "components/Breadcrumbs";
import {EventEditor} from "components/EventEditor";
import {useModifyEvent} from 'services/events';
import {showDefaultErrorToast} from "utils/toaster"

export default function({eventId, uri}) {
  const [originalEvent] = useEvent(eventId);
  const [event, setEvent] = useState(null);
  useEffect(() => {
    event == null && setEvent(originalEvent)
  }, [event, originalEvent]);

  const [modifyEvent] = useModifyEvent({onError: showDefaultErrorToast});

  return event && <>
    <Breadcrumb text={originalEvent.name} href={uri} />
    <h1>{originalEvent.name}</h1>
    <EventEditor event={event} onChange={setEvent}/>
    <Button text="Tallenna" onClick={() => modifyEvent(event)} />
  </>;
}

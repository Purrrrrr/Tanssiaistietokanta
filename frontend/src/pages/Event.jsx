import React from 'react';
import {useEvent} from '../services/events';
import {Breadcrumb} from "../components/Breadcrumbs";

export default function({eventId, uri}) {
  const [event] = useEvent(eventId);
  return event && <>
    <Breadcrumb text={event.name} href={uri} />
    <h1>{event.name}</h1>
    <pre>{JSON.stringify(event)}</pre>
  </>;
}

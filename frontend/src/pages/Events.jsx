import React from 'react';
import {Card} from "@blueprintjs/core";

import CreateEvent from "./CreateEvent";
import Event from "./Event";
import {useEvents, useDeleteEvent} from '../services/events';
import {showDefaultErrorToast} from "../utils/toaster"
import {Breadcrumb} from "../components/Breadcrumbs";
import {AdminOnly} from '../services/users';
import {Router, Link} from "@reach/router"

function Events({uri}) {
  return <>
    <Breadcrumb text="Tapahtumat" href={uri} />
    <Router>
      <EventList path="/" />
      <Event path=":eventId" />
      <CreateEvent path="new" />
    </Router>
  </>;
}

function EventList() {
  const [events] = useEvents();
  const onError = showDefaultErrorToast;
  const [deleteEvent] = useDeleteEvent({onError});
  return <>
    <h1>Tanssittaja</h1>
    {events.filter(e => !e.deleted).map(event => 
      <Card key={event._id}>
        <Link to={event._id} >{event.name}</Link>
       <button onClick={() => deleteEvent(event._id)}>X</button>
      </Card>
    )}
    <AdminOnly>
      <Link to="new">Uusi tapahtuma</Link>
    </AdminOnly>
  </>
}

export default Events;

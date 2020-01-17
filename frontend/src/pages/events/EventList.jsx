import React from 'react';
import {Card} from "@blueprintjs/core";

import {useEvents, useDeleteEvent} from 'services/events';
import {AdminOnly} from 'services/users';
import {Link} from "@reach/router"

export default function EventList() {
  const [events] = useEvents();
  const [deleteEvent] = useDeleteEvent();
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

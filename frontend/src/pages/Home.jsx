import React, {useState} from 'react';
import {Card, Button} from "@blueprintjs/core";

import {useEvents, useCreateEvent, useDeleteEvent} from '../services/events';
import {showDefaultErrorToast} from "../utils/toaster"
import {AdminOnly} from '../services/users';
import {Breadcrumb} from "../components/Breadcrumbs";
import {EventEditor} from "../components/EventEditor";
//import {Router} from "@reach/router"


function Home({children, uri}) {
  return <>
    <Breadcrumb text="Tanssittaja" href={uri} />
    <EventList />
  </>;
}

function EventList() {
  const [events, reload] = useEvents();
  const onError = showDefaultErrorToast;
  //const [modifyEvent] = useModifyEvent({onError});
  const [createEvent] = useCreateEvent({onError});
  const [deleteEvent] = useDeleteEvent({onError});
  const onRemove = (event) => deleteEvent(event._id);
  return <>
    <h1>Tanssittaja</h1>
    {events.filter(e => !e.deleted).map(event => 
      <Card key={event._id}>{event.name}<button onClick={() => onRemove(event)}>X</button></Card>
    )}
    <AdminOnly>
      <CreateEventForm onSubmit={event => createEvent(event).then(reload)} />
    </AdminOnly>
  </>
}

function CreateEventForm({onSubmit}) {
  const [event, setEvent] = useState({
    program: []
  });

  return <>
    <h2>Uusi tapahtuma</h2>
    <EventEditor event={event} onChange={setEvent} />
    <Button text="Luo" onClick={() => onSubmit(event)} />
  </>;
}

export default Home;

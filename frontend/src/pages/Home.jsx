import React from 'react';
import {useEvents, createEvent, deleteEvent} from '../services/events';
import {AdminOnly} from '../services/users';
import useForm from 'react-hook-form';
import {Breadcrumb} from "../components/Breadcrumbs";
//import {Router} from "@reach/router"

import {Card} from "@blueprintjs/core";

function Home({children, uri}) {
  return <>
    <Breadcrumb text="Tanssittaja" href={uri} />
    <EventList />
  </>;
}

function EventList() {
  const [events, reload] = useEvents();
  const onRemove = (event) => deleteEvent(event._id).then(reload);
  return <>
    <h1>Tanssittaja</h1>
    {events.map(event => 
      <Card key={event._id}>{event.name}<button onClick={() => onRemove(event)}>X</button></Card>
    )}
    <AdminOnly>
      <CreateEventForm onSubmit={event => createEvent(event).then(reload)} />
    </AdminOnly>
  </>
}

function CreateEventForm({onSubmit}) {
  const {register, handleSubmit, reset, errors} = useForm();

  return <form onSubmit={handleSubmit((data) => {onSubmit(data); reset();})}>
    <h2>Uusi tapahtuma</h2>
    Nimi
    <input type="text" name="name" ref={register({required: true})}/>
    {errors.name && "Nimi on pakollinen"}
  </form>;
}

export default Home;

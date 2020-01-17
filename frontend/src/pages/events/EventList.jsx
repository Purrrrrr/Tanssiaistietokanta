import React from 'react';
import {Intent} from "@blueprintjs/core";

import {NavigateButton} from "components/widgets/NavigateButton";

import {DeleteButton} from "components/widgets/DeleteButton";
import {useEvents, useDeleteEvent} from 'services/events';
import {AdminOnly} from 'services/users';
import {Link} from "@reach/router"

export default function EventList() {
  const [events] = useEvents();
  const [deleteEvent] = useDeleteEvent();

  return <>
    <h1>Tanssitapahtumia</h1>
    {events.filter(e => !e.deleted).map(event =>
      <h2 key={event._id}>
        <Link to={event._id} >{event.name}</Link>
        <DeleteButton onDelete={() => deleteEvent(event._id)}
          style={{float: "right"}} text="Poista"
          confirmText={"Haluatko varmasti poistaa tapahtuman "+event.name+"?"}
        />
      </h2>
    )}
    <AdminOnly>
      <NavigateButton intent={Intent.PRIMARY} href="new" text="Uusi tapahtuma" />
    </AdminOnly>
  </>
}

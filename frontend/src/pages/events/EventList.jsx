import {useDeleteEvent, useEvents} from 'services/events';

import {DeleteButton} from "components/widgets/DeleteButton";
import {Intent} from "@blueprintjs/core";
import {Link} from "@reach/router"
import {NavigateButton} from "components/widgets/NavigateButton";
import React from 'react';

export default function EventList() {
  const [events] = useEvents();
  const [deleteEvent] = useDeleteEvent({refetchQueries: ['getEvent', 'getEvents']});

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
    <NavigateButton adminOnly intent={Intent.PRIMARY} href="new" text="Uusi tapahtuma" />
  </>
}

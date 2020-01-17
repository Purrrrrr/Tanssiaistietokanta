import React from 'react';
import {Router} from "@reach/router"

import EventPrintRoutes from "./print";

import CreateWorkshopForm from 'pages/events/workshops/CreateWorkshop';
import BallProgram from "pages/events/BallProgram";
import EventPage from "pages/events/EventPage";
import EventEditorPage from "pages/events/EventEditorPage";
import {useEvent} from 'services/events';
import {Breadcrumb} from "components/Breadcrumbs";

export default function({eventId, uri}) {
  const [event] = useEvent(eventId);

  return event && <>
    <Breadcrumb text={event.name} href={uri} />
    <Router primary={false} component={React.Fragment}>
      <EventPage path="/" event={event} />
      <EventEditorPage path="edit" event={event} />
      <BallProgram path="ball-program" />
      <CreateWorkshopForm path="workshops/create" event={event} />
      <EventPrintRoutes path="print/*" eventId={eventId} />
    </Router>
  </>;
}

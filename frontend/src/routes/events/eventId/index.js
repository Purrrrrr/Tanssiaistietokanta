import React from 'react';
import {Router} from "@reach/router"

import EventPrintRoutes from "./print";

import CreateWorkshopForm from 'pages/events/workshops/CreateWorkshop';
import BallProgram from "pages/events/BallProgram";
import EventPage from "pages/events/EventPage";
import EventProgramPage from "pages/events/EventProgramPage";
import {useEvent} from 'services/events';
import {Breadcrumb} from "components/Breadcrumbs";
import {LoadingState} from 'components/LoadingState';

export default function({eventId, uri}) {
  const [event, loadingState] = useEvent(eventId);

  if (!event) return <LoadingState {...loadingState} />

  return <>
    <Breadcrumb text={event.name} href={uri} />
    <Router primary={false} component={React.Fragment}>
      <EventPage path="/" event={event} />
      <EventProgramPage path="program" event={event} />
      <BallProgram path="ball-program" />
      <CreateWorkshopForm path="workshops/create" event={event} />
      <EventPrintRoutes path="print/*" eventId={eventId} />
    </Router>
  </>;
}

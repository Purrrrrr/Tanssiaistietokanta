import React from 'react';
import {Router} from "@reach/router"

import CreateEvent from "pages/events/CreateEvent";
import EventRoutes from "./eventId";
import EventList from "pages/events/EventList";
import {Breadcrumb} from "components/Breadcrumbs";

export default function Events({uri}) {
  return <>
    <Breadcrumb text="Tapahtumat" href={uri} />
    <Router primary={false}>
      <EventList path="/" />
      <CreateEvent path="new" />
      <EventRoutes path=":eventId/*" />
    </Router>
  </>;
}

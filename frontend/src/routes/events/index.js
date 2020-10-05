import React from 'react';
import {Routes} from 'react-router-dom';

import CreateEvent from "pages/events/CreateEvent";
import EventRoutes from "./eventId";
import EventList from "pages/events/EventList";
import {Breadcrumb} from "components/Breadcrumbs";

export default function Events() {
  return <>
    <Breadcrumb text="Tapahtumat" />
    <Routes>
      <EventList path="/" />
      <CreateEvent path="new" />
      <EventRoutes path=":eventId/*" />
    </Routes>
  </>;
}

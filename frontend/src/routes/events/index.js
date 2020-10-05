import React from 'react';
import {Routes, Route} from 'react-router-dom';

import CreateEvent from "pages/events/CreateEvent";
import EventRoutes from "./eventId";
import EventList from "pages/events/EventList";
import {Breadcrumb} from "components/Breadcrumbs";

export default function Events() {
  return <>
    <Breadcrumb text="Tapahtumat" />
    <Routes>
      <Route path="/" element={<EventList/>} />
      <Route path="new" element={<CreateEvent/>} />
      <Route path=":eventId/*" element={<EventRoutes/>} />
    </Routes>
  </>;
}

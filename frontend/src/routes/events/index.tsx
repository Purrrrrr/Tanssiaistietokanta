import React from 'react';
import {Routes, Route} from 'react-router-dom';

import CreateEvent from "pages/events/CreateEvent";
import EventRoutes from "./eventId";

export default function Events() {
  return <>
    <Routes>
      <Route path="new" element={<CreateEvent/>} />
      <Route path=":eventId/*" element={<EventRoutes/>} />
    </Routes>
  </>;
}

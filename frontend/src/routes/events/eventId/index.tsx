import React from 'react';
import {Routes, Route, useParams} from 'react-router-dom';

import EventPrintRoutes from "./print";

import CreateWorkshopForm from 'pages/events/workshops/CreateWorkshop';
import EditWorkshopForm from 'pages/events/workshops/EditWorkshop';
import BallProgram from "pages/events/BallProgram";
import EventPage from "pages/events/EventPage";
import EventProgramPage from "pages/events/EventProgramPage";
import {useEvent} from 'services/events';
import {Breadcrumb} from "components/Breadcrumbs";
import {LoadingState} from 'components/LoadingState';

export default function EventRoutes() {
  const {eventId} = useParams();
  const [event, loadingState] = useEvent(eventId);

  if (!event) return <LoadingState {...loadingState} />

  return <>
    <Breadcrumb text={event.name} />
    <Routes>
      <Route path="/" element={<EventPage event={event}/>} />
      <Route path="program" element={<EventProgramPage event={event}/>} />
      <Route path="ball-program" element={<BallProgram eventId={eventId}/>} />
      <Route path="workshops/create" element={<CreateWorkshopForm event={event}/>} />
      <Route path="workshops/:workshopId" element={<EditWorkshopForm event={event} />} />
      <Route path="print/*" element={<EventPrintRoutes />} />
    </Routes>
  </>;
}

import React from 'react';
import {Routes, useParams} from 'react-router-dom';

import EventPrintRoutes from "./print";

import CreateWorkshopForm from 'pages/events/workshops/CreateWorkshop';
import EditWorkshopForm from 'pages/events/workshops/EditWorkshop';
import BallProgram from "pages/events/BallProgram";
import EventPage from "pages/events/EventPage";
import EventProgramPage from "pages/events/EventProgramPage";
import {useEvent} from 'services/events';
import {Breadcrumb} from "components/Breadcrumbs";
import {LoadingState} from 'components/LoadingState';

export default function() {
  const {eventId} = useParams();
  const [event, loadingState] = useEvent(eventId);

  if (!event) return <LoadingState {...loadingState} />

  return <>
    <Breadcrumb text={event.name} />
    <Routes>
      <EventPage path="/" event={event} />
      <EventProgramPage path="program" event={event} />
      <BallProgram path="ball-program" />
      <CreateWorkshopForm path="workshops/create" event={event} />
      <EditWorkshopForm path="workshops/:workshopId" />
      <EventPrintRoutes path="print/*" eventId={eventId} />
    </Routes>
  </>;
}

import React from 'react';
import {Routes, Route} from 'react-router-dom';
import {Breadcrumb} from "components/Breadcrumbs";
import {Icon} from "@blueprintjs/core";
import Events from "./events";
import EventList from "pages/events/EventList";
import Dances from "pages/Dances";

export default function() {
  return <>
    <Breadcrumb text={<><Icon icon="home" />Tanssiaistietokanta</>} />
    <Routes>
      <Route path="events/*" element={<Events />} />
      <Route path="dances" element={<Dances/>} />
      <Route path="/" element={<EventList/>} />
    </Routes>
  </>;
}

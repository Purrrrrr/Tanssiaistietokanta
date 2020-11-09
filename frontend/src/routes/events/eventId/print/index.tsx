import React from 'react';
import {Routes, Route, useParams} from 'react-router-dom';
import DanceList from 'pages/events/print/DanceList'
import DanceCheatList from 'pages/events/print/DanceCheatList'
import DanceInstructions from "pages/events/print/DanceInstructions";
import DanceMastersCheatList from 'pages/events/print/DanceMastersCheatList'

export default function EventPrintRoutes() {
  const {eventId} = useParams();
  return <Routes>
    <Route path="ball-dancelist" element={<DanceList eventId={eventId}/>} />
    <Route path="dance-cheatlist" element={<DanceCheatList eventId={eventId}/>} />
    <Route path="dancemasters-cheatlist" element={<DanceMastersCheatList eventId={eventId}/>} />
    <Route path="dance-instructions" element={<DanceInstructions eventId={eventId} />} />
  </Routes>;
}

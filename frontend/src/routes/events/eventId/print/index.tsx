import React from 'react';
import {Routes, useParams} from 'react-router-dom';
import DanceList from 'pages/events/print/DanceList'
import DanceCheatList from 'pages/events/print/DanceCheatList'
import DanceInstructions from "pages/events/print/DanceInstructions";
import DanceMastersCheatList from 'pages/events/print/DanceMastersCheatList'

export default function() {
  const {eventId} = useParams();
  return <Routes>
    <DanceList path="ball-dancelist" eventId={eventId}/>
    <DanceCheatList path="dance-cheatlist" eventId={eventId}/>
    <DanceMastersCheatList path="dancemasters-cheatlist" eventId={eventId}/>
    <DanceInstructions path="dance-instructions" eventId={eventId} />
  </Routes>;
}

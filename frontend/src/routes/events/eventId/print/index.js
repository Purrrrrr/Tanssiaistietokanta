import React from 'react';
import {Router} from "@reach/router"
import DanceList from 'pages/events/print/DanceList'
import DanceCheatList from 'pages/events/print/DanceCheatList'
import DanceMastersCheatList from 'pages/events/print/DanceMastersCheatList'

export default function({eventId}) {
  return <Router primary={false}>
    <DanceList path="ball-dancelist" eventId={eventId}/>
    <DanceCheatList path="dance-cheatlist" eventId={eventId}/>
    <DanceMastersCheatList path="dancemasters-cheatlist" eventId={eventId}/>
  </Router>;
}

import React from 'react';
import {Router} from "@reach/router"
import DanceList from './print/DanceList'
import DanceCheatList from './print/DanceCheatList'
import DanceMastersCheatList from './print/DanceMastersCheatList'

export default function({eventId}) {
  return <Router>
    <DanceList path="ball-dancelist" eventId={eventId}/>
    <DanceCheatList path="dance-cheatlist" eventId={eventId}/>
    <DanceMastersCheatList path="dancemasters-cheatlist" eventId={eventId}/>
  </Router>;
}

import React from 'react';
import {Router} from "@reach/router"
import DanceList from './print/DanceList'

export default function({eventId}) {
  return <Router>
    <DanceList path="ball-dancelist" eventId={eventId}/>
  </Router>;
}

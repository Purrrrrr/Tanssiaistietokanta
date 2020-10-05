import React from 'react';
import {Routes} from 'react-router-dom';
import Events from "./events";
import Dances from "pages/Dances";

export default function() {
  return <Routes>
    <Events path="events/*" />
    <Dances path="dances" />
  </Routes>;
  // TODO: <Redirect from="/" to="events" noThrow />
}

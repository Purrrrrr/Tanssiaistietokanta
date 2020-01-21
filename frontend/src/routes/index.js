import React from 'react';
import {Router, Redirect} from "@reach/router"
import Events from "./events";
import Dances from "pages/Dances";

export default function() {
  return <Router primary={false} component={React.Fragment}>
    <Events path="events/*" />
    <Dances path="dances" />
    <Redirect from="/" to="events" noThrow />
  </Router>;
}

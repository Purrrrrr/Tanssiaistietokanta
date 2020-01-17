import React from 'react';
import {Router, Redirect} from "@reach/router"
import LegacyApp from "legacy/playlistapp";
import Events from "./events";
import Dances from "pages/Dances";

export default function() {
  return <Router primary={false}>
    <Events path="events/*" />
    <Dances path="dances" />
    <LegacyApp path="legacy" />
    <Redirect from="/" to="events" noThrow />
  </Router>;
}

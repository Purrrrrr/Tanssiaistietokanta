import React from 'react';
import {Router, Redirect} from "@reach/router"
import PlaylistApp from "legacy/playlistapp";
import Events from "pages/events/Events";
import EventPrints from "pages/events/EventPrints";
import Dances from "pages/Dances";
import {UserContextProvider} from "services/users";
import NavigationLayout from "components/NavigationLayout";
import {apolloClient, ApolloProvider} from "services/Apollo";

function DanceOrganizer() {
  return <ContextProviders>
    <Router primary={false}>
      <EventPrints path="events/:eventId/print/*" />
      <NavigationLayout default>
        <Events path="events/*" />
        <Dances path="dances" />
        <PlaylistApp path="legacy" />
        <Redirect from="/" to="events" noThrow />
      </NavigationLayout>
    </Router>
  </ContextProviders>;
}

function ContextProviders({children}) {
  return <ApolloProvider client={apolloClient}>
    <UserContextProvider>
      {children}
    </UserContextProvider>
  </ApolloProvider>;
}

export default DanceOrganizer;

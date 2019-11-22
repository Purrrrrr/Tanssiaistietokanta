import React from 'react';
import {Router, Redirect} from "@reach/router"
import PlaylistApp from "./legacy/playlistapp";
import Events from "./pages/Events";
import Dances from "./pages/Dances";
import {UserContextProvider} from "./services/users";
import {BreadcrumbContext} from "./components/Breadcrumbs";
import Navigation from "./components/Navigation";
import {apolloClient, ApolloProvider} from "./services/Apollo";

function DanceOrganizer() {
  return <ContextProviders>
    <Navigation />
    <div id="content">
      <Router>
        <Events path="events/*" />
        <Dances path="dances" />
        <PlaylistApp path="legacy" />
        <Redirect from="/" to="events" noThrow />
      </Router>
    </div>
  </ContextProviders>;
}

function ContextProviders({children}) {
  return <ApolloProvider client={apolloClient}>
    <UserContextProvider>
      <BreadcrumbContext>
        {children}
      </BreadcrumbContext>
    </UserContextProvider>
  </ApolloProvider>;
}

export default DanceOrganizer;

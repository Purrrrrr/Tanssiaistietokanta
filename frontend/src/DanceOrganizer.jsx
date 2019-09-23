import React from 'react';
import {Router} from "@reach/router"
import PlaylistApp from "./legacy/playlistapp";
import Home from "./pages/Home";
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
        <Home path="/" />
        <Dances path="dances" />
        <PlaylistApp path="legacy" />
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

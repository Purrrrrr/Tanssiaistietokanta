import React from 'react';
import {Router} from "@reach/router"
import PlaylistApp from "./legacy/playlistapp";
import Home from "./pages/Home";
import Dances from "./pages/Dances";
import {UserContextProvider} from "./services/users";
import {BreadcrumbContext} from "./components/Breadcrumbs";
import Navigation from "./components/Navigation";

function DanceOrganizer() {
  return <UserContextProvider>
    <BreadcrumbContext>
      <Navigation />
      <div id="content">
        <Router>
          <Home path="/" />
          <Dances path="dances" />
          <PlaylistApp path="legacy" />
        </Router>
      </div>
    </BreadcrumbContext>
  </UserContextProvider>;
}

export default DanceOrganizer;

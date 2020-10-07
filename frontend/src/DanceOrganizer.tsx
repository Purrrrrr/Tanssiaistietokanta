import React from 'react';
import { BrowserRouter} from 'react-router-dom';
//, Routes, Route, Outlet, useParams, useLocation, useHref
import AppRoutes from "./routes";
import NavigationLayout from "components/NavigationLayout";
import {UserContextProvider} from "services/users";
import {ToastContainer} from "utils/toaster";
import {apolloClient, ApolloProvider} from "services/Apollo";

function DanceOrganizer() {
  return <ApolloProvider client={apolloClient}>
    <UserContextProvider>
      <BrowserRouter>
        <ToastContainer />
        <NavigationLayout>
          <AppRoutes/>
        </NavigationLayout>
      </BrowserRouter>
    </UserContextProvider>
  </ApolloProvider>;
}

export default DanceOrganizer;

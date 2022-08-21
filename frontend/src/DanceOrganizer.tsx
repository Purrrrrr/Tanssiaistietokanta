import React from 'react';
import { BrowserRouter} from 'react-router-dom';
//, Routes, Route, Outlet, useParams, useLocation, useHref
import AppRoutes from "./routes";
import NavigationLayout from "components/NavigationLayout";
import {UserContextProvider} from "services/users";
import {ToastContainer} from "utils/toaster";
import {BackendProvider} from "backend";

function DanceOrganizer() {
  return <BackendProvider>
    <UserContextProvider>
      <BrowserRouter>
        <ToastContainer />
        <NavigationLayout>
          <AppRoutes/>
        </NavigationLayout>
      </BrowserRouter>
    </UserContextProvider>
  </BackendProvider>;
}

export default DanceOrganizer;

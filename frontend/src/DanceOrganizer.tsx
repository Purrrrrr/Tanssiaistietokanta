import React from 'react'
import { BrowserRouter} from 'react-router-dom'

import {BackendProvider} from 'backend'
import {UserContextProvider} from 'services/users'

import NavigationLayout from 'components/NavigationLayout'
import {ToastContainer} from 'utils/toaster'

//, Routes, Route, Outlet, useParams, useLocation, useHref
import AppRoutes from './routes'

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
  </BackendProvider>
}

export default DanceOrganizer

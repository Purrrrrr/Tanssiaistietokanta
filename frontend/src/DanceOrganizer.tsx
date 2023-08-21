import React from 'react'
import { BrowserRouter} from 'react-router-dom'

import {BackendProvider} from 'backend'
import {UserContextProvider} from 'services/users'

import NavigationLayout from 'components/NavigationLayout'
import {TranslationContext, translations} from 'i18n'
import {ToastContainer} from 'utils/toaster'

import AppRoutes from './routes'

function DanceOrganizer() {
  return <BackendProvider>
    <UserContextProvider>
      <TranslationContext languages={translations} defaultLanguage="fi">
        <BrowserRouter>
          <ToastContainer />
          <NavigationLayout>
            <AppRoutes/>
          </NavigationLayout>
        </BrowserRouter>
      </TranslationContext>
    </UserContextProvider>
  </BackendProvider>
}

export default DanceOrganizer

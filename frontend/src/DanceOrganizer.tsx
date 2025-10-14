import { BrowserRouter } from 'react-router-dom'

import { BackendProvider } from 'backend'
import { UserContextProvider } from 'services/users'

import { AlertContext } from 'libraries/overlays/AlertContext'
import { ToastContainer } from 'libraries/ui'
import NavigationLayout from 'components/NavigationLayout'
import { TranslationContext, translations } from 'i18n'

import AppRoutes from './routes'

function DanceOrganizer() {
  return <BackendProvider>
    <UserContextProvider>
      <TranslationContext languages={translations} defaultLanguage="fi">
        <BrowserRouter>
          <ToastContainer />
          <NavigationLayout>
            <AlertContext>
              <AppRoutes />
            </AlertContext>
          </NavigationLayout>
        </BrowserRouter>
      </TranslationContext>
    </UserContextProvider>
  </BackendProvider>
}

export default DanceOrganizer

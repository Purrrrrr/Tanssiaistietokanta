import { BrowserRouter } from 'react-router-dom'

import { BackendProvider } from 'backend'

import { AlertContext } from 'libraries/overlays/AlertContext'
import { ToastContainer } from 'libraries/ui'
import NavigationLayout from 'components/NavigationLayout'
import { TranslationContext, translations } from 'i18n'

import AppRoutes from './routes'

function DanceOrganizer() {
  return <BackendProvider>
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
  </BackendProvider>
}

export default DanceOrganizer

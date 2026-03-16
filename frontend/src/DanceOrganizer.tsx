import { BrowserRouter } from 'react-router-dom'

import { BackendProvider } from 'backend'

import { AlertContext } from 'libraries/overlays/AlertContext'
import { ToastContainer } from 'libraries/ui'
import NavigationLayout from 'components/NavigationLayout'
import { RightsContext } from 'components/rights/RightsContext'
import { TranslationContext, translations } from 'i18n'

import AppRoutes from './routes'

function DanceOrganizer() {
  return <TranslationContext languages={translations} defaultLanguage="fi">
    <BackendProvider>
      <RightsContext>
        <BrowserRouter>
          <ToastContainer />
          <AlertContext>
            <NavigationLayout>
              <AppRoutes />
            </NavigationLayout>
          </AlertContext>
        </BrowserRouter>
      </RightsContext>
    </BackendProvider>
  </TranslationContext>
}

export default DanceOrganizer

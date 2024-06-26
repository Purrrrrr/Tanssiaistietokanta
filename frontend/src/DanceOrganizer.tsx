import {lazy, Suspense} from 'react'
import { BrowserRouter} from 'react-router-dom'

import {BackendProvider} from 'backend'
import {UserContextProvider} from 'services/users'

import {LoadingState} from 'components/LoadingState'
import NavigationLayout from 'components/NavigationLayout'
import {TranslationContext, translations} from 'i18n'
import {ToastContainer} from 'utils/toaster'

const AppRoutes = lazy(() => import('./routes'))

function DanceOrganizer() {
  return <BackendProvider>
    <UserContextProvider>
      <TranslationContext languages={translations} defaultLanguage="fi">
        <BrowserRouter>
          <ToastContainer />
          <NavigationLayout>
            <Suspense fallback={<LoadingState loading />}>
              <AppRoutes/>
            </Suspense>
          </NavigationLayout>
        </BrowserRouter>
      </TranslationContext>
    </UserContextProvider>
  </BackendProvider>
}

export default DanceOrganizer

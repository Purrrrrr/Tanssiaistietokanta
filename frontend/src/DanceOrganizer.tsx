import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from 'routeTree.gen'

import { BackendProvider } from 'backend'

import { AlertContext } from 'libraries/overlays/AlertContext'
import { ToastContainer } from 'libraries/ui'
import { RightsContext } from 'components/rights/RightsContext'
import { TranslationContext, translations } from 'i18n'

function DanceOrganizer() {
  return <TranslationContext languages={translations} defaultLanguage="fi">
    <BackendProvider>
      <RightsContext>
        <ToastContainer />
        <AlertContext>
          <RouterProvider router={router} />
        </AlertContext>
      </RightsContext>
    </BackendProvider>
  </TranslationContext>
}
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default DanceOrganizer

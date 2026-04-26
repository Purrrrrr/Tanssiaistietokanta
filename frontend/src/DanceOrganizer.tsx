import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from 'routeTree.gen'

import { BackendProvider } from 'backend'
import { subscribeToAuthChanges } from 'backend/authentication'

import { TranslationProvider } from 'libraries/i18n'
import { AlertContext } from 'libraries/overlays/AlertContext'
import { ToastContainer } from 'libraries/ui'
import { RightsContext } from 'components/rights/RightsContext'
import { defaultContext, LoadingComponent, useAppRootContext } from 'utils/routeUtils'

function DanceOrganizer() {
  return <TranslationProvider defaultLanguage="fi">
    <BackendProvider>
      <RightsContext>
        <ToastContainer />
        <AlertContext>
          <Routes />
        </AlertContext>
      </RightsContext>
    </BackendProvider>
  </TranslationProvider>
}
const router = createRouter({
  routeTree,
  context: defaultContext,
  defaultPendingComponent: LoadingComponent,
  defaultPendingMs: 50,
})
subscribeToAuthChanges(() => router.invalidate())

function Routes() {
  return <RouterProvider router={router} context={useAppRootContext()} />
}

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default DanceOrganizer

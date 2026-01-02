import { Suspense } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'

import { useEvent } from 'services/events'

import { Breadcrumb } from 'libraries/ui'
import { lazyLoadComponent as lazy, LoadingState } from 'components/LoadingState'
import { LoginForm } from 'components/rights/LoginForm'
import { RequirePermissions } from 'components/rights/RequirePermissions'
import VersionableContentContainer from 'components/versioning/VersionableContentContainer'
import { T, useTranslation } from 'i18n'

const Dances = lazy(() => import('pages/dances'))
const Dance = lazy(() => import('pages/dances/Dance'))
const BallProgram = lazy(() => import('pages/events/BallProgram'))
const CreateEvent = lazy(() => import('pages/events/CreateEvent'))
const EventList = lazy(() => import('pages/events/EventList'))
const EventPage = lazy(() => import('pages/events/EventPage'))
const EventProgramPage = lazy(() => import('pages/events/EventProgramPage'))
const DanceCheatList = lazy(() => import('pages/events/print/DanceCheatList'))
const DanceInstructions = lazy(() => import('pages/events/print/DanceInstructions'))
const DanceList = lazy(() => import('pages/events/print/DanceList'))
const UiShowcase = lazy(() => import('libraries/ui-showcase'))

export default function MainRoutes() {
  return <>
    <Breadcrumb text={<><img className="mr-2" src="/fan32.png" alt="" />{' '}<T msg="app.title" /></>} />
    <Suspense>
      <Routes>
        <Route index element={<EventList />} />
        <Route path="login" element={<LoginForm redirectTo="/" />} />
        <Route path="ui-showcase" element={<UiShowcase />} />
        <Route path="events/new" element={<CreateEvent />} />
        <Route path="events/:eventId/version/:eventVersionId/*" element={<EventRoutes />} />
        <Route path="events/:eventId/*" element={<EventRoutes />} />
        <Route path="dances/*" element={<DanceRoutes />} />
      </Routes>
    </Suspense>
  </>
}

function DanceRoutes() {
  return <RequirePermissions right="dances:read" fallback="loginPage">
    <VersionableContentContainer>
      <Breadcrumb text={useTranslation('breadcrumbs.dances')} />
      <Routes>
        <Route index element={<Dances />} />
        <Route path=":danceId/version/:danceVersionId" element={<Dance />} />
        <Route path=":danceId" element={<Dance />} />
      </Routes>
    </VersionableContentContainer>
  </RequirePermissions>
}

function EventRoutes() {
  const { eventId, eventVersionId } = useParams()
  const [event, loadingState] = useEvent(eventId ?? '', eventVersionId)

  return <RequirePermissions right="events:read" fallback="loginPage">
    <VersionableContentContainer>
      {event
        ? <>
          <Breadcrumb text={event.name} />
          <Routes>
            <Route index element={<EventPage event={event} />} />
            <Route path="program/*" element={<EventProgramRoutes event={event} />} />
            <Route path="ball-program/:slideId?" element={<BallProgram eventId={eventId} eventVersionId={eventVersionId} />} />
            <Route path="print/*" element={<EventPrintRoutes />} />
          </Routes>
        </>
        : <LoadingState {...loadingState} />
      }
    </VersionableContentContainer>
  </RequirePermissions>
}

function EventProgramRoutes({ event }) {
  return <RequirePermissions right="events:modify" fallback="loginPage">
    <Breadcrumb text={useTranslation('breadcrumbs.eventProgram')} />
    <Routes>
      <Route index element={<Navigate to="main" replace />} />
      <Route path=":tabId/:slideId?" element={<EventProgramPage event={event} />} />
      <Route path="dance/:danceId" element={<Dance parentType="eventProgram" />} />
    </Routes>
  </RequirePermissions>
}

function EventPrintRoutes() {
  const { eventId } = useParams()
  return <Routes>
    <Route path="ball-dancelist" element={<DanceList eventId={eventId} />} />
    <Route path="dance-cheatlist" element={<DanceCheatList eventId={eventId} />} />
    <Route path="dance-instructions" element={<DanceInstructions eventId={eventId} />} />
  </Routes>
}

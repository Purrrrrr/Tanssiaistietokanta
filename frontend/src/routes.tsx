import {Suspense} from 'react'
import {Route, Routes, useParams} from 'react-router-dom'

import {useEvent} from 'services/events'
import {AdminOnly} from 'services/users'

import {Breadcrumb} from 'libraries/ui'
import {lazyLoadComponent as lazy, LoadingState} from 'components/LoadingState'
import VersionableContentContainer from 'components/versioning/VersionableContentContainer'
import {T, useTranslation} from 'i18n'

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

export default function MainRoutes() {
  return <>
    <Breadcrumb text={<><img src="/fan32.png" alt=""/>{' '}<T msg="app.title"/></>} />
    <Suspense>
      <Routes>
        <Route index element={<EventList/>} />
        <Route path="events/new" element={<CreateEvent/>} />
        <Route path="events/:eventId/version/:eventVersionId/*" element={<EventRoutes/>} />
        <Route path="events/:eventId/*" element={<EventRoutes/>} />
        <Route path="dances/*" element={<DanceRoutes/>} />
      </Routes>
    </Suspense>
  </>
}

function DanceRoutes() {
  return <>
    <Breadcrumb text={useTranslation('breadcrumbs.dances')} />
    <Routes>
      <Route index element={<Dances/>} />
      <Route path=":danceId" element={<Dance/>} />
    </Routes>
  </>
}

function EventRoutes() {
  const {eventId, eventVersionId} = useParams()
  const [event, loadingState] = useEvent(eventId ?? '', eventVersionId)

  return <VersionableContentContainer>
    {event
      ? <>
        <Breadcrumb text={event.name} />
        <Routes>
          <Route index element={<EventPage event={event}/>} />
          <Route path="program/*" element={<EventProgramRoutes event={event}/>} />
          <Route path="ball-program/*" element={<BallProgram eventId={eventId} eventVersionId={eventVersionId} />} />
          <Route path="print/*" element={<EventPrintRoutes />} />
        </Routes>
      </>
      : <LoadingState {...loadingState} />
    }
  </VersionableContentContainer>
}

function EventProgramRoutes({event}) {
  return <AdminOnly fallback={useTranslation('pages.events.eventProgramPage.loginRequired')}>
    <Breadcrumb text={useTranslation('breadcrumbs.eventProgram')} />
    <Routes>
      <Route index element={<EventProgramPage event={event}/>} />
      <Route path=":danceId" element={<Dance parentType='eventProgram'/>} />
    </Routes>
  </AdminOnly>
}

function EventPrintRoutes() {
  const {eventId} = useParams()
  return <Routes>
    <Route path="ball-dancelist" element={<DanceList eventId={eventId}/>} />
    <Route path="dance-cheatlist" element={<DanceCheatList eventId={eventId}/>} />
    <Route path="dance-instructions" element={<DanceInstructions eventId={eventId} />} />
  </Routes>
}

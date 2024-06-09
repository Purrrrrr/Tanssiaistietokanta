import React from 'react'
import {Route, Routes, useParams} from 'react-router-dom'

import {useEvent} from 'services/events'
import {AdminOnly} from 'services/users'

import {Breadcrumb} from 'libraries/ui'
import {LoadingState} from 'components/LoadingState'
import {T, useTranslation} from 'i18n'
import Dances from 'pages/dances'
import Dance from 'pages/dances/Dance'
import BallProgram from 'pages/events/BallProgram'
import CreateEvent from 'pages/events/CreateEvent'
import EventList from 'pages/events/EventList'
import EventPage from 'pages/events/EventPage'
import EventProgramPage from 'pages/events/EventProgramPage'
import DanceCheatList from 'pages/events/print/DanceCheatList'
import DanceInstructions from 'pages/events/print/DanceInstructions'
import DanceList from 'pages/events/print/DanceList'

export default function MainRoutes() {
  return <>
    <Breadcrumb text={<><img src="/fan32.png" alt=""/>{' '}<T msg="app.title"/></>} />
    <Routes>
      <Route index element={<EventList/>} />
      <Route path="events/new" element={<CreateEvent/>} />
      <Route path="events/:eventId/*" element={<EventRoutes/>} />
      <Route path="dances/*" element={<DanceRoutes/>} />
    </Routes>
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
  const {eventId} = useParams()
  const [event, loadingState] = useEvent(eventId)

  if (!event) return <LoadingState {...loadingState} />

  return <>
    <Breadcrumb text={event.name} />
    <Routes>
      <Route index element={<EventPage event={event}/>} />
      <Route path="program/*" element={<EventProgramRoutes event={event}/>} />
      <Route path="ball-program/*" element={<BallProgram eventId={eventId}/>} />
      <Route path="print/*" element={<EventPrintRoutes />} />
    </Routes>
  </>
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

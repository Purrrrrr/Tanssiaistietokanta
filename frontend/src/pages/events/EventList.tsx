import {useDeleteEvent, useEvents} from 'services/events'

import {DeleteButton} from 'components/widgets/DeleteButton'
import {Link} from 'react-router-dom'
import {NavigateButton} from 'components/widgets/NavigateButton'
import {PageTitle} from 'components/PageTitle'
import {AdminOnly} from 'services/users'
import React from 'react'

export default function EventList() {
  const [events] = useEvents()
  const [deleteEvent] = useDeleteEvent({refetchQueries: ['getEvent', 'getEvents']})

  return <>
    <PageTitle>Tanssiaistietokanta</PageTitle>
    <p>Kannassa on tällä hetkellä {events.length} tanssitapahtumaa.</p>
    <AdminOnly>
      <p>Voit muokata tanssitapahtumien tansseja <Link to="/dances">tanssitietokannasta</Link></p>
    </AdminOnly>
    <h2>Tanssitapahtumia</h2>
    {events.map(event =>
      <h2 key={event._id}>
        <Link to={'events/'+event._id} >{event.name}</Link>
        <DeleteButton onDelete={() => deleteEvent(event._id)}
          style={{float: 'right'}} text="Poista"
          confirmText={'Haluatko varmasti poistaa tapahtuman '+event.name+'?'}
        />
      </h2>
    )}
    <NavigateButton adminOnly intent="primary" href="events/new" text="Uusi tapahtuma" />
  </>
}

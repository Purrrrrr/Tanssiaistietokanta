import React from 'react'
import {Link} from 'react-router-dom'

import {useDeleteEvent, useEvents} from 'services/events'
import {AdminOnly} from 'services/users'

import {PageTitle} from 'components/PageTitle'
import {DeleteButton} from 'components/widgets/DeleteButton'
import {NavigateButton} from 'components/widgets/NavigateButton'

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
        <DeleteButton onDelete={() => deleteEvent({id: event._id})}
          style={{float: 'right'}} text="Poista"
          confirmText={'Haluatko varmasti poistaa tapahtuman '+event.name+'?'}
        />
      </h2>
    )}
    <NavigateButton adminOnly intent="primary" href="events/new" text="Uusi tapahtuma" />
  </>
}

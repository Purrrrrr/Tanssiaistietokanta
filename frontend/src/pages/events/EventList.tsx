import React from 'react'
import {Link} from 'react-router-dom'

import {useDeleteEvent, useEvents} from 'services/events'
import {AdminOnly} from 'services/users'

import {PageTitle} from 'components/PageTitle'
import {DeleteButton} from 'components/widgets/DeleteButton'
import {NavigateButton} from 'components/widgets/NavigateButton'
import { useT } from 'i18n'

export default function EventList() {
  const t = useT('pages.events.eventList', 'common')
  const [events] = useEvents()
  const [deleteEvent] = useDeleteEvent({refetchQueries: ['getEvent', 'getEvents']})

  return <>
    <PageTitle>{t('pageTitle')}</PageTitle>
    <p>{t('weHaveXEvents', {count: events.length})}</p>
    <AdminOnly>
      <p>{t('youcanEditDancesIn')} <Link to="/dances">{t('danceDatabaseLinkName')}</Link></p>
    </AdminOnly>
    <h2>{t('danceEvents')}</h2>
    {events.map(event =>
      <h2 key={event._id}>
        <Link to={'events/'+event._id} >{event.name}</Link>
        <DeleteButton onDelete={() => deleteEvent({id: event._id})}
          style={{float: 'right'}} text={t('delete')}
          confirmText={t('eventDeleteConfirmation', {eventName: event.name})}
        />
      </h2>
    )}
    <NavigateButton adminOnly intent="primary" href="events/new" text={t('createEvent')} />
  </>
}

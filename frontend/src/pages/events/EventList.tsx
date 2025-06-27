import {useDeleteEvent, useEvents} from 'services/events'
import {AdminOnly} from 'services/users'

import {Link} from 'libraries/ui'
import { LoadingState } from 'components/LoadingState'
import {PageTitle} from 'components/PageTitle'
import {DeleteButton} from 'components/widgets/DeleteButton'
import {NavigateButton} from 'components/widgets/NavigateButton'
import { useT, useTranslation } from 'i18n'

export default function EventList() {
  const t = useT('pages.events.eventList')
  const deleteText = useTranslation('common.delete')
  const [events, requestState] = useEvents()
  const [deleteEvent] = useDeleteEvent({refetchQueries: ['getEvents']})

  return <>
    <PageTitle>{t('pageTitle')}</PageTitle>
    <LoadingState {...requestState} />
    <p>{t('weHaveXEvents', {count: events.length})}</p>
    <AdminOnly>
      <p>{t('youcanEditDancesIn')} <Link to="/dances">{t('danceDatabaseLinkName')}</Link></p>
    </AdminOnly>
    <h2>{t('danceEvents')}</h2>
    <ul className="mb-4 border-gray-100 border-1">
      {events.map(event =>
        <li key={event._id} className="flex justify-between items-center p-2 even:bg-gray-100">
          <Link className="grow" to={'events/'+event._id} >{event.name}</Link>
          <DeleteButton onDelete={() => deleteEvent({id: event._id})}
            text={deleteText}
            confirmText={t('eventDeleteConfirmation', {eventName: event.name})}
          />
        </li>
      )}
    </ul>
    <NavigateButton adminOnly color="primary" href="events/new" text={t('createEvent')} />
  </>
}

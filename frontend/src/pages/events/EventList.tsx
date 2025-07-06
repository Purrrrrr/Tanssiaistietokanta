import {useDeleteEvent, useEvents} from 'services/events'
import {AdminOnly} from 'services/users'

import { useFormatDate } from 'libraries/i18n/dateTime'
import {Link} from 'libraries/ui'
import ItemList from 'libraries/ui/ItemList'
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
  const formatDate = useFormatDate()

  return <>
    <PageTitle>{t('pageTitle')}</PageTitle>
    <LoadingState {...requestState} />
    <p>{t('weHaveXEvents', {count: events.length})}</p>
    <AdminOnly>
      <p>{t('youcanEditDancesIn')} <Link to="/dances">{t('danceDatabaseLinkName')}</Link></p>
    </AdminOnly>
    <h2>{t('danceEvents')}</h2>
    <ItemList columns="grid-cols-[1fr_minmax(min(300px,30%),max-content)_max-content] gap-x-4">
      {events.map(event =>
        <ItemList.Row key={event._id}>
          <Link to={'events/'+event._id} >{event.name}</Link>
          <div>
            {formatDate(event.beginDate)} - {formatDate(event.endDate)}
          </div>
          <div className="text-right">
            <DeleteButton onDelete={() => deleteEvent({id: event._id})}
              minimal
              text={deleteText}
              confirmText={t('eventDeleteConfirmation', {eventName: event.name})}
            />
          </div>
        </ItemList.Row>
      )}
    </ItemList>
    <NavigateButton adminOnly color="primary" href="events/new" text={t('createEvent')} />
  </>
}

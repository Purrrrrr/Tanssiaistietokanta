import { useEvents } from 'services/events'

import { useFormatDate } from 'libraries/i18n/dateTime'
import { H2, ItemList, Link } from 'libraries/ui'
import { LoadingState } from 'components/LoadingState'
import { PageTitle } from 'components/PageTitle'
import { RequirePermissions } from 'components/rights/RequirePermissions'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { useT } from 'i18n'

export default function EventList() {
  const t = useT('pages.events.eventList')
  const [events, requestState] = useEvents()
  const formatDate = useFormatDate()

  return <>
    <PageTitle>{t('pageTitle')}</PageTitle>
    <LoadingState {...requestState} />
    <p>{t('weHaveXEvents', { count: events.length })}</p>
    <RequirePermissions right="dances:read">
      <p>{t('youcanEditDancesIn')} <Link to="/dances">{t('danceDatabaseLinkName')}</Link></p>
    </RequirePermissions>
    <H2>{t('danceEvents')}</H2>
    <ItemList columns="grid-cols-[1fr_max-content] gap-x-4" items={events} emptyText={t('noEvents')} className="max-w-200" wrap-breakpoint="none">
      <ItemList.Header>
        <span>{t('name')}</span>
        <span>{t('date')}</span>
      </ItemList.Header>
      {events.map(event =>
        <ItemList.Row key={event._id}>
          <Link to={'events/' + event._id}>{event.name}</Link>
          <div>
            {formatDate(event.beginDate)} - {formatDate(event.endDate)}
          </div>
        </ItemList.Row>,
      )}
    </ItemList>
    <NavigateButton requireRight="events:create" color="primary" href="events/new" text={t('createEvent')} />
  </>
}

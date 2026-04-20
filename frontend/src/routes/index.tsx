import { createFileRoute } from '@tanstack/react-router'

import { useEvents } from 'services/events'
import { useCurrentUser } from 'services/users'

import { RequirePermissions } from 'libraries/access-control'
import { useFormatDate } from 'libraries/i18n/dateTime'
import { ItemList, Link } from 'libraries/ui'
import { Add } from 'libraries/ui/icons'
import { LoadingState } from 'components/LoadingState'
import { Page } from 'components/Page'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { PageSection } from 'components/widgets/PageSection'
import { useT } from 'i18n'

export const Route = createFileRoute('/')({
  component: EventList,
  staticData: {
    usesRights: ['dances:list', 'events:list', 'events:create'],
  },
})

function EventList() {
  const t = useT('routes.events.list')
  const [events, requestState] = useEvents()
  const formatDate = useFormatDate()
  const user = useCurrentUser()

  return <Page title={t('pageTitle')}>
    <LoadingState {...requestState} />
    <div className="mb-6">
      {t('welcomeMessage.message')}
      <RequirePermissions requireRight="dances:list">
        {t('welcomeMessage.danceInstructionsPostfix')}
        <Link to="/dances">{t('welcomeMessage.danceInstructions')}</Link>
      </RequirePermissions>.
    </div>
    <PageSection
      title={t('danceEvents')}
      className="max-w-230"
    >
      {!user && <p>
        {' '}
        {t('loginToEdit.moveTo')}
        <Link to="/login">{t('loginToEdit.loginPage')}</Link>
        {t('loginToEdit.toEdit')}
      </p>}
      <RequirePermissions requireRight="events:list">
        <div className="mb-2 flex justify-between items-center">
          <div>{t('weHaveXEvents', { count: events.length })}</div>
          <NavigateButton requireRight="events:create" to="/events/new" icon={<Add />} text={t('createEvent')} />
        </div>
        <ItemList columns="grid-cols-[1fr_max-content] gap-x-4" items={events} emptyText={t('noEvents')} wrap-breakpoint="none">
          <ItemList.Header>
            <span>{t('name')}</span>
            <span>{t('date')}</span>
          </ItemList.Header>
          {events.map(event =>
            <ItemList.Row key={event._id}>
              <Link to="/events/$eventId/{-$eventVersionId}" params={{ eventId: event._id }}>{event.name}</Link>
              <div>
                {formatDate(event.beginDate)} - {formatDate(event.endDate)}
              </div>
            </ItemList.Row>,
          )}
        </ItemList>
      </RequirePermissions>
    </PageSection>
  </Page>
}

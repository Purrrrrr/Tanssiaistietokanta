import { Event } from 'types'

import { EventProgramEditor } from 'components/event/EventProgramEditor'
import { PageTitle } from 'components/PageTitle'
import { RequirePermissions } from 'components/rights/RequirePermissions'
import { useT } from 'i18n'

export default function EventProgramEditorPage({ event }: { event: Event }) {
  const t = useT('pages.events.eventProgramPage')
  return <>
    <PageTitle noRender>{t('pageTitle')}</PageTitle>
    <RequirePermissions right="events:read,modify" fallback="loginPage">
      <EventProgramEditor event={event} />
    </RequirePermissions>
  </>
}

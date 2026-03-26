import { createFileRoute, Outlet, useChildMatches } from '@tanstack/react-router'

import { SyncStatus } from 'libraries/forms'
import { TabLink, Tabs } from 'libraries/ui'
import {
  MissingDanceInstructionsCounterTag,
} from 'components/event/EventProgramEditor/components'
import {
  Form,
  useEventProgramEditorForm,
} from 'components/event/EventProgramForm'
import { EventMetadataContext } from 'components/event/EventProgramForm/eventMetadata'
import { PageTitle } from 'components/PageTitle'
import { BackLink } from 'components/widgets/BackLink'
import { useT } from 'i18n'

import { useCurrentEvent } from '../-context'

import 'components/event/EventProgramEditor/EventProgramEditor.sass'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/program',
)({
  component: RouteComponent,
  staticData: {
    requireRights: ({ eventId }) => ({
      rights: 'events:read,modify',
      entityId: eventId,
    }),
  },
})

function RouteComponent() {
  const t = useT('pages.events.eventProgramPage')
  const event = useCurrentEvent()
  const { formProps, formProps: { value }, state } = useEventProgramEditorForm(event._id, event._versionId ?? undefined, event.program)

  const [child] = useChildMatches()
  const tabId = child.id.endsWith('main') ? 'main' : 'slides'

  return <Form {...formProps} className="eventProgramEditor">
    <PageTitle noRender>{t('pageTitle')}</PageTitle>
    <BackLink from="/events/$eventId/{-$eventVersionId}/program" to="..">{t('backToEvent')}</BackLink>
    <h1>
      {t('pageTitle')}
      <SyncStatus style={{ marginLeft: '1ch', top: '3px' }} className="grow" state={state} />
    </h1>
    <EventMetadataContext program={value} workshops={event.workshops}>
      <Tabs id="programEditorTabs" renderActiveTabPanelOnly selectedTabId={tabId ?? 'main'}>
        <TabLink
          id="main"
          from={Route.id}
          to="main"
          title={t('tabs.main')}
          panel={<Outlet />}
        />
        <TabLink
          id="slides"
          from={Route.id}
          to="slides/{-$slideId}"
          params={{ }}
          title={<>
            {t('tabs.slides')}
            <MissingDanceInstructionsCounterTag />
          </>}
          panel={<Outlet />}
        />
      </Tabs>
    </EventMetadataContext>
  </Form>
}

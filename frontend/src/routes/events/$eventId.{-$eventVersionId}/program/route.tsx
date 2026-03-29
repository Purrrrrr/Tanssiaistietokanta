import { createFileRoute, Outlet } from '@tanstack/react-router'

import { SyncStatus } from 'libraries/forms'
import {
  Form,
  useEventProgramEditorForm,
} from 'components/event/EventProgramForm'
import { EventMetadataContext } from 'components/event/EventProgramForm/eventMetadata'

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
  const event = useCurrentEvent()
  const { formProps, formProps: { value }, state } = useEventProgramEditorForm(event._id, event._versionId ?? undefined, event.program)

  return <Form {...formProps} className="eventProgramEditor">
    <SyncStatus floatRight className="grow" state={state} />
    <EventMetadataContext program={value} workshops={event.workshops}>
      <Outlet />
    </EventMetadataContext>
  </Form>
}

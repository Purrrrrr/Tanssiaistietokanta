import { createFileRoute } from '@tanstack/react-router'

import { DocumentEditPage } from 'components/document/DocumentEditPage'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/workshops/$workshopId/documents/$documentId/edit',
)({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'routes.events.event.documents.document.edit.breadcrumb',
  },
})

function RouteComponent() {
  const { documentId } = Route.useParams()

  return <DocumentEditPage documentId={documentId} />
}

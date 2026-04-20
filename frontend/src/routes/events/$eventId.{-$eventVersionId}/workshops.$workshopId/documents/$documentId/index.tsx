import { createFileRoute } from '@tanstack/react-router'

import { DocumenViewPage } from 'components/document/DocumentViewPage'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/workshops/$workshopId/documents/$documentId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  return <DocumenViewPage documentId={params.documentId} />
}

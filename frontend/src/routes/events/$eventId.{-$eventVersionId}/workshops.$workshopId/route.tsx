import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { Breadcrumb } from 'libraries/ui'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/workshops/$workshopId',
)({
  staticData: {
    requireRights: ({ eventId }) => ({
      rights: 'workshops:modify',
      owner: 'events',
      owningId: eventId,
    }),
    breadcrumb: BreadcrumbComponent,
  },
})

function BreadcrumbComponent() {
  const event = getRouteApi('/events/$eventId/{-$eventVersionId}').useLoaderData()?.event
  const params = Route.useParams()
  const workshop = event?.workshops.find(w => w._id === params.workshopId)

  return <Breadcrumb
    to="/events/$eventId/{-$eventVersionId}/workshops/$workshopId"
    params={params}
    text={workshop?.name ?? '-'}
  />
}

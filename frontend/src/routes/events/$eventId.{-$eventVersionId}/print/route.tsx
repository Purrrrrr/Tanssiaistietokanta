import { createFileRoute, Outlet } from '@tanstack/react-router'

import { RequirePermissions } from 'components/rights/RequirePermissions'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/print',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { eventId } = Route.useParams()
  return <RequirePermissions requireRight="events:read" entityId={eventId}>
    <Outlet />
  </RequirePermissions>
}

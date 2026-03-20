import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/events/$eventId/version/$eventVersionId',
)({
  loader: ({ params }) => {
    throw redirect({
      to: '/events/$eventId/{-$eventVersionId}',
      params: { eventId: params.eventId, eventVersionId: params.eventVersionId },
    })
  },
})

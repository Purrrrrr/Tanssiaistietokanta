import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/dances/$danceId/version/$danceVersionId',
)({
  loader: ({ params }) => {
    throw redirect({
      to: '/dances/$danceId',
      params: { danceId: params.danceId },
      search: { versionId: params.danceVersionId },
    })
  },
})

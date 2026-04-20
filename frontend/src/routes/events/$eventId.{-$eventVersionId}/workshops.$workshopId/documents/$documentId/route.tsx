import { createFileRoute } from '@tanstack/react-router'

import { useDocument } from 'services/documents'

import { Breadcrumb } from 'libraries/ui'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/workshops/$workshopId/documents/$documentId',
)({
  loader: async ({ params: { workshopId, documentId }, context: { queryClient } }) => {
    const { data: { document } } = await queryClient.query({
      query: useDocument.query,
      variables: { id: documentId },
    })
    if (
      (document?.owningId !== workshopId || document?.owner !== 'workshops')
    ) {
      throw new Response('Document not found', { status: 404 })
    }
    return { document }
  },
  staticData: {
    requireRights: ({ documentId }) => ({
      rights: 'documents:read',
      entityId: documentId,
    }),
    usesRights: ({ documentId }) => ({
      rights: ['documents:modify', 'documents:delete'],
      entityId: documentId,
    }),
    breadcrumb: RouteBreadcrumb,
  },
})

function RouteBreadcrumb() {
  const { eventId, eventVersionId, documentId } = Route.useParams()
  const document = Route.useLoaderData()?.document

  return <Breadcrumb
    to="/events/$eventId/{-$eventVersionId}/documents/$documentId"
    params={{ eventId, eventVersionId, documentId }}
    text={document?.title ?? '-'}
  />
}

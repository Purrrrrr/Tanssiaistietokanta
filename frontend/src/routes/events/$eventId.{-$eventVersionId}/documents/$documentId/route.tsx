import { createFileRoute } from '@tanstack/react-router'

import { useDocument } from 'services/documents'

import { Breadcrumb } from 'libraries/ui'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/documents/$documentId',
)({
  loader: async ({ params: { eventId, documentId }, context: { queryClient } }) => {
    const { data: { document } } = await queryClient.query({
      query: useDocument.query,
      variables: { id: documentId },
    })
    if (
      (document?.owningId !== eventId || document?.owner !== 'events')
      &&
      // TODO: we should probably also check that the workshop belongs to the event, but that would require fetching the workshop here, which is a bit more work. For now we can just rely on the fact that the UI won't show links to documents that don't belong to the event
      (document?.owner !== 'workshops')
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

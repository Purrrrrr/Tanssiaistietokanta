import { createFileRoute } from '@tanstack/react-router'

import { useDocument } from 'services/documents'

import { DocumentViewer } from 'libraries/lexical/DocumentViewer'
import { H2 } from 'libraries/ui'
import { Edit } from 'libraries/ui/icons'
import { DeleteDocumentButton } from 'components/document/DeleteDocumentButton'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { useT } from 'i18n'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/documents/$documentId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  const t = useT('routes.events.event.documents.document')
  const result = useDocument({ id: params.documentId })
  if (!result.data?.document) return null
  const { document } = result.data

  return <>
    <div className="flex items-start justify-between">
      <H2>{document.title}</H2>
      <div>
        <NavigateButton
          minimal
          color="primary"
          to="/events/$eventId/{-$eventVersionId}/documents/$documentId/edit"
          params={params}
          icon={<Edit />}
          text={t('editDocument')}
        />
        <DeleteDocumentButton minimal documentId={document._id} />
      </div>
    </div>
    <DocumentViewer document={document.content} />
  </>
}
